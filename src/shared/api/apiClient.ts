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
  fetchMyListingsByStatus as fetchMyListingsByStatusApi,
  fetchListingsByCategory as fetchListingsByCategoryApi,
  fetchAdminAllListings as fetchAdminAllListingsApi,
  fetchAdminListingById as fetchAdminListingByIdApi,
  hideListing as hideListingApi,
  restoreListing as restoreListingApi,
  fetchDeletedListings as fetchDeletedListingsApi,
  permanentDeleteListing as permanentDeleteListingApi,
  fetchAdminPendingReports as fetchAdminPendingReportsApi,
  fetchAdminReportById as fetchAdminReportByIdApi,
  approveAdminReport as approveAdminReportApi,
  rejectAdminReport as rejectAdminReportApi,
  fetchMyReports as fetchMyReportsApi,
  fetchReportById as fetchReportByIdApi,
} from "./listingApi";
import {
  acceptExchange as acceptExchangeApi,
  cancelExchangeRequest as cancelExchangeRequestApi,
  completeExchange as completeExchangeApi,
  createExchange,
  fetchExchangeById,
  fetchExchanges,
  fetchIncomingExchanges as fetchIncomingExchangesApi,
  fetchOutgoingExchanges as fetchOutgoingExchangesApi,
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
import {
  fetchNotifications as fetchNotificationsApi,
  fetchUnreadNotifications as fetchUnreadNotificationsApi,
  fetchUnreadNotificationCount as fetchUnreadNotificationCountApi,
  markNotificationRead as markNotificationReadApi,
  markAllNotificationsRead as markAllNotificationsReadApi,
  Notification,
} from "./notificationApi";
import {
  fetchPaymentHistory as fetchPaymentHistoryApi,
  fetchPaymentById as fetchPaymentByIdApi,
  cancelPayment as cancelPaymentApi,
  createCheckout as createCheckoutApi,
  fetchPaymentReturn as fetchPaymentReturnApi,
  handlePaymentIpn as handlePaymentIpnApi,
  fetchMockPayPage as fetchMockPayPageApi,
  confirmMockPayment as confirmMockPaymentApi,
  cancelMockPayment as cancelMockPaymentApi,
  Payment,
  CheckoutPayload,
  CheckoutResult,
} from "./paymentApi";
import {
  fetchBoostPackages as fetchBoostPackagesApi,
  fetchBoostQuota as fetchBoostQuotaApi,
  subscribeBoostPackage as subscribeBoostPackageApi,
  fetchCurrentBoost as fetchCurrentBoostApi,
  cancelBoostSubscription as cancelBoostSubscriptionApi,
  BoostPackage,
  BoostQuota,
  ActiveBoost,
} from "./boostApi";
import {
  fetchAdminBoostPackages as fetchAdminBoostPackagesApi,
  createAdminBoostPackage as createAdminBoostPackageApi,
  fetchAdminBoostPackageById as fetchAdminBoostPackageByIdApi,
  updateAdminBoostPackage as updateAdminBoostPackageApi,
  deleteAdminBoostPackage as deleteAdminBoostPackageApi,
  AdminBoostPackage,
  AdminBoostPackagePayload,
} from "./adminBoostApi";

export const apiClient = {

  // ── Listings ─────────────────────────────────────────────────────────────────
  async fetchProperties(): Promise<Property[]> {
    return fetchPropertiesApi();
  },

  async fetchListingById(id: string): Promise<Property | null> {
    return fetchListingByIdApi(id);
  },

  async fetchMyListings(): Promise<Property[]> {
    return fetchMyListingsApi();
  },

  /** GET /api/Listings/my/{status} */
  async fetchMyListingsByStatus(status: string): Promise<Property[]> {
    return fetchMyListingsByStatusApi(status);
  },

  /** GET /api/Listings/category/{categoryId} */
  async fetchListingsByCategory(categoryId: string): Promise<Property[]> {
    return fetchListingsByCategoryApi(categoryId);
  },

  async createProperty(prop: Property): Promise<void> {
    return createPropertyApi(prop);
  },

  async updateListing(id: string, payload: UpdateListingPayload): Promise<void> {
    return updateListingApi(id, payload);
  },

  async deleteProperty(id: string): Promise<void> {
    return deletePropertyApi(id);
  },

  async submitListing(id: string): Promise<void> {
    return submitListingApi(id);
  },

  async renewListing(id: string): Promise<void> {
    return renewListingApi(id);
  },

  async toggleFavorite(listingId: string): Promise<FavoriteResult> {
    return toggleFavoriteApi(listingId);
  },

  async fetchMyFavorites(): Promise<Property[]> {
    return fetchMyFavoritesApi();
  },

  async updatePropertyStatus(id: string, status: Property["status"]): Promise<void> {
    return updatePropertyStatusApi(id, status);
  },

  // ── Categories ────────────────────────────────────────────────────────────────
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

  // ── Exchanges ─────────────────────────────────────────────────────────────────
  createExchange,
  fetchExchanges,
  fetchExchangeById,

  async fetchIncomingExchanges(): Promise<any[]> {
    return fetchIncomingExchangesApi();
  },

  /** GET /api/Exchanges/my/outgoing */
  async fetchOutgoingExchanges(): Promise<any[]> {
    return fetchOutgoingExchangesApi();
  },

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

  // ── Conversations & Messages ──────────────────────────────────────────────────
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

  // ── Reviews ───────────────────────────────────────────────────────────────────
  getUserReviews,
  getUserRating,
  createReview,
  createExchangeReview,
  fetchReviewById,
  fetchMyGivenReviews,
  fetchMyReceivedReviews,

  // ── Notifications ─────────────────────────────────────────────────────────────
  /** GET /api/Notifications */
  async fetchNotifications(): Promise<Notification[]> {
    return fetchNotificationsApi();
  },

  /** GET /api/Notifications/unread */
  async fetchUnreadNotifications(): Promise<Notification[]> {
    return fetchUnreadNotificationsApi();
  },

  /** GET /api/Notifications/unread-count */
  async fetchUnreadNotificationCount(): Promise<number> {
    return fetchUnreadNotificationCountApi();
  },

  /** PUT /api/Notifications/{id}/read */
  async markNotificationRead(id: string): Promise<void> {
    return markNotificationReadApi(id);
  },

  /** PUT /api/Notifications/read-all */
  async markAllNotificationsRead(): Promise<void> {
    return markAllNotificationsReadApi();
  },

  // ── Payments (VNPAY) ──────────────────────────────────────────────────────────
  /** GET /api/Payments */
  async fetchPaymentHistory(): Promise<Payment[]> {
    return fetchPaymentHistoryApi();
  },

  /** GET /api/Payments/{id} */
  async fetchPaymentById(id: string): Promise<Payment | null> {
    return fetchPaymentByIdApi(id);
  },

  /** DELETE /api/Payments/{id} */
  async cancelPayment(id: string): Promise<void> {
    return cancelPaymentApi(id);
  },

  /** POST /api/Payments/checkout */
  async createCheckout(payload: CheckoutPayload): Promise<CheckoutResult> {
    return createCheckoutApi(payload);
  },

  /** GET /api/Payments/return */
  async fetchPaymentReturn(queryString: string): Promise<Record<string, unknown>> {
    return fetchPaymentReturnApi(queryString);
  },

  /** POST /api/Payments/ipn */
  async handlePaymentIpn(payload: Record<string, unknown>): Promise<void> {
    return handlePaymentIpnApi(payload);
  },

  /** GET /api/Payments/mock-pay */
  async fetchMockPayPage(transactionRef: string): Promise<Record<string, unknown>> {
    return fetchMockPayPageApi(transactionRef);
  },

  /** POST /api/Payments/mock-pay/confirm */
  async confirmMockPayment(transactionRef: string): Promise<void> {
    return confirmMockPaymentApi(transactionRef);
  },

  /** POST /api/Payments/mock-pay/cancel */
  async cancelMockPayment(transactionRef: string): Promise<void> {
    return cancelMockPaymentApi(transactionRef);
  },

  // ── Boost Packages (User) ─────────────────────────────────────────────────────
  /** GET /api/boost/packages */
  async fetchBoostPackages(): Promise<BoostPackage[]> {
    return fetchBoostPackagesApi();
  },

  /** GET /api/boost/quota */
  async fetchBoostQuota(): Promise<BoostQuota> {
    return fetchBoostQuotaApi();
  },

  /** POST /api/boost/subscribe/{packageId} */
  async subscribeBoostPackage(packageId: string): Promise<void> {
    return subscribeBoostPackageApi(packageId);
  },

  /** GET /api/boost/current */
  async fetchCurrentBoost(): Promise<ActiveBoost | null> {
    return fetchCurrentBoostApi();
  },

  /** DELETE /api/boost/cancel */
  async cancelBoostSubscription(): Promise<void> {
    return cancelBoostSubscriptionApi();
  },

  // ── Reports (User) ────────────────────────────────────────────────────────────
  /** POST /api/reports */
  async reportUser(targetId: string, reason: string, description: string): Promise<void> {
    return reportUserApi(targetId, reason, description);
  },

  /** GET /api/reports */
  async fetchMyReports(): Promise<any[]> {
    return fetchMyReportsApi();
  },

  /** GET /api/reports/{id} */
  async fetchReportById(id: string): Promise<any | null> {
    return fetchReportByIdApi(id);
  },

  // ── Admin – Users ─────────────────────────────────────────────────────────────
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

  // ── Admin – Listings ──────────────────────────────────────────────────────────
  /** GET /api/admin/listings */
  async fetchAdminAllListings(page: number = 1, pageSize: number = 100): Promise<Property[]> {
    return fetchAdminAllListingsApi(page, pageSize);
  },

  async fetchAdminListingById(id: string): Promise<Property | null> {
    return fetchAdminListingByIdApi(id);
  },

  async fetchPendingListings(): Promise<Property[]> {
    return fetchPendingListingsApi();
  },

  async approveListing(id: string): Promise<void> {
    return approveListingApi(id);
  },

  async rejectListing(id: string, reason?: string): Promise<void> {
    return rejectListingApi(id, reason);
  },

  /** PUT /api/admin/listings/{id}/hide */
  async hideListing(id: string): Promise<void> {
    return hideListingApi(id);
  },

  /** PUT /api/admin/listings/{id}/restore */
  async restoreListing(id: string): Promise<void> {
    return restoreListingApi(id);
  },

  /** GET /api/admin/listings/deleted */
  async fetchDeletedListings(page: number = 1, pageSize: number = 100): Promise<Property[]> {
    return fetchDeletedListingsApi(page, pageSize);
  },

  /** DELETE /api/admin/listings/{id} */
  async permanentDeleteListing(id: string): Promise<void> {
    return permanentDeleteListingApi(id);
  },

  // ── Admin – Reports ───────────────────────────────────────────────────────────
  async fetchAdminReports(page: number = 1, pageSize: number = 100): Promise<any[]> {
    return fetchAdminReportsApi(page, pageSize);
  },

  /** GET /api/admin/reports/pending */
  async fetchAdminPendingReports(): Promise<any[]> {
    return fetchAdminPendingReportsApi();
  },

  /** GET /api/admin/reports/{id} */
  async fetchAdminReportById(id: string): Promise<any | null> {
    return fetchAdminReportByIdApi(id);
  },

  /** PUT /api/admin/reports/{id}/approve */
  async approveAdminReport(id: string, adminNote?: string): Promise<void> {
    return approveAdminReportApi(id, adminNote);
  },

  /** PUT /api/admin/reports/{id}/reject */
  async rejectAdminReport(id: string, adminNote?: string): Promise<void> {
    return rejectAdminReportApi(id, adminNote);
  },

  // ── Admin – Boost Packages ────────────────────────────────────────────────────
  /** GET /api/admin/boost-packages */
  async fetchAdminBoostPackages(): Promise<AdminBoostPackage[]> {
    return fetchAdminBoostPackagesApi();
  },

  /** POST /api/admin/boost-packages */
  async createAdminBoostPackage(payload: AdminBoostPackagePayload): Promise<AdminBoostPackage> {
    return createAdminBoostPackageApi(payload);
  },

  /** GET /api/admin/boost-packages/{id} */
  async fetchAdminBoostPackageById(id: string): Promise<AdminBoostPackage | null> {
    return fetchAdminBoostPackageByIdApi(id);
  },

  /** PUT /api/admin/boost-packages/{id} */
  async updateAdminBoostPackage(id: string, payload: AdminBoostPackagePayload): Promise<AdminBoostPackage> {
    return updateAdminBoostPackageApi(id, payload);
  },

  /** DELETE /api/admin/boost-packages/{id} */
  async deleteAdminBoostPackage(id: string): Promise<void> {
    return deleteAdminBoostPackageApi(id);
  },

  // ── Legacy / Bookings (mock) ──────────────────────────────────────────────────
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
        resolve(result.isFavorited ? [id] : []);
      } catch {
        const list = mockDb.toggleWishlist(id);
        resolve(list);
      }
    });
  },

  async fetchWishlist(): Promise<string[]> {
    try {
      const favorites = await fetchMyFavoritesApi();
      return favorites.map((p) => p.id);
    } catch {
      return [];
    }
  },
};
