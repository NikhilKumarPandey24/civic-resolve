from database import SessionLocal

from models import IssueCategory
from models import Department


categories = [

    {
        "name": "Road",
        "department": "Public Works"
    },

    {
        "name": "Garbage",
        "department": "Sanitation"
    },

    {
        "name": "Water",
        "department": "Water Supply"
    },

    {
        "name": "Streetlight",
        "department": "Electrical"
    },

    {
        "name": "Drainage",
        "department": "Drainage"
    },

    {
        "name": "Park",
        "department": "Parks & Horticulture"
    },

    {
        "name": "Other",
        "department": "General Civic Services"
    }

]


db = SessionLocal()


try:

    for category_data in categories:

        department = (
            db.query(Department)
            .filter(
                Department.name ==
                category_data["department"]
            )
            .first()
        )


        if not department:

            print(
                "Department not found:",
                category_data["department"]
            )

            continue


        existing_category = (
            db.query(IssueCategory)
            .filter(
                IssueCategory.name ==
                category_data["name"]
            )
            .first()
        )


        if existing_category:

            print(
                f"{category_data['name']} already exists."
            )

        else:

            new_category = IssueCategory(

                name=category_data["name"],

                department_id=department.id,

                is_active="true"

            )

            db.add(new_category)

            print(
                f"Added {category_data['name']} "
                f"→ {department.name}"
            )


    db.commit()

    print()
    print(
        "Issue category seed completed!"
    )


except Exception as error:

    db.rollback()

    print(
        "Error:",
        error
    )


finally:

    db.close()