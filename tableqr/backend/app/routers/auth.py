from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime
from bson import ObjectId
from ..database import get_db
from ..utils.auth import hash_password, verify_password, create_access_token, get_current_user
from ..utils.helpers import serialize_doc

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    name: str
    email: str
    phone: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
async def register(req: RegisterRequest):
    db = get_db()
    if db.users.find_one({"email": req.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = {
        "name": req.name, "email": req.email, "phone": req.phone,
        "passwordHash": hash_password(req.password), "role": "owner",
        "createdAt": datetime.utcnow()
    }
    result = db.users.insert_one(user)
    token = create_access_token({"sub": str(result.inserted_id)})
    user["id"] = str(result.inserted_id)
    del user["passwordHash"], user["_id"]
    return {"token": token, "user": user}


@router.post("/login")
async def login(req: LoginRequest):
    db = get_db()
    user = db.users.find_one({"email": req.email})
    if not user or not verify_password(req.password, user["passwordHash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": str(user["_id"])})
    user_data = serialize_doc(user)
    del user_data["passwordHash"]
    return {"token": token, "user": user_data}


@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    return {k: v for k, v in current_user.items() if k != "passwordHash"}
