import { mockDb } from "./mockDb";
import { Property, Booking, Category } from "@/types";
import {
  createCategory,
  fetchCategories,
  fetchCategoryById as fetchCategoryByIdApi,
  updateCategory as updateCategoryApi,
  deleteCategory as deleteCategoryApi,
} from "./categoryApi";
import {
  approveListing as approveListingApi,
  createProperty as createPropertyApi,
  deleteProperty as deletePropertyApi,
  fetchListingById as fetchListingByIdApi,
  fetchMyFavorites as fetchMyFavoritesApi,
  fetchPendingListings as fetchPendingListingsApi,
  fetchProperties as fetchPropertiesApi,
  fetchMyListings as fetchMyListingsApi,
  rejectListing as rejectListingApi,
  renewListing as renewListingApi,
  submitListing as submitListingApi,
  toggleFavorite as toggleFavoriteApi,
  updateListing as updateListingApi,
  updatePropertyStatus as updatePropertyStatusApi,
  UpdateListingPayload,
  FavoriteResult,
  fetchAdminUsers as fetchAdminUsersApi,
  fetchAdminUserById as fetchAdminUserByIdApi,
  lockUser as lockUserApi,
  unlockUser as unlockUserApi,
  reportUser as reportUserApi,
  fetchAdminReports as fetchAdminReportsApi,
} from "./listingApi";
import {
  acceptExchange as acceptExchangeApi,
  cancelExchange as cancelExchangeApi,
  cancelExchangeRequest as cancelExchangeRequestApi,
  completeExchange as completeExchangeApi,
  createExchange,
  fetchExchangeById,
  fetchExchanges,
  fetchIncomingExchanges as fetchIncomingExchangesApi,
  rejectExchange as rejectExchangeApi,
} from "./exchangeApi";
import {
  createConversation as createConversationApi,
  fetchConversationById as fetchConversationByIdApi,
  fetchConversations as fetchConversationsApi,
  fetchMessages as fetchMessagesApi,
  sendMessage as sendMessageApi,
  ConversationDto,
  Conversation,
  Message,
} from "./conversationApi";
import {
  getUserReviews,
  getUserRating,
  createReview,
  createExchangeReview,
  fetchReviewById,
  fetchMyGivenReviews,
  fetchMyReceivedReviews,
} from "./reviewApi";

export const apiClient = {
  async fetchProperties(): Promise<Property[]> {
    return fetchPropertiesApi();
  },

  async fetchPendingListings(): Promise<Property[]> {
    return fetchPendingListingsApi();
  },

  async fetchAdminUsers(keyword: string = "", page: number = 1, pageSize: number = 100): Promise<any[]> {
    return fetchAdminUsersApi(keyword, page, pageSize);
  },

  async fetchAdminUserById(id: string): Promise<any | null> {
    return fetchAdminUserByIdApi(id);
  },

  async lockUser(id: string): Promise<void> {
    return lockUserApi(id);
  },

  async unlockUser(id: string): Promise<void> {
    return unlockUserApi(id);
  },

  async reportUser(targetId: string, reason: string, description: string): Promise<void> {
    return reportUserApi(targetId, reason, description);
  },

  async fetchAdminReports(page: number = 1, pageSize: number = 100): Promise<any[]> {
    return fetchAdminReportsApi(page, pageSize);
  },

  async fetchMyListings(): Promise<Property[]> {
    return fetchMyListingsApi();
  },

  async toggleFavorite(listingId: string): Promise<FavoriteResult> {
    return toggleFavoriteApi(listingId);
  },

  async renewListing(id: string): Promise<void> {
    return renewListingApi(id);
  },

  async fetchMyFavorites(): Promise<Property[]> {
    return fetchMyFavoritesApi();
  },

  async updateListing(id: string, payload: UpdateListingPayload): Promise<void> {
    return updateListingApi(id, payload);
  },

  async fetchListingById(id: string): Promise<Property | null> {
    return fetchListingByIdApi(id);
  },

  fetchCategories,
  createCategory,

  async fetchCategoryById(id: string): Promise<Category | null> {
    return fetchCategoryByIdApi(id);
  },

  async updateCategory(id: string, category: { name: string; description?: string }): Promise<Category> {
    return updateCategoryApi(id, category);
  },

  async deleteCategory(id: string): Promise<void> {
    return deleteCategoryApi(id);
  },

  async createProperty(prop: Property): Promise<void> {
    return createPropertyApi(prop);
  },

  async submitListing(id: string): Promise<void> {
    return submitListingApi(id);
  },

  async deleteProperty(id: string): Promise<void> {
    return deletePropertyApi(id);
  },

  async updatePropertyStatus(id: string, status: Property["status"]): Promise<void> {
    return updatePropertyStatusApi(id, status);
  },

  async approveListing(id: string): Promise<void> {
    return approveListingApi(id);
  },

  async rejectListing(id: string, reason?: string): Promise<void> {
    return rejectListingApi(id, reason);
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

  toggleWishlist(id: string): Promise<string[]> {
    return new Promise(async (resolve) => {
      try {
        const result = await toggleFavoriteApi(id);
        // Return updated wishlist state (isFavorited indicates the new state)
        // We'll update the local state based on the result
        resolve(result.isFavorited ? [id] : []);
      } catch {
        // Fallback to local storage if API fails
        const list = mockDb.toggleWishlist(id);
        resolve(list);
      }
    });
  },

  async fetchWishlist(): Promise<string[]> {
    try {
      const favorites = await fetchMyFavoritesApi();
      return favorites.map(p => p.id);
    } catch {
      return [];
    }
  },

  // Exchanges API endpoints
  async acceptExchange(id: string): Promise<void> {
    return acceptExchangeApi(id);
  },

  async rejectExchange(id: string): Promise<void> {
    return rejectExchangeApi(id);
  },

  async cancelExchange(id: string): Promise<void> {
    return cancelExchangeRequestApi(id);
  },

  async completeExchange(id: string): Promise<void> {
    return completeExchangeApi(id);
  },

  async fetchIncomingExchanges(): Promise<any[]> {
    return fetchIncomingExchangesApi();
  },

  createExchange,
  fetchExchanges,
  fetchExchangeById,

  // Reviews API
  getUserReviews,
  getUserRating,
  createReview,
  createExchangeReview,
  fetchReviewById,
  fetchMyGivenReviews,
  fetchMyReceivedReviews,

  // Conversations API
  async fetchConversations(): Promise<Conversation[]> {
    return fetchConversationsApi();
  },

  async createConversation(dto: ConversationDto): Promise<Conversation> {
    return createConversationApi(dto);
  },

  async fetchConversationById(id: string): Promise<Conversation | null> {
    return fetchConversationByIdApi(id);
  },

  async fetchMessages(conversationId: string): Promise<Message[]> {
    return fetchMessagesApi(conversationId);
  },

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    return sendMessageApi(conversationId, { content });
  },
};
