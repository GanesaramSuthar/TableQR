# TableQR

A full-stack SaaS platform for restaurants and dhabas in Rajasthan, India. Customers scan QR codes on tables to browse menus, place orders, and track order status in real-time.

## Features

- **QR Code Ordering**: Each table gets a unique QR code
- **AI Menu Import**: Upload a photo of your menu → digital menu
- **Real-time Orders**: WebSocket-based live order updates
- **Multi-restaurant**: Support for multiple restaurants
- **Owner Dashboard**: Sales, orders, and table management
- **Customer Ordering**: No app download needed

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: FastAPI, Python
- **Database**: MongoDB
- **Real-time**: WebSockets

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- MongoDB running on localhost:27017

### Backend

```bash
cd backend
pip install fastapi uvicorn pymongo python-multipart python-jose[cryptography] passlib[bcrypt] aiofiles python-dotenv qrcode[pil] pillow websockets
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Demo Account

- Email: demo@tableqr.com
- Password: demo123

## API Routes

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Restaurants
- POST /api/restaurants
- GET /api/restaurants
- GET /api/restaurants/:id
- PUT /api/restaurants/:id

### Menu
- GET /api/menu/:restaurantId/categories
- POST /api/menu/:restaurantId/categories
- GET /api/menu/:restaurantId/items
- POST /api/menu/:restaurantId/items
- PUT /api/menu/:restaurantId/items/:itemId
- DELETE /api/menu/:restaurantId/items/:itemId
- POST /api/menu/:restaurantId/bulk-import
- GET /api/menu/public/:restaurantId/menu

### Tables
- GET /api/tables/:restaurantId
- POST /api/tables/:restaurantId
- POST /api/tables/:restaurantId/bulk
- GET /api/tables/qr/:qrToken

### Orders
- POST /api/orders
- GET /api/orders/:orderId/status
- GET /api/orders/restaurant/:restaurantId
- PUT /api/orders/:orderId/status
- GET /api/orders/restaurant/:restaurantId/stats

### Menu Import
- POST /api/menu-import/:restaurantId/upload
- POST /api/menu-import/:restaurantId/extract
- POST /api/menu-import/:restaurantId/use-demo

### WebSocket
- ws://localhost:8000/ws/restaurant/:restaurantId
- ws://localhost:8000/ws/order/:orderId
