from pymongo import MongoClient
from pymongo.database import Database
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "tableqr")

client = MongoClient(MONGODB_URL)
db: Database = client[DATABASE_NAME]


def get_db() -> Database:
    return db


def init_db():
    """Initialize database indexes."""
    try:
        db.users.create_index("email", unique=True)
        db.restaurants.create_index("ownerId")
        db.restaurants.create_index("slug", unique=True)
        db.categories.create_index("restaurantId")
        db.menu_items.create_index("restaurantId")
        db.menu_items.create_index("categoryId")
        db.tables.create_index("restaurantId")
        db.tables.create_index("qrToken", unique=True)
        db.orders.create_index("restaurantId")
        db.orders.create_index("tableId")
        db.orders.create_index("orderNumber", unique=True, sparse=True)
        db.order_items.create_index("orderId")
        db.payments.create_index("orderId")
    except Exception as e:
        print(f"Index creation warning: {e}")
