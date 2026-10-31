import re

from sqlalchemy import inspect, text

from database import engine
from models import ComplaintImage


LOCATION_MARKER = "[[CIVIC_LOCATION]]"
COORDINATE_PATTERN = re.compile(
    r"\s+Map coordinates:\s*(-?\d+(?:\.\d+)?)\s*,\s*"
    r"(-?\d+(?:\.\d+)?)(?:\s|$)",
    re.IGNORECASE,
)
ADDRESS_PATTERN = re.compile(
    r"\s+Nearby landmark or address:\s*([\s\S]*?)"
    r"(?=\s+Map coordinates:|$)",
    re.IGNORECASE,
)


def parse_legacy_location(description):
    marker_index = description.rfind(LOCATION_MARKER)

    if marker_index >= 0:
        clean_description = description[:marker_index].strip()
        lines = description[marker_index + len(LOCATION_MARKER):].splitlines()
        address = None
        latitude = None
        longitude = None

        for line in lines:
            address_match = re.match(r"^Nearby landmark or address:\s*(.*)$", line, re.IGNORECASE)
            coordinate_match = re.match(
                r"^Map coordinates:\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$",
                line,
                re.IGNORECASE,
            )
            if address_match:
                address = address_match.group(1).strip()
            if coordinate_match:
                latitude = float(coordinate_match.group(1))
                longitude = float(coordinate_match.group(2))

        if not _valid_coordinates(latitude, longitude):
            latitude = None
            longitude = None
        if not _valid_location(address, latitude, longitude):
            return None
        return clean_description, address[:250] if address else None, latitude, longitude

    address_match = ADDRESS_PATTERN.search(description)
    coordinate_match = COORDINATE_PATTERN.search(description)
    if not address_match and not coordinate_match:
        return None

    address = address_match.group(1).strip() if address_match else None
    latitude = float(coordinate_match.group(1)) if coordinate_match else None
    longitude = float(coordinate_match.group(2)) if coordinate_match else None
    if not _valid_coordinates(latitude, longitude):
        latitude = None
        longitude = None
    if not _valid_location(address, latitude, longitude):
        return None

    match_starts = [match.start() for match in (address_match, coordinate_match) if match]
    clean_description = description[:min(match_starts)].strip()
    return clean_description, address[:250] if address else None, latitude, longitude


def _valid_location(address, latitude, longitude):
    return bool(address) or _valid_coordinates(latitude, longitude)


def _valid_coordinates(latitude, longitude):
    return (
        latitude is not None
        and longitude is not None
        and -90 <= latitude <= 90
        and -180 <= longitude <= 180
    )


def migrate():
    with engine.begin() as connection:
        inspector = inspect(connection)
        tables = inspector.get_table_names()
        if "complaints" not in tables:
            raise RuntimeError("The complaints table does not exist. Run the base schema migration first.")

        columns = {column["name"] for column in inspector.get_columns("complaints")}
        if "officer_id" not in columns:
            connection.execute(text(
                "ALTER TABLE complaints ADD COLUMN officer_id INTEGER REFERENCES officers(id)"
            ))
            print("Added complaints.officer_id")

        for name, column_type in (
            ("location_address", "VARCHAR(250)"),
            ("latitude", "DOUBLE PRECISION"),
            ("longitude", "DOUBLE PRECISION"),
        ):
            if name not in columns:
                connection.execute(text(
                    f"ALTER TABLE complaints ADD COLUMN {name} {column_type}"
                ))
                print(f"Added complaints.{name}")

        ComplaintImage.__table__.create(connection, checkfirst=True)

        rows = connection.execute(text(
            "SELECT id, description FROM complaints "
            "WHERE description LIKE :marker "
            "OR description LIKE :coordinates "
            "OR description LIKE :address"
        ), {
            "marker": f"%{LOCATION_MARKER}%",
            "coordinates": "%Map coordinates:%",
            "address": "%Nearby landmark or address:%",
        }).mappings().all()

        migrated = 0
        for row in rows:
            parsed = parse_legacy_location(row["description"])
            if not parsed:
                continue
            clean_description, address, latitude, longitude = parsed
            connection.execute(text(
                "UPDATE complaints SET description = :description, "
                "location_address = :address, latitude = :latitude, longitude = :longitude "
                "WHERE id = :id"
            ), {
                "id": row["id"],
                "description": clean_description,
                "address": address,
                "latitude": latitude,
                "longitude": longitude,
            })
            migrated += 1

        if migrated:
            print(f"Moved location details out of {migrated} complaint descriptions")

        if connection.dialect.name == "postgresql":
            constraints = {
                constraint["name"]
                for constraint in inspect(connection).get_check_constraints("complaints")
            }
            constraint_name = "ck_complaint_location_coordinates"
            if constraint_name not in constraints:
                connection.execute(text(
                    "ALTER TABLE complaints ADD CONSTRAINT "
                    "ck_complaint_location_coordinates CHECK ("
                    "(latitude IS NULL AND longitude IS NULL) OR "
                    "(latitude IS NOT NULL AND longitude IS NOT NULL AND "
                    "latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180))"
                ))
                print("Added complaint coordinate validation constraint")

    print("Complaint location migration complete")


if __name__ == "__main__":
    migrate()
