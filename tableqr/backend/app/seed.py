from datetime import datetime
from bson import ObjectId
from .database import get_db
from .utils.auth import hash_password
from .utils.helpers import generate_qr_token


def seed_database():
    db = get_db()
    if db.users.find_one({"email": "demo@tableqr.com"}):
        print("Database already seeded.")
        return
    print("Seeding database...")
    
    user_result = db.users.insert_one({"name": "Demo Owner", "email": "demo@tableqr.com", "phone": "9876543210", "passwordHash": hash_password("demo123"), "role": "owner", "createdAt": datetime.utcnow()})
    owner_id = user_result.inserted_id
    
    restaurant_result = db.restaurants.insert_one({"ownerId": owner_id, "name": "Rajasthan Zaika Dhaba", "slug": "rajasthan-zaika-dhaba", "description": "Authentic Rajasthani cuisine in the heart of Jaipur", "phone": "9876543210", "address": "123 MI Road", "city": "Jaipur", "state": "Rajasthan", "logoUrl": None, "isPublished": True, "createdAt": datetime.utcnow()})
    restaurant_id = restaurant_result.inserted_id
    
    categories_data = [{"name": "Starters", "displayOrder": 1}, {"name": "Main Course", "displayOrder": 2}, {"name": "Biryani", "displayOrder": 3}, {"name": "Breads", "displayOrder": 4}, {"name": "Beverages", "displayOrder": 5}, {"name": "Desserts", "displayOrder": 6}]
    cat_ids = {}
    for cat in categories_data:
        result = db.categories.insert_one({"restaurantId": restaurant_id, "name": cat["name"], "displayOrder": cat["displayOrder"], "createdAt": datetime.utcnow()})
        cat_ids[cat["name"]] = result.inserted_id
    
    menu_items = [
        {"category": "Starters", "name": "Paneer Tikka", "description": "Cubes of paneer marinated in spices and grilled in tandoor", "price": 280, "isPopular": True},
        {"category": "Starters", "name": "Chicken Malai Tikka", "description": "Creamy chicken tikka with mild spices", "price": 320, "isPopular": True},
        {"category": "Starters", "name": "Veg Samosa", "description": "Crispy pastry filled with spiced potatoes and peas", "price": 120, "isPopular": False},
        {"category": "Starters", "name": "Onion Bhaji", "description": "Crispy fried onion fritters with mint chutney", "price": 140, "isPopular": False},
        {"category": "Starters", "name": "Chicken Wings", "description": "Spicy tandoori chicken wings", "price": 260, "isPopular": False},
        {"category": "Main Course", "name": "Dal Tadka", "description": "Yellow lentils tempered with cumin, garlic and spices", "price": 180, "isPopular": True},
        {"category": "Main Course", "name": "Butter Chicken", "description": "Tender chicken in rich tomato and butter gravy", "price": 320, "isPopular": True},
        {"category": "Main Course", "name": "Palak Paneer", "description": "Cottage cheese cubes in creamy spinach gravy", "price": 260, "isPopular": False},
        {"category": "Main Course", "name": "Mutton Rogan Josh", "description": "Slow-cooked mutton in aromatic Kashmiri spices", "price": 380, "isPopular": False},
        {"category": "Main Course", "name": "Chole Bhature", "description": "Spiced chickpea curry with fluffy fried bread", "price": 200, "isPopular": False},
        {"category": "Biryani", "name": "Veg Biryani", "description": "Fragrant basmati rice with mixed vegetables and spices", "price": 220, "isPopular": True},
        {"category": "Biryani", "name": "Chicken Biryani", "description": "Hyderabadi-style chicken biryani with raita", "price": 280, "isPopular": True},
        {"category": "Biryani", "name": "Mutton Biryani", "description": "Slow-cooked mutton with aromatic rice", "price": 340, "isPopular": False},
        {"category": "Breads", "name": "Garlic Naan", "description": "Soft naan bread with garlic butter", "price": 80, "isPopular": True},
        {"category": "Breads", "name": "Butter Roti", "description": "Whole wheat flatbread with butter", "price": 50, "isPopular": False},
        {"category": "Breads", "name": "Cheese Naan", "description": "Naan stuffed with melted cheese", "price": 120, "isPopular": False},
        {"category": "Breads", "name": "Tandoori Roti", "description": "Crispy tandoor-baked whole wheat bread", "price": 60, "isPopular": False},
        {"category": "Beverages", "name": "Masala Chaas", "description": "Spiced buttermilk with cumin and mint", "price": 50, "isPopular": True},
        {"category": "Beverages", "name": "Mango Lassi", "description": "Creamy yogurt drink with Alphonso mango", "price": 120, "isPopular": False},
        {"category": "Beverages", "name": "Fresh Lime Soda", "description": "Refreshing lime with soda water", "price": 80, "isPopular": False},
        {"category": "Beverages", "name": "Masala Chai", "description": "Traditional Indian spiced tea", "price": 60, "isPopular": False},
        {"category": "Desserts", "name": "Gulab Jamun", "description": "Soft milk dumplings in rose-flavored syrup", "price": 120, "isPopular": True},
        {"category": "Desserts", "name": "Rasmalai", "description": "Cottage cheese patties in saffron milk", "price": 140, "isPopular": False},
        {"category": "Desserts", "name": "Kulfi", "description": "Traditional Indian ice cream with pistachios", "price": 100, "isPopular": False},
    ]
    item_ids = {}
    for item in menu_items:
        result = db.menu_items.insert_one({"restaurantId": restaurant_id, "categoryId": cat_ids[item["category"]], "name": item["name"], "description": item["description"], "price": item["price"], "imageUrl": None, "isAvailable": True, "isPopular": item["isPopular"], "createdAt": datetime.utcnow()})
        item_ids[item["name"]] = result.inserted_id
    
    table_ids = []
    for i in range(1, 11):
        result = db.tables.insert_one({"restaurantId": restaurant_id, "tableNumber": i, "qrToken": generate_qr_token(), "isActive": True, "createdAt": datetime.utcnow()})
        table_ids.append(result.inserted_id)
    
    demo_orders = [
        {"table_idx": 0, "items": [{"name": "Paneer Tikka", "qty": 2}, {"name": "Garlic Naan", "qty": 4}, {"name": "Butter Chicken", "qty": 1}], "status": "SERVED"},
        {"table_idx": 2, "items": [{"name": "Chicken Biryani", "qty": 2}, {"name": "Masala Chaas", "qty": 2}], "status": "PREPARING"},
        {"table_idx": 4, "items": [{"name": "Veg Samosa", "qty": 3}, {"name": "Dal Tadka", "qty": 1}, {"name": "Butter Roti", "qty": 3}], "status": "PENDING"},
    ]
    for idx, order_data in enumerate(demo_orders):
        subtotal = 0
        order_items_list = []
        for oi in order_data["items"]:
            item_id = item_ids.get(oi["name"])
            if item_id:
                menu_item = db.menu_items.find_one({"_id": item_id})
                if menu_item:
                    item_subtotal = menu_item["price"] * oi["qty"]
                    subtotal += item_subtotal
                    order_items_list.append({"menuItemId": item_id, "itemName": oi["name"], "price": menu_item["price"], "quantity": oi["qty"], "subtotal": item_subtotal})
        tax = round(subtotal * 0.05, 2)
        total = round(subtotal + tax, 2)
        order_result = db.orders.insert_one({"restaurantId": restaurant_id, "tableId": table_ids[order_data["table_idx"]], "tableNumber": order_data["table_idx"] + 1, "orderNumber": f"RQ{1001 + idx}", "status": order_data["status"], "customerName": "", "customerPhone": "", "subtotal": subtotal, "tax": tax, "total": total, "paymentMethod": "pay_at_counter", "paymentStatus": "pending", "createdAt": datetime.utcnow(), "updatedAt": datetime.utcnow()})
        for oi in order_items_list:
            oi["orderId"] = order_result.inserted_id
            db.order_items.insert_one(oi)
    
    print(f"Seeded: 1 owner, 1 restaurant, {len(categories_data)} categories, {len(menu_items)} menu items, 10 tables, {len(demo_orders)} orders")
    print("Demo login: demo@tableqr.com / demo123")
