import { Property, Booking } from "@/types";
import { INITIAL_PROPERTIES } from "@/data";

const KEYS = {
  PROPERTIES: "swaply_properties",
  BOOKINGS: "swaply_bookings",
  WISHLIST: "swaply_wishlist",
  MESSAGES: "swaply_messages"
};

export const mockDb = {
  init() {
    if (!localStorage.getItem(KEYS.PROPERTIES)) {
      localStorage.setItem(KEYS.PROPERTIES, JSON.stringify(INITIAL_PROPERTIES));
    }
    if (!localStorage.getItem(KEYS.BOOKINGS)) {
      localStorage.setItem(KEYS.BOOKINGS, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.WISHLIST)) {
      localStorage.setItem(KEYS.WISHLIST, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.MESSAGES)) {
      localStorage.setItem(KEYS.MESSAGES, JSON.stringify([]));
    }
  },

  getProperties(): Property[] {
    this.init();
    try {
      const data = localStorage.getItem(KEYS.PROPERTIES);
      return data ? JSON.parse(data) : INITIAL_PROPERTIES;
    } catch {
      return INITIAL_PROPERTIES;
    }
  },

  saveProperties(properties: Property[]) {
    localStorage.setItem(KEYS.PROPERTIES, JSON.stringify(properties));
  },

  addProperty(property: Property) {
    const list = this.getProperties();
    list.unshift(property);
    this.saveProperties(list);
  },

  deleteProperty(id: string) {
    let list = this.getProperties();
    list = list.filter(p => p.id !== id);
    this.saveProperties(list);
  },

  updatePropertyStatus(id: string, status: Property["status"]) {
    const list = this.getProperties();
    const item = list.find(p => p.id === id);
    if (item) {
      item.status = status;
      this.saveProperties(list);
    }
  },

  getBookings(): Booking[] {
    this.init();
    try {
      const data = localStorage.getItem(KEYS.BOOKINGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveBookings(bookings: Booking[]) {
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings));
  },

  addBooking(booking: Booking) {
    const list = this.getBookings();
    list.unshift(booking);
    this.saveBookings(list);
  },

  cancelBooking(id: string) {
    let list = this.getBookings();
    list = list.filter(b => b.id !== id);
    this.saveBookings(list);
  },

  getWishlist(): string[] {
    this.init();
    try {
      const data = localStorage.getItem(KEYS.WISHLIST);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleWishlist(id: string) {
    let list = this.getWishlist();
    if (list.includes(id)) {
      list = list.filter(item => item !== id);
    } else {
      list.push(id);
    }
    localStorage.setItem(KEYS.WISHLIST, JSON.stringify(list));
    return list;
  }
};
