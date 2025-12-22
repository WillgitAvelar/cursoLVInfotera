from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict, validator
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    password_hash: str
    role: str = "user"  # "user" or "admin"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    @validator('email')
    def validate_email_domain(cls, v):
        if not v.endswith('@litoralverde.com.br'):
            raise ValueError('Email deve ser do domínio @litoralverde.com.br')
        return v

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: Optional[str] = "user"
    
    @validator('email')
    def validate_email_domain(cls, v):
        if not v.endswith('@litoralverde.com.br'):
            raise ValueError('Email deve ser do domínio @litoralverde.com.br')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class CourseSection(BaseModel):
    id: str
    title: str
    order: int

class SectionProgress(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    section_id: str
    completed: bool = False
    completed_at: Optional[datetime] = None

class SectionProgressUpdate(BaseModel):
    section_id: str
    completed: bool

class Note(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    section_id: str
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NoteCreate(BaseModel):
    section_id: str
    content: str

class NoteUpdate(BaseModel):
    content: str

class Favorite(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    section_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FavoriteToggle(BaseModel):
    section_id: str

class UserProgressSummary(BaseModel):
    user_id: str
    user_name: str
    user_email: str
    total_sections: int
    completed_sections: int
    progress_percentage: float
    last_activity: Optional[datetime]

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

async def get_admin_user(current_user: Dict = Depends(get_current_user)) -> Dict:
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado. Apenas administradores.")
    return current_user

# ==================== COURSE SECTIONS DEFINITION ====================
COURSE_SECTIONS = [
    {"id": "introducao", "title": "Introdução ao Infotravel", "order": 1},
    {"id": "acesso", "title": "Acesso ao Sistema", "order": 2},
    {"id": "cadastro-clientes", "title": "Cadastro de Clientes", "order": 3},
    {"id": "orcamento", "title": "Sistema de Orçamento", "order": 4},
    {"id": "monte-pacote", "title": "Monte seu Pacote", "order": 5},
    {"id": "orcamento-web", "title": "Orçamento Web", "order": 6},
    {"id": "reservas", "title": "Gestão de Reservas", "order": 7},
    {"id": "pagamentos", "title": "Sistema de Pagamentos", "order": 8},
    {"id": "descontos", "title": "Descontos", "order": 9},
    {"id": "reservas-manuais", "title": "Reservas Manuais", "order": 10},
    {"id": "emissao-aereo", "title": "Emissão de Aéreo Nacional", "order": 11},
    {"id": "status-reservas", "title": "Status de Reservas Detalhado", "order": 12}
]

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    # Create user
    password_hash = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=password_hash,
        role=user_data.role
    )
    
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    
    token = create_access_token(user['id'], user['email'], user['role'])
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user['id'],
            email=user['email'],
            name=user['name'],
            role=user['role']
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: Dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user['user_id']})
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    return UserResponse(
        id=user['id'],
        email=user['email'],
        name=user['name'],
        role=user['role']
    )

# ==================== COURSE SECTIONS ROUTES ====================

@api_router.get("/sections", response_model=List[CourseSection])
async def get_sections():
    return COURSE_SECTIONS

# ==================== PROGRESS ROUTES ====================

@api_router.get("/progress")
async def get_my_progress(current_user: Dict = Depends(get_current_user)):
    progress_list = await db.progress.find(
        {"user_id": current_user['user_id']}, 
        {"_id": 0}
    ).to_list(100)
    
    return progress_list

@api_router.post("/progress")
async def update_progress(
    progress_data: SectionProgressUpdate,
    current_user: Dict = Depends(get_current_user)
):
    existing = await db.progress.find_one({
        "user_id": current_user['user_id'],
        "section_id": progress_data.section_id
    })
    
    if existing:
        # Update existing progress
        update_data = {
            "completed": progress_data.completed,
            "completed_at": datetime.now(timezone.utc).isoformat() if progress_data.completed else None
        }
        await db.progress.update_one(
            {"id": existing['id']},
            {"$set": update_data}
        )
        result = await db.progress.find_one({"id": existing['id']}, {"_id": 0})
    else:
        # Create new progress entry
        progress = SectionProgress(
            user_id=current_user['user_id'],
            section_id=progress_data.section_id,
            completed=progress_data.completed,
            completed_at=datetime.now(timezone.utc) if progress_data.completed else None
        )
        progress_dict = progress.model_dump()
        if progress_dict['completed_at']:
            progress_dict['completed_at'] = progress_dict['completed_at'].isoformat()
        
        await db.progress.insert_one(progress_dict)
        result = progress_dict
    
    return result

# ==================== NOTES ROUTES ====================

@api_router.get("/notes")
async def get_my_notes(
    section_id: Optional[str] = None,
    current_user: Dict = Depends(get_current_user)
):
    query = {"user_id": current_user['user_id']}
    if section_id:
        query["section_id"] = section_id
    
    notes = await db.notes.find(query, {"_id": 0}).to_list(100)
    return notes

@api_router.post("/notes")
async def create_note(
    note_data: NoteCreate,
    current_user: Dict = Depends(get_current_user)
):
    note = Note(
        user_id=current_user['user_id'],
        section_id=note_data.section_id,
        content=note_data.content
    )
    
    note_dict = note.model_dump()
    note_dict['created_at'] = note_dict['created_at'].isoformat()
    note_dict['updated_at'] = note_dict['updated_at'].isoformat()
    
    await db.notes.insert_one(note_dict)
    return note_dict

@api_router.put("/notes/{note_id}")
async def update_note(
    note_id: str,
    note_data: NoteUpdate,
    current_user: Dict = Depends(get_current_user)
):
    note = await db.notes.find_one({"id": note_id, "user_id": current_user['user_id']})
    if not note:
        raise HTTPException(status_code=404, detail="Nota não encontrada")
    
    await db.notes.update_one(
        {"id": note_id},
        {"$set": {
            "content": note_data.content,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    updated_note = await db.notes.find_one({"id": note_id}, {"_id": 0})
    return updated_note

@api_router.delete("/notes/{note_id}")
async def delete_note(
    note_id: str,
    current_user: Dict = Depends(get_current_user)
):
    result = await db.notes.delete_one({"id": note_id, "user_id": current_user['user_id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Nota não encontrada")
    
    return {"message": "Nota deletada com sucesso"}

# ==================== FAVORITES ROUTES ====================

@api_router.get("/favorites")
async def get_my_favorites(current_user: Dict = Depends(get_current_user)):
    favorites = await db.favorites.find(
        {"user_id": current_user['user_id']}, 
        {"_id": 0}
    ).to_list(100)
    return favorites

@api_router.post("/favorites/toggle")
async def toggle_favorite(
    favorite_data: FavoriteToggle,
    current_user: Dict = Depends(get_current_user)
):
    existing = await db.favorites.find_one({
        "user_id": current_user['user_id'],
        "section_id": favorite_data.section_id
    })
    
    if existing:
        # Remove favorite
        await db.favorites.delete_one({"id": existing['id']})
        return {"favorited": False, "message": "Removido dos favoritos"}
    else:
        # Add favorite
        favorite = Favorite(
            user_id=current_user['user_id'],
            section_id=favorite_data.section_id
        )
        favorite_dict = favorite.model_dump()
        favorite_dict['created_at'] = favorite_dict['created_at'].isoformat()
        
        await db.favorites.insert_one(favorite_dict)
        return {"favorited": True, "message": "Adicionado aos favoritos"}

# ==================== ADMIN ROUTES ====================

@api_router.get("/admin/users-progress", response_model=List[UserProgressSummary])
async def get_all_users_progress(current_user: Dict = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    total_sections = len(COURSE_SECTIONS)
    
    summaries = []
    for user in users:
        progress_list = await db.progress.find({"user_id": user['id']}, {"_id": 0}).to_list(100)
        completed_sections = sum(1 for p in progress_list if p.get('completed', False))
        progress_percentage = (completed_sections / total_sections * 100) if total_sections > 0 else 0
        
        # Get last activity
        last_activity = None
        if progress_list:
            completed_progress = [p for p in progress_list if p.get('completed_at')]
            if completed_progress:
                last_activity = max(
                    datetime.fromisoformat(p['completed_at']) 
                    for p in completed_progress if p.get('completed_at')
                )
        
        summaries.append(UserProgressSummary(
            user_id=user['id'],
            user_name=user['name'],
            user_email=user['email'],
            total_sections=total_sections,
            completed_sections=completed_sections,
            progress_percentage=round(progress_percentage, 2),
            last_activity=last_activity
        ))
    
    return summaries

@api_router.get("/admin/user-detail/{user_id}")
async def get_user_detail(
    user_id: str,
    current_user: Dict = Depends(get_admin_user)
):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    progress_list = await db.progress.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    notes_count = await db.notes.count_documents({"user_id": user_id})
    favorites_count = await db.favorites.count_documents({"user_id": user_id})
    
    return {
        "user": user,
        "progress": progress_list,
        "notes_count": notes_count,
        "favorites_count": favorites_count
    }

# ==================== ROOT ROUTE ====================

@api_router.get("/")
async def root():
    return {"message": "Litoral Verde Training Platform API"}

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
