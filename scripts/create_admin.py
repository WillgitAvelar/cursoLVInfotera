import sys
sys.path.append('/app/backend')

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from pathlib import Path
from dotenv import load_dotenv
import bcrypt

# Load environment variables
ROOT_DIR = Path('/app/backend')
load_dotenv(ROOT_DIR / '.env')

async def create_admin_user():
    # MongoDB connection
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Check if admin already exists
    existing_admin = await db.users.find_one({"email": "admin@litoralverde.com.br"})
    
    if existing_admin:
        print("✓ Admin user already exists!")
        print(f"  Email: admin@litoralverde.com.br")
        return
    
    # Create admin user
    password = "admin123"
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    admin_user = {
        "id": "admin-001",
        "email": "admin@litoralverde.com.br",
        "name": "Administrador",
        "password_hash": password_hash,
        "role": "admin",
        "created_at": "2025-01-01T00:00:00"
    }
    
    await db.users.insert_one(admin_user)
    
    print("✓ Admin user created successfully!")
    print(f"  Email: admin@litoralverde.com.br")
    print(f"  Password: {password}")
    print("\n⚠️  IMPORTANT: Change this password after first login!")
    
    # Create a test user
    test_user = {
        "id": "user-001",
        "email": "consultor@litoralverde.com.br",
        "name": "Consultor Teste",
        "password_hash": bcrypt.hashpw("teste123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        "role": "user",
        "created_at": "2025-01-01T00:00:00"
    }
    
    await db.users.insert_one(test_user)
    
    print("\n✓ Test user created successfully!")
    print(f"  Email: consultor@litoralverde.com.br")
    print(f"  Password: teste123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_admin_user())
