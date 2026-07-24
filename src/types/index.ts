export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  ownerId?: string;
  ownerName?: string;
  ownerAvatar?: string;
  categoryId?: string;
  categoryName?: string;
  estimatedValue?: number;
  currency?: string;
  condition?: ItemCondition;
  conditionName?: string;
  status?: ListingStatus;
  brand?: string;
  exchangeWish?: string;
  cashTopUpAmount?: number;
  cashTopUpCurrency?: string;
  location?: string;
  viewCount?: number;
  favoriteCount?: number;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string;
  rejectionReason?: string | null;
  // Legacy/compatible fields
  hostName?: string;
  hostAvatar?: string;
  hostType?: string;
  price?: number;
  rating?: number;
  reviewsCount?: number;
  amenities?: string[];
  isGuestFavorite?: boolean;
  maxGuests?: number;
  isExperience?: boolean;
  dateRange?: string;
  category?: string;
  imageFiles?: File[];
}

export type ItemCondition = "New" | "LikeNew" | "Good" | "Fair";
export type ListingStatus = "Pending" | "Active" | "Approved" | "Rejected" | "Expired";

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

export interface ExchangeDto {
  proposerListingId: string;
  receiverListingId: string;
  message: string;
}

export interface Exchange {
  id: string;
  proposerListingId: string;
  receiverListingId: string;
  proposerId: string;
  receiverId: string;
  status: "Pending" | "Accepted" | "Rejected" | "Cancelled";
  message: string;
  createdAt: string;
  updatedAt: string | null;
}

