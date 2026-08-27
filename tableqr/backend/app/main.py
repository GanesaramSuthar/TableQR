from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from .database import init_db
from .routers import auth, restaurants, menu, tables, orders, menu_import, websocket
from .seed import seed_database

app = FastAPI(title="TableQR API", version="1.0.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

upload_dir = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

app.include_router(auth.router)
app.include_router(restaurants.router)
app.include_router(menu.router)
app.include_router(tables.router)
app.include_router(orders.router)
app.include_router(menu_import.router)
app.include_router(websocket.router)


@app.on_event("startup")
async def startup():
    init_db()
    seed_database()


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "TableQR API"}
