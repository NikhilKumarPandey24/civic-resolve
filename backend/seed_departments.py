from database import SessionLocal
from models import Department


departments = [

    {
        "name": "Public Works",
        "description":
            "Responsible for roads, streets and public infrastructure."
    },

    {
        "name": "Sanitation",
        "description":
            "Responsible for garbage collection and cleanliness."
    },

    {
        "name": "Water Supply",
        "description":
            "Responsible for water supply and related issues."
    },

    {
        "name": "Electrical",
        "description":
            "Responsible for streetlights and public electrical infrastructure."
    },

    {
        "name": "Drainage",
        "description":
            "Responsible for drainage and sewer-related civic issues."
    },

    {
        "name": "Parks & Horticulture",
        "description":
            "Responsible for public parks, gardens and green spaces."
    },

    {
        "name": "General Civic Services",
        "description":
            "Handles civic issues that do not belong to another department."
    }

]


db = SessionLocal()


try:

    for department_data in departments:

        existing_department = (
            db.query(Department)
            .filter(
                Department.name ==
                department_data["name"]
            )
            .first()
        )


        if existing_department:

            print(
                f"{department_data['name']} already exists."
            )

        else:

            new_department = Department(

                name=department_data["name"],

                description=
                    department_data["description"],

                is_active="true"

            )

            db.add(new_department)

            print(
                f"Added {department_data['name']}"
            )


    db.commit()

    print()
    print(
        "Department seed process completed!"
    )


except Exception as error:

    db.rollback()

    print(
        "Error:",
        error
    )


finally:

    db.close()