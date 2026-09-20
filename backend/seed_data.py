from database import SessionLocal
from models import City


cities = [
    {
        "name": "Chandigarh",
        "state": "Chandigarh"
    },
    {
        "name": "Mohali",
        "state": "Punjab"
    },
    {
        "name": "Panchkula",
        "state": "Haryana"
    },
    {
        "name": "Ludhiana",
        "state": "Punjab"
    },
    {
        "name": "Amritsar",
        "state": "Punjab"
    },
    {
        "name": "Jalandhar",
        "state": "Punjab"
    },
    {
        "name": "Patiala",
        "state": "Punjab"
    },
    {
        "name": "Bathinda",
        "state": "Punjab"
    }
]


db = SessionLocal()


try:

    for city_data in cities:

        existing_city = (
            db.query(City)
            .filter(
                City.name == city_data["name"]
            )
            .first()
        )

        if existing_city:

            print(
                f"{city_data['name']} already exists."
            )

        else:

            new_city = City(
                name=city_data["name"],
                state=city_data["state"],
                is_active="true"
            )

            db.add(new_city)

            print(
                f"Added {city_data['name']}"
            )


    db.commit()

    print()
    print("8-city seed process completed!")


except Exception as error:

    db.rollback()

    print("Error:", error)


finally:

    db.close()