from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from bson import ObjectId
import os, shutil, secrets
from ..database import get_db
from ..utils.auth import get_current_user
from ..utils.helpers import generate_slug, serialize_doc, serialize_docs

router = APIRouter(prefix="/api/restaurants", tags=["restaurants"])


class RestaurantCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    phone: Optional[str] = ""
    address: Optional[str] = ""
    city: Optional[str] = ""
    state: Optional[str] = ""


class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None


@router.post("")
async def create_restaurant(req: RestaurantCreate, current_user=Depends(get_current_user)):
    db = get_db()
    slug = generate_slug(req.name)
    if db.restaurants.find_one({"slug": slug}):
        slug = f"{slug}-{secrets.token_hex(3)}"
    restaurant = {
        "ownerId": ObjectId(current_user["id"]), "name": req.name, "slug": slug,
        "description": req.description, "phone": req.phone, "address": req.address,
        "city": req.city, "state": req.state, "logoUrl": None, "isPublished": False,
        "createdAt": datetime.utcnow()
    }
    result = db.restaurants.insert_one(restaurant)
    restaurant["id"] = str(result.inserted_id)
    del restaurant["_id"]
    restaurant["ownerId"] = str(restaurant["ownerId"])
    return restaurant


@router.get("")
async def get_my_restaurants(current_user=Depends(get_current_user)):
    db = get_db()
    restaurants = list(db.restaurants.find({"ownerId": ObjectId(current_user["id"])}))
    return serialize_docs(restaurants)


@router.get("/{restaurant_id}")
async def get_restaurant(restaurant_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    restaurant = db.restaurants.find_one({"_id": ObjectId(restaurant_id), "ownerId": ObjectId(current_user["id"])})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return serialize_doc(restaurant)


@router.put("/{restaurant_id}")
async def update_restaurant(restaurant_id: str, req: RestaurantUpdate, current_user=Depends(get_current_user)):
    db = get_db()
    restaurant = db.restaurants.find_one({"_id": ObjectId(restaurant_id), "ownerId": ObjectId(current_user["id"])})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    update_data = {k: v for k, v in req.dict().items() if v is not None}
    if update_data:
        db.restaurants.update_one({"_id": ObjectId(restaurant_id)}, {"$set": update_data})
    return serialize_doc(db.restaurants.find_one({"_id": ObjectId(restaurant_id)}))


@router.post("/{restaurant_id}/logo")
async def upload_logo(restaurant_id: str, file: UploadFile = File(...), current_user=Depends(get_current_user)):
    db = get_db()
    restaurant = db.restaurants.find_one({"_id": ObjectId(restaurant_id), "ownerId": ObjectId(current_user["id"])})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    upload_dir = os.getenv("UPLOAD_DIR", "./uploads")
    os.makedirs(f"{upload_dir}/logos", exist_ok=True)
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filepath = f"{upload_dir}/logos/{restaurant_id}_logo.{ext}"
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    logo_url = f"/uploads/logos/{restaurant_id}_logo.{ext}"
    db.restaurants.update_one({"_id": ObjectId(restaurant_id)}, {"$set": {"logoUrl": logo_url}})
    return {"logoUrl": logo_url}


@router.get("/slug/{slug}")
async def get_restaurant_by_slug(slug: str):
    db = get_db()
    restaurant = db.restaurants.find_one({"slug": slug})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return serialize_doc(restaurant)
