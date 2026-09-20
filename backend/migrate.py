from sqlalchemy import text
from database import engine

# Add officer_id column to complaints table if it doesn't exist
with engine.connect() as connection:
    try:
        connection.execute(text("""
            ALTER TABLE complaints
            ADD COLUMN officer_id INTEGER REFERENCES officers(id)
        """))
        connection.commit()
        print("✓ Successfully added officer_id column to complaints table")
    except Exception as e:
        print(f"Column may already exist or error occurred: {e}")
