import api from './client';
import type { User, Restaurant, Category, MenuItem, Table, Order, DashboardStats, ExtractedMenuItem, MenuSection } from '../types';

export const authApi = {
  register: (data: { name: string; email: string; phone: string; password: string }) => api.post<{ token: string; user: User }>('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post<{ token: string; user: User }>('/auth/login', data),
  getMe: () => api.get<User>('/auth/me'),
};

export const restaurantApi = {
  create: (data: Partial<Restaurant>) => api.post<Restaurant>('/restaurants', data),
  getAll: () => api.get<Restaurant[]>('/restaurants'),
  getOne: (id: string) => api.get<Restaurant>(`/restaurants/${id}`),
  update: (id: string, data: Partial<Restaurant>) => api.put<Restaurant>(`/restaurants/${id}`, data),
  uploadLogo: (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<{ logoUrl: string }>(`/restaurants/${id}/logo`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getBySlug: (slug: string) => api.get<Restaurant>(`/restaurants/slug/${slug}`),
};

export const menuApi = {
  getCategories: (restaurantId: string) => api.get<Category[]>(`/menu/${restaurantId}/categories`),
  createCategory: (restaurantId: string, data: { name: string; displayOrder?: number }) => api.post<Category>(`/menu/${restaurantId}/categories`, data),
  deleteCategory: (restaurantId: string, categoryId: string) => api.delete(`/menu/${restaurantId}/categories/${categoryId}`),
  getItems: (restaurantId: string) => api.get<MenuItem[]>(`/menu/${restaurantId}/items`),
  createItem: (restaurantId: string, data: Partial<MenuItem>) => api.post<MenuItem>(`/menu/${restaurantId}/items`, data),
  updateItem: (restaurantId: string, itemId: string, data: Partial<MenuItem>) => api.put<MenuItem>(`/menu/${restaurantId}/items/${itemId}`, data),
  deleteItem: (restaurantId: string, itemId: string) => api.delete(`/menu/${restaurantId}/items/${itemId}`),
  bulkImport: (restaurantId: string, items: ExtractedMenuItem[]) => api.post<{ imported: number; items: MenuItem[] }>(`/menu/${restaurantId}/bulk-import`, { items }),
  getPublicMenu: (restaurantId: string) => api.get<{ restaurant: Restaurant; menu: MenuSection[] }>(`/menu/public/${restaurantId}/menu`),
};

export const tableApi = {
  getAll: (restaurantId: string) => api.get<Table[]>(`/tables/${restaurantId}`),
  create: (restaurantId: string, tableNumber: number) => api.post<Table>(`/tables/${restaurantId}`, { tableNumber }),
  update: (restaurantId: string, tableId: string, data: Partial<Table>) => api.put<Table>(`/tables/${restaurantId}/${tableId}`, data),
  delete: (restaurantId: string, tableId: string) => api.delete(`/tables/${restaurantId}/${tableId}`),
  createBulk: (restaurantId: string, count: number) => api.post<{ created: number; tables: Table[] }>(`/tables/${restaurantId}/bulk?count=${count}`),
  getByQr: (qrToken: string) => api.get<{ table: Table; restaurant: Restaurant }>(`/tables/qr/${qrToken}`),
};

export const orderApi = {
  place: (data: { qrToken: string; items: { menuItemId: string; quantity: number }[]; paymentMethod?: string }) => api.post<Order>('/orders', data),
  getStatus: (orderId: string) => api.get<Order>(`/orders/${orderId}/status`),
  getByNumber: (orderNumber: string) => api.get<Order>(`/orders/number/${orderNumber}`),
  getRestaurantOrders: (restaurantId: string, status?: string) => {
    const params = status ? `?status=${status}` : '';
    return api.get<Order[]>(`/orders/restaurant/${restaurantId}${params}`);
  },
  updateStatus: (orderId: string, status: string) => api.put<Order>(`/orders/${orderId}/status`, { status }),
  getStats: (restaurantId: string) => api.get<DashboardStats>(`/orders/restaurant/${restaurantId}/stats`),
};

export const menuImportApi = {
  upload: (restaurantId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<{ imageUrl: string; filename: string }>(`/menu-import/${restaurantId}/upload`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  extract: (restaurantId: string) => api.post<{ itemsFound: number; categoriesFound: number; items: ExtractedMenuItem[]; confidence: number }>(`/menu-import/${restaurantId}/extract`),
  useDemo: (restaurantId: string) => api.post<{ itemsFound: number; categoriesFound: number; items: ExtractedMenuItem[] }>(`/menu-import/${restaurantId}/use-demo`),
};
