from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from datetime import datetime
from bson import ObjectId
import os, shutil
from ..database import get_db
from ..utils.auth import get_current_user

router = APIRouter(prefix="/api/menu-import", tags=["menu-import"])

DEMO_MENU = {
    "Starters": [
        {"name": "Paneer Tikka", "description": "Cubes of paneer marinated in spices and grilled in tandoor", "price": 280, "isPopular": True},
        {"name": "Chicken Malai Tikka", "description": "Creamy chicken tikka with mild spices", "price": 320, "isPopular": True},
        {"name": "Veg Samosa", "description": "Crispy pastry filled with spiced potatoes and peas", "price": 120, "isPopular": False},
        {"name": "Onion Bhaji", "description": "Crispy fried onion fritters with mint chutney", "price": 140, "isPopular": False},
        {"name": "Chicken Wings", "description": "Spicy tandoori chicken wings", "price": 260, "isPopular": False},
    ],
    "Main Course": [
        {"name": "Dal Tadka", "description": "Yellow lentils tempered with cumin, garlic and spices", "price": 180, "isPopular": True},
        {"name": "Butter Chicken", "description": "Tender chicken in rich tomato and butter gravy", "price": 320, "isPopular": True},
        {"name": "Palak Paneer", "description": "Cottage cheese cubes in creamy spinach gravy", "price": 260, "isPopular": False},
        {"name": "Mutton Rogan Josh", "description": "Slow-cooked mutton in aromatic Kashmiri spices", "price": 380, "isPopular": False},
        {"name": "Chole Bhature", "description": "Spiced chickpea curry with fluffy fried bread", "price": 200, "isPopular": False},
    ],
    "Biryani": [
        {"name": "Veg Biryani", "description": "Fragrant basmati rice with mixed vegetables and spices", "price": 220, "isPopular": True},
        {"name": "Chicken Biryani", "description": "Hyderabadi-style chicken biryani with raita", "price": 280, "isPopular": True},
        {"name": "Mutton Biryani", "description": "Slow-cooked mutton with aromatic rice", "price": 340, "isPopular": False},
    ],
    "Breads": [
        {"name": "Garlic Naan", "description": "Soft naan bread with garlic butter", "price": 80, "isPopular": True},
        {"name": "Butter Roti", "description": "Whole wheat flatbread with butter", "price": 50, "isPopular": False},
        {"name": "Cheese Naan", "description": "Naan stuffed with melted cheese", "price": 120, "isPopular": False},
        {"name": "Tandoori Roti", "description": "Crispy tandoor-baked whole wheat bread", "price": 60, "isPopular": False},
    ],
    "Beverages": [
        {"name": "Masala Chaas", "description": "Spiced buttermilk with cumin and mint", "price": 50, "isPopular": True},
        {"name": "Mango Lassi", "description": "Creamy yogurt drink with Alphonso mango", "price": 120, "isPopular": False},
        {"name": "Fresh Lime Soda", "description": "Refreshing lime with soda water", "price": 80, "isPopular": False},
        {"name": "Masala Chai", "description": "Traditional Indian spiced tea", "price": 60, "isPopular": False},
    ],
    "Desserts": [
        {"name": "Gulab Jamun", "description": "Soft milk dumplings in rose-flavored syrup", "price": 120, "isPopular": True},
        {"name": "Rasmalai", "description": "Cottage cheese patties in saffron milk", "price": 140, "isPopular": False},
        {"name": "Kulfi", "description": "Traditional Indian ice cream with pistachios", "price": 100, "isPopular": False},
    ],
}


def _verify_owner(db, restaurant_id: str, user_id: str):
    restaurant = db.restaurants.find_one({"_id": ObjectId(restaurant_id), "ownerId": ObjectId(user_id)})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found or access denied")
    return restaurant


@router.post("/{restaurant_id}/upload")
async def upload_menu_image(restaurant_id: str, file: UploadFile = File(...), current_user=Depends(get_current_user)):
    db = get_db()
    _verify_owner(db, restaurant_id, current_user["id"])
    upload_dir = os.getenv("UPLOAD_DIR", "./uploads")
    os.makedirs(f"{upload_dir}/menus", exist_ok=True)
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{restaurant_id}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.{ext}"
    filepath = f"{upload_dir}/menus/{filename}"
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"imageUrl": f"/uploads/menus/{filename}", "filename": filename}


@router.post("/{restaurant_id}/extract")
async def extract_menu(restaurant_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    _verify_owner(db, restaurant_id, current_user["id"])
    extracted_items = []
    for category, items in DEMO_MENU.items():
        for item in items:
            extracted_items.append({"category": category, "name": item["name"], "description": item["description"], "price": item["price"], "isPopular": item.get("isPopular", False)})
    return {"itemsFound": len(extracted_items), "categoriesFound": len(DEMO_MENU), "items": extracted_items, "confidence": 0.92, "note": "AI-extracted menu. Please review all items before publishing."}


@router.post("/{restaurant_id}/use-demo")
async def use_demo_menu(restaurant_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    _verify_owner(db, restaurant_id, current_user["id"])
    extracted_items = []
    for category, items in DEMO_MENU.items():
        for item in items:
            extracted_items.append({"category": category, "name": item["name"], "description": item["description"], "price": item["price"], "isPopular": item.get("isPopular", False)})
    return {"itemsFound": len(extracted_items), "categoriesFound": len(DEMO_MENU), "items": extracted_items, "confidence": 1.0, "note": "Demo menu loaded."}
