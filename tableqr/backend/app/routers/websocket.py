from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, Set

router = APIRouter(tags=["websocket"])


class ConnectionManager:
    def __init__(self):
        self.restaurant_connections: Dict[str, Set[WebSocket]] = {}
        self.order_connections: Dict[str, Set[WebSocket]] = {}

    async def connect_restaurant(self, websocket: WebSocket, restaurant_id: str):
        await websocket.accept()
        if restaurant_id not in self.restaurant_connections:
            self.restaurant_connections[restaurant_id] = set()
        self.restaurant_connections[restaurant_id].add(websocket)

    async def connect_order(self, websocket: WebSocket, order_id: str):
        await websocket.accept()
        if order_id not in self.order_connections:
            self.order_connections[order_id] = set()
        self.order_connections[order_id].add(websocket)

    def disconnect_restaurant(self, websocket: WebSocket, restaurant_id: str):
        if restaurant_id in self.restaurant_connections:
            self.restaurant_connections[restaurant_id].discard(websocket)

    def disconnect_order(self, websocket: WebSocket, order_id: str):
        if order_id in self.order_connections:
            self.order_connections[order_id].discard(websocket)

    async def notify_restaurant(self, restaurant_id: str, message: dict):
        if restaurant_id in self.restaurant_connections:
            dead = set()
            for ws in self.restaurant_connections[restaurant_id]:
                try:
                    await ws.send_json(message)
                except:
                    dead.add(ws)
            self.restaurant_connections[restaurant_id] -= dead

    async def notify_order(self, order_id: str, message: dict):
        if order_id in self.order_connections:
            dead = set()
            for ws in self.order_connections[order_id]:
                try:
                    await ws.send_json(message)
                except:
                    dead.add(ws)
            self.order_connections[order_id] -= dead


manager = ConnectionManager()


@router.websocket("/ws/restaurant/{restaurant_id}")
async def restaurant_ws(websocket: WebSocket, restaurant_id: str):
    await manager.connect_restaurant(websocket, restaurant_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_restaurant(websocket, restaurant_id)


@router.websocket("/ws/order/{order_id}")
async def order_ws(websocket: WebSocket, order_id: str):
    await manager.connect_order(websocket, order_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_order(websocket, order_id)


async def notify_new_order(restaurant_id: str, order_data: dict):
    await manager.notify_restaurant(restaurant_id, {"type": "NEW_ORDER", "data": order_data})


async def notify_order_status_change(order_id: str, restaurant_id: str, status: str, order_data: dict):
    await manager.notify_order(order_id, {"type": "STATUS_UPDATE", "status": status, "data": order_data})
    await manager.notify_restaurant(restaurant_id, {"type": "ORDER_STATUS_CHANGED", "orderId": order_id, "status": status, "data": order_data})
