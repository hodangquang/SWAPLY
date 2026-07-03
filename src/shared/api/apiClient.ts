import { mockDb } from "./mockDb";
import { Property, Booking } from "@/types";

export const apiClient = {
  fetchProperties(): Promise<Property[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockDb.getProperties()), 300);
    });
  },

  createProperty(prop: Property): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockDb.addProperty(prop);
        resolve();
      }, 300);
    });
  },

  deleteProperty(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockDb.deleteProperty(id);
        resolve();
      }, 300);
    });
  },

  updatePropertyStatus(id: string, status: Property["status"]): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockDb.updatePropertyStatus(id, status);
        resolve();
      }, 300);
    });
  },

  fetchBookings(): Promise<Booking[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockDb.getBookings()), 300);
    });
  },

  createBooking(booking: Booking): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockDb.addBooking(booking);
        resolve();
      }, 300);
    });
  },

  cancelBooking(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockDb.cancelBooking(id);
        resolve();
      }, 300);
    });
  },

  fetchWishlist(): Promise<string[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockDb.getWishlist()), 300);
    });
  },

  toggleWishlist(id: string): Promise<string[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockDb.toggleWishlist(id)), 300);
    });
  }
};
