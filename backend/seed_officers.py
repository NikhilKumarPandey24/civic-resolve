from database import SessionLocal

from models import Officer
from models import Department
from models import City


officers = [

    {
        "officer_id": "OFF-1001",
        "name": "Raj Kumar",
        "email": "raj.kumar@civicresolve.gov",
        "department": "Public Works",
        "city": "Chandigarh"
    },

    {
        "officer_id": "OFF-1002",
        "name": "Amit Sharma",
        "email": "amit.sharma@civicresolve.gov",
        "department": "Sanitation",
        "city": "Chandigarh"
    },

    {
        "officer_id": "OFF-1003",
        "name": "Neha Singh",
        "email": "neha.singh@civicresolve.gov",
        "department": "Water Supply",
        "city": "Chandigarh"
    },

    {
        "officer_id": "OFF-1004",
        "name": "Vikas Verma",
        "email": "vikas.verma@civicresolve.gov",
        "department": "Electrical",
        "city": "Chandigarh"
    }

]


db = SessionLocal()


try:

    for officer_data in officers:

        department = (
            db.query(Department)
            .filter(
                Department.name ==
                officer_data["department"]
            )
            .first()
        )

        city = (
            db.query(City)
            .filter(
                City.name ==
                officer_data["city"]
            )
            .first()
        )


        if not department:

            print(
                "Department not found:",
                officer_data["department"]
            )

            continue


        if not city:

            print(
                "City not found:",
                officer_data["city"]
            )

            continue


        existing = (
            db.query(Officer)
            .filter(
                Officer.officer_id ==
                officer_data["officer_id"]
            )
            .first()
        )


        if existing:

            print(
                f"{officer_data['officer_id']} already exists."
            )

            continue


        officer = Officer(

            officer_id=
                officer_data["officer_id"],

            name=
                officer_data["name"],

            email=
                officer_data["email"],

            department_id=
                department.id,

            city_id=
                city.id,

            is_active="true"

        )


        db.add(officer)

        print(
            f"Added officer: "
            f"{officer_data['name']}"
        )


    db.commit()

    print(
        "Officer seed completed!"
    )


except Exception as error:

    db.rollback()

    print(
        "Error:",
        error
    )


finally:

    db.close()