from sqlalchemy.orm import Session
from database import SessionLocal, engine, create_tables
from models.user import User
from models.review import Review
import uuid

def create_demo_user():
    """Create a demo user for testing purposes"""
    
    # Create tables first
    create_tables()
    
    db = SessionLocal()
    try:
        # Check if demo user already exists with a proper UUID
        demo_user_id = uuid.UUID('12345678-1234-5678-9012-123456789012')  # Fixed UUID for demo
        existing_user = db.query(User).filter(User.id == demo_user_id).first()
        
        if not existing_user:
            # Create demo user
            demo_user = User(
                id=demo_user_id,
                username='demo_user',
                email='demo@moview.com',
                password='hashed_demo_password'  # In real app, this would be properly hashed
            )
            
            db.add(demo_user)
            db.commit()
            print("Demo user created successfully!")
        else:
            print("Demo user already exists!")
            
    except Exception as e:
        print(f"Error creating demo user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_demo_user() 