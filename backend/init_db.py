import os
import sys

# ensures Python can find app.py in the same backend folder.
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from app import app, db

def init_db():
    with app.app_context():
        print("Dropping all existing tables...")
        db.drop_all()
        print("Creating all tables...")
        db.create_all()
        
        # Verify tables were created
        from app import User, Content
        tables = db.engine.table_names()
        expected_tables = ['user', 'content']
        for table in expected_tables:
            if table not in tables:
                print(f"Warning: Table '{table}' was not created!")
            else:
                print(f"Table '{table}' created successfully")
        
        print("Database initialized successfully!")

if __name__ == "__main__":
    # Create the instance folder if it doesn't exist
    if not os.path.exists('instance'):
        os.makedirs('instance')
    print("Starting database initialization...")
    init_db() 