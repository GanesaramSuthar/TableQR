from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from bson import ObjectId
from ..database import get_db
from ..utils.auth import get_current_user
from ..utils.helpers import generate_qr_token, serialize_doc, serialize_docs

router = APIRouter(prefix="/api/tables", tags=["tables"])


class TableCreate(BaseModel):
    tableNumber: int


class TableUpdate(BaseModel):
    tableNumber: Optional[int] = None
    isActive: Optional[bool] = None


def _verify_owner(db, restaurant_id: str, user_id: str):
    restaurant = db.restaurants.find_one({"_id": ObjectId(restaurant_id), "ownerId": ObjectId(user_id)})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found or access denied")
    return restaurant


@router.post("/{restaurant_id}")
async def create_table(restaurant_id: str, req: TableCreate, current_user=Depends(get_current_user)):
    db = get_db()
    _verify_owner(db, restaurant_id, current_user["id"])
    existing = db.tables.find_one({"restaurantId": ObjectId(restaurant_id), "tableNumber": req.tableNumber})
    if existing:
        raise HTTPException(status_code=400, detail="Table number already exists")
    table = {"restaurantId": ObjectId(restaurant_id), "tableNumber": req.tableNumber, "qrToken": generate_qr_token(), "isActive": True, "createdAt": datetime.utcnow()}
    result = db.tables.insert_one(table)
    table["id"] = str(result.inserted_id)
    del table["_id"]
    table["restaurantId"] = str(table["restaurantId"])
    return table


@router.get("/{restaurant_id}")
async def get_tables(restaurant_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    _verify_owner(db, restaurant_id, current_user["id"])
    tables = list(db.tables.find({"restaurantId": ObjectId(restaurant_id)}).sort("tableNumber", 1))
    return serialize_docs(tables)


@router.put("/{restaurant_id}/{table_id}")
async def update_table(restaurant_id: str, table_id: str, req: TableUpdate, current_user=Depends(get_current_user)):
    db = get_db()
    _verify_owner(db, restaurant_id, current_user["id"])
    update_data = {k: v for k, v in req.dict().items() if v is not None}
    if update_data:
        db.tables.update_one({"_id": ObjectId(table_id)}, {"$set": update_data})
    return serialize_doc(db.tables.find_one({"_id": ObjectId(table_id)}))


@router.delete("/{restaurant_id}/{table_id}")
async def delete_table(restaurant_id: str, table_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    _verify_owner(db, restaurant_id, current_user["id"])
    db.tables.delete_one({"_id": ObjectId(table_id)})
    return {"message": "Table deleted"}


@router.post("/{restaurant_id}/bulk")
async def create_bulk_tables(restaurant_id: str, count: int = 10, current_user=Depends(get_current_user)):
    db = get_db()
    _verify_owner(db, restaurant_id, current_user["id"])
    last_table = db.tables.find_one({"restaurantId": ObjectId(restaurant_id)}, sort=[("tableNumber", -1)])
    start = (last_table["tableNumber"] + 1) if last_table else 1
    tables = []
    for i in range(start, start + count):
        table = {"restaurantId": ObjectId(restaurant_id), "tableNumber": i, "qrToken": generate_qr_token(), "isActive": True, "createdAt": datetime.utcnow()}
        result = db.tables.insert_one(table)
        table["id"] = str(result.inserted_id)
        del table["_id"]
        table["restaurantId"] = str(table["restaurantId"])
        tables.append(table)
    return {"created": len(tables), "tables": tables}


@router.get("/qr/{qr_token}")
async def get_table_by_qr(qr_token: str):
    db = get_db()
    table = db.tables.find_one({"qrToken": qr_token, "isActive": True})
    if not table:
        raise HTTPException(status_code=404, detail="Invalid or inactive table QR code")
    restaurant = db.restaurants.find_one({"_id": table["restaurantId"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return {"table": serialize_doc(table), "restaurant": serialize_doc(restaurant)}
