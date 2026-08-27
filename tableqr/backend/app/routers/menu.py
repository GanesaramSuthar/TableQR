from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
import os, shutil
from ..database import get_db
from ..utils.auth import get_current_user
from ..utils.helpers import serialize_doc, serialize_docs

router = APIRouter(prefix="/api/menu", tags=["menu"])


class CategoryCreate(BaseModel):
    name: str
    displayOrder: Optional[int] = 0


class MenuItemCreate(BaseModel):
    categoryId: str
    name: str
    description: Optional[str] = ""
    price: float
    isAvailable: Optional[bool] = True
    isPopular: Optional[bool] = False


class MenuItemUpdate(BaseModel):
    categoryId: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    isAvailable: Optional[bool] = None
    isPopular: Optional[bool] = None


class BulkMenuItems(BaseModel):
    items: List[dict]


def _verify_owner(db, restaurant_id: str, user_id: str):
    restaurant = db.restaurants.find_one({"_id": ObjectId(restaurant_id), "ownerId": ObjectId(user_id)})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found or access denied")
    return restaurant


@router.post("/{restaurant_id}/categories")
async def create_category(restaurant_id: str, req: CategoryCreate, current_user=Depends(get_current_user)):
    db = get_db()
    _verify_owner(db, restaurant_id, current_user["id"])
    category = {"restaurantId": ObjectId(restaurant_id), "name": req.name, "displayOrder": req.displayOrder, "createdAt": datetime.utcnow()}
    result = db.categories.insert_one(category)
    category["id"] = str(result.inserted_id)
    del category["_id"]
    category["restaurantId"] = str(category["restaurantId"])
    return category


@router.get("/{restaurant_id}/categories")
async def get_categories(restaurant_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    _verify_owner(db, restaurant_id, current_user["id"])
    categories = list(db.categories.find({"restaurantId": ObjectId(restaurant_id)}).sort("displayOrder", 1))
    return serialize_docs(categories)


@router.delete("/{restaurant_id}/categories/{category_id}")
async def delete_category(restaurant_id: str, category_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    _verify_owner(db, restaurant_id, current_user["id"])
    db.menu_items.delete_many({"categoryId": ObjectId(category_id)})
    db.categories.delete_one({"_id": ObjectId(category_id)})
    return {"message": "Category deleted"}


@router.post("/{restaurant_id}/items")
async def create_menu_item(restaurant_id: str, req: MenuItemCreate, current_user=Depends(get_current_user)):
    db = get_db()
    _verify_owner(db, restaurant_id, current_user["id"])
    item = {
        "restaurantId": ObjectId(restaurant_id), "categoryId": ObjectId(req.categoryId),
        "name": req.name, "description": req.description, "price": req.price,
        "imageUrl": None, "isAvailable": req.isAvailable, "isPopular": req.isPopular,
        "createdAt": datetime.utcnow()
    }
    result = db.menu_items.insert_one(item)
    item["id"] = str(result.inserted_id)
    del item["_id"]
    item["restaurantId"] = str(item["restaurantId"])
    item["categoryId"] = str(item["categoryId"])
    return item


@router.get("/{restaurant_id}/items")
async def get_menu_items(restaurant_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    _verify_owner(db, restaurant_id, current_user["id"])
    items = list(db.menu_items.find({"restaurantId": ObjectId(restaurant_id)}))
    return serialize_docs(items)


@router.put("/{restaurant_id}/items/{item_id}")
async def update_menu_item(restaurant_id: str, item_id: str, req: MenuItemUpdate, current_user=Depends(get_current_user)):
    db = get_db()
    _verify_owner(db, restaurant_id, current_user["id"])
    update_data = {}
    for k, v in req.dict().items():
        if v is not None:
            update_data[k] = ObjectId(v) if k == "categoryId" else v
    if update_data:
        db.menu_items.update_one({"_id": ObjectId(item_id)}, {"$set": update_data})
    return serialize_doc(db.menu_items.find_one({"_id": ObjectId(item_id)}))


@router.delete("/{restaurant_id}/items/{item_id}")
async def delete_menu_item(restaurant_id: str, item_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    _verify_owner(db, restaurant_id, current_user["id"])
    db.menu_items.delete_one({"_id": ObjectId(item_id)})
    return {"message": "Menu item deleted"}


@router.post("/{restaurant_id}/bulk-import")
async def bulk_import_items(restaurant_id: str, req: BulkMenuItems, current_user=Depends(get_current_user)):
    db = get_db()
    _verify_owner(db, restaurant_id, current_user["id"])
    created_items = []
    for item_data in req.items:
        cat_name = item_data.get("category", "Uncategorized")
        category = db.categories.find_one({"restaurantId": ObjectId(restaurant_id), "name": cat_name})
        if not category:
            cat_result = db.categories.insert_one({"restaurantId": ObjectId(restaurant_id), "name": cat_name, "displayOrder": len(created_items), "createdAt": datetime.utcnow()})
            cat_id = cat_result.inserted_id
        else:
            cat_id = category["_id"]
        item = {
            "restaurantId": ObjectId(restaurant_id), "categoryId": cat_id,
            "name": item_data.get("name", ""), "description": item_data.get("description", ""),
            "price": float(item_data.get("price", 0)), "imageUrl": item_data.get("imageUrl"),
            "isAvailable": True, "isPopular": item_data.get("isPopular", False),
            "createdAt": datetime.utcnow()
        }
        result = db.menu_items.insert_one(item)
        item["id"] = str(result.inserted_id)
        del item["_id"]
        created_items.append(item)
    return {"imported": len(created_items), "items": serialize_docs(created_items)}


@router.get("/public/{restaurant_id}/menu")
async def get_public_menu(restaurant_id: str):
    db = get_db()
    restaurant = db.restaurants.find_one({"_id": ObjectId(restaurant_id)})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    categories = list(db.categories.find({"restaurantId": ObjectId(restaurant_id)}).sort("displayOrder", 1))
    items = list(db.menu_items.find({"restaurantId": ObjectId(restaurant_id)}))
    menu = []
    for cat in categories:
        cat_items = [i for i in items if str(i["categoryId"]) == str(cat["_id"])]
        menu.append({"category": serialize_doc(cat), "items": serialize_docs(cat_items)})
    uncategorized = [i for i in items if not any(str(i["categoryId"]) == str(c["_id"]) for c in categories)]
    if uncategorized:
        menu.append({"category": {"id": "uncategorized", "name": "Other", "displayOrder": 999}, "items": serialize_docs(uncategorized)})
    return {"restaurant": serialize_doc(restaurant), "menu": menu}
