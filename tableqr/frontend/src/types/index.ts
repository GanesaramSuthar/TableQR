export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  logoUrl: string | null;
  isPublished: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  displayOrder: number;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  isPopular: boolean;
  createdAt: string;
}

export interface Table {
  id: string;
  restaurantId: string;
  tableNumber: number;
  qrToken: string;
  isActive: boolean;
  createdAt: string;
}

export interface OrderItem {
  id?: string;
  orderId?: string;
  menuItemId: string;
  itemName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  restaurantId: string;
  tableId: string;
  tableNumber: number;
  orderNumber: string;
  status: 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';
  customerName: string;
  customerPhone: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  activeTables: number;
  totalTables: number;
  pendingOrders: number;
  preparingOrders: number;
  completedOrders: number;
}

export interface ExtractedMenuItem {
  category: string;
  name: string;
  description: string;
  price: number;
  isPopular: boolean;
}

export interface MenuSection {
  category: Category | { id: string; name: string; displayOrder: number };
  items: MenuItem[];
}
