export interface Property {
  id: string;
  title: string;
  hostType: string;
  hostName: string;
  hostAvatar: string;
  category: string;
  price: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  description: string;
  amenities: string[];
  location: string;
  isGuestFavorite: boolean;
  maxGuests: number;
  isExperience: boolean;
  dateRange: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyImage: string;
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
  };
  totalPrice: number;
  bookedAt: string;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  date: string;
  rating: number;
  content: string;
}
