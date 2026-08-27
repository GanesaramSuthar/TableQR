from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from ..database import get_db
from ..utils.auth import get_current_user
from ..utils.helpers import generate_order_number, serialize_doc, serialize_docs

router = APIRouter(prefix="/api/orders", tags=["orders"])


class OrderItemInput(BaseModel):
    menuItemId: str
    quantity: int


class PlaceOrderRequest(BaseModel):
    qrToken: str
    items: List[OrderItemInput]
    paymentMethod: Optional[str] = "pay_at_counter"
    customerName: Optional[str] = ""
    customerPhone: Optional[str] = ""


class UpdateOrderStatus(BaseModel):
    status: str


def _verify_owner(db, restaurant_id: str, user_id: str):
    restaurant = db.restaurants.find_one({"_id": ObjectId(restaurant_id), "ownerId": ObjectId(user_id)})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found or access denied")
    return restaurant


@router.post("")
async def place_order(req: PlaceOrderRequest):
    db = get_db()
    table = db.tables.find_one({"qrToken": req.qrToken, "isActive": True})
    if not table:
        raise HTTPException(status_code=400, detail="Invalid or inactive table")
    restaurant_id = table["restaurantId"]
    restaurant = db.restaurants.find_one({"_id": restaurant_id})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    order_items = []
    subtotal = 0
    for item_input in req.items:
        menu_item = db.menu_items.find_one({"_id": ObjectId(item_input.menuItemId), "restaurantId": restaurant_id})
        if not menu_item:
            raise HTTPException(status_code=400, detail=f"Menu item not found")
        if not menu_item.get("isAvailable", True):
            raise HTTPException(status_code=400, detail=f"{menu_item['name']} is currently unavailable")
        item_subtotal = menu_item["price"] * item_input.quantity
        subtotal += item_subtotal
        order_items.append({"menuItemId": menu_item["_id"], "itemName": menu_item["name"], "price": menu_item["price"], "quantity": item_input.quantity, "subtotal": item_subtotal})
    
    tax = round(subtotal * 0.05, 2)
    total = round(subtotal + tax, 2)
    order_number = generate_order_number()
    while db.orders.find_one({"orderNumber": order_number}):
        order_number = generate_order_number()
    
    order = {
        "restaurantId": restaurant_id, "tableId": table["_id"], "tableNumber": table["tableNumber"],
        "orderNumber": order_number, "status": "PENDING", "customerName": req.customerName,
        "customerPhone": req.customerPhone, "subtotal": subtotal, "tax": tax, "total": total,
        "paymentMethod": req.paymentMethod, "paymentStatus": "pending",
        "createdAt": datetime.utcnow(), "updatedAt": datetime.utcnow()
    }
    order_result = db.orders.insert_one(order)
    order_id = order_result.inserted_id
    for oi in order_items:
        oi["orderId"] = order_id
        db.order_items.insert_one(oi)
    db.payments.insert_one({"orderId": order_id, "amount": total, "method": req.paymentMethod, "status": "pending", "transactionId": None, "createdAt": datetime.utcnow()})
    
    order["id"] = str(order_id)
    del order["_id"]
    order["restaurantId"] = str(order["restaurantId"])
    order["tableId"] = str(order["tableId"])
    order["items"] = serialize_docs(order_items)
    return order


@router.get("/{order_id}/status")
async def get_order_status(order_id: str):
    db = get_db()
    order = db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    items = list(db.order_items.find({"orderId": order["_id"]}))
    result = serialize_doc(order)
    result["items"] = serialize_docs(items)
    result["restaurantName"] = db.restaurants.find_one({"_id": order["restaurantId"]}).get("name", "")
    return result


@router.get("/number/{order_number}")
async def get_order_by_number(order_number: str):
    db = get_db()
    order = db.orders.find_one({"orderNumber": order_number})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    items = list(db.order_items.find({"orderId": order["_id"]}))
    result = serialize_doc(order)
    result["items"] = serialize_docs(items)
    restaurant = db.restaurants.find_one({"_id": order["restaurantId"]})
    result["restaurantName"] = restaurant.get("name", "") if restaurant else ""
    return result


@router.get("/restaurant/{restaurant_id}")
async def get_restaurant_orders(restaurant_id: str, status: Optional[str] = None, current_user=Depends(get_current_user)):
    db = get_db()
    _verify_owner(db, restaurant_id, current_user["id"])
    query = {"restaurantId": ObjectId(restaurant_id)}
    if status:
        query["status"] = status
    orders = list(db.orders.find(query).sort("createdAt", -1).limit(100))
    result = []
    for order in orders:
        items = list(db.order_items.find({"orderId": order["_id"]}))
        order_data = serialize_doc(order)
        order_data["items"] = serialize_docs(items)
        result.append(order_data)
    return result


@router.put("/{order_id}/status")
async def update_order_status(order_id: str, req: UpdateOrderStatus, current_user=Depends(get_current_user)):
    db = get_db()
    order = db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    _verify_owner(db, str(order["restaurantId"]), current_user["id"])
    valid_statuses = ["PENDING", "ACCEPTED", "PREPARING", "READY", "SERVED", "CANCELLED"]
    if req.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    db.orders.update_one({"_id": ObjectId(order_id)}, {"$set": {"status": req.status, "updatedAt": datetime.utcnow()}})
    updated = db.orders.find_one({"_id": ObjectId(order_id)})
    items = list(db.order_items.find({"orderId": order["_id"]}))
    result = serialize_doc(updated)
    result["items"] = serialize_docs(items)
    return result


@router.get("/restaurant/{restaurant_id}/stats")
async def get_restaurant_stats(restaurant_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    _verify_owner(db, restaurant_id, current_user["id"])
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_orders = list(db.orders.find({"restaurantId": ObjectId(restaurant_id), "createdAt": {"$gte": today_start}}))
    today_sales = sum(o.get("total", 0) for o in today_orders if o.get("status") != "CANCELLED")
    pending = sum(1 for o in today_orders if o.get("status") == "PENDING")
    preparing = sum(1 for o in today_orders if o.get("status") in ["ACCEPTED", "PREPARING"])
    completed = sum(1 for o in today_orders if o.get("status") == "SERVED")
    total_tables = db.tables.count_documents({"restaurantId": ObjectId(restaurant_id), "isActive": True})
    active_table_ids = db.orders.distinct("tableId", {"restaurantId": ObjectId(restaurant_id), "status": {"$in": ["PENDING", "ACCEPTED", "PREPARING", "READY"]}, "createdAt": {"$gte": today_start}})
    return {"todaySales": today_sales, "todayOrders": len(today_orders), "activeTables": len(active_table_ids), "totalTables": total_tables, "pendingOrders": pending, "preparingOrders": preparing, "completedOrders": completed}
