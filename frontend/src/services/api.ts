import axios from "axios";
import type {
  BookingsResponse,
  ConfigResponse,
  Court,
  TimeSlot,
} from "../types";

const API_BASE_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para añadir el token en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  updateProfile: async (data: { username?: string; phone?: string }) => {
    const response = await api.put("/auth/profile", data);
    return response.data;
  },
};

export const bookingService = {
  getBookings: async (date?: string): Promise<BookingsResponse> => {
    const url = date ? `/bookings?date=${date}` : "/bookings";
    const response = await api.get(url);
    return response.data;
  },

  createBooking: async (bookingData: any) => {
    const response = await api.post("/bookings", bookingData);
    return response.data;
  },

  deleteBooking: async (id: string) => {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  },

  updateBooking: async (id: string, data: any) => {
    const response = await api.put(`/bookings/${id}`, data);
    return response.data;
  },
};

export const configService = {
  getCourts: async (all = false): Promise<ConfigResponse<Court>> => {
    const response = await api.get(`/config/courts${all ? "?all=true" : ""}`);
    return response.data;
  },

  updateCourt: async (id: string, data: Partial<Court>): Promise<any> => {
    const response = await api.put(`/config/courts/${id}`, data);
    return response.data;
  },

  getSlots: async (all = false): Promise<ConfigResponse<TimeSlot>> => {
    const response = await api.get(`/config/slots${all ? "?all=true" : ""}`);
    return response.data;
  },

  updateSlot: async (id: string, data: Partial<TimeSlot>): Promise<any> => {
    const response = await api.put(`/config/slots/${id}`, data);
    return response.data;
  },
};

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get("/notifications");
    return response.data;
  },

  markAllRead: async () => {
    const response = await api.put("/notifications/mark-all-read");
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
};

export const userService = {
  getUsers: async (): Promise<any> => {
    const response = await api.get("/users");
    return response.data;
  },
  createUser: async (data: any): Promise<any> => {
    const response = await api.post("/users", data);
    return response.data;
  },
  updateUser: async (id: string, data: any): Promise<any> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
  deleteUser: async (id: string): Promise<any> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  getUserHistory: async (id: string): Promise<any> => {
    const response = await api.get(`/users/${id}/history`);
    return response.data;
  },
  clearPenalties: async (id: string): Promise<any> => {
    const response = await api.post(`/users/${id}/clear-penalties`);
    return response.data;
  },
};
