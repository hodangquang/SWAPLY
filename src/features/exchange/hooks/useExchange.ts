import { useState, useEffect } from "react";
import { Booking, Exchange } from "@/types";
import { apiClient } from "@/shared/api/apiClient";

export function useExchange() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProposals = async () => {
    setLoading(true);
    try {
      const [mockBookings, backendExchanges, properties] = await Promise.all([
        apiClient.fetchBookings(),
        apiClient.fetchExchanges().catch(() => []),
        apiClient.fetchProperties().catch(() => [])
      ]);

      // Map backend exchanges to Booking UI structure
      const mappedExchanges = backendExchanges.map((ex: Exchange) => {
        const receiverProperty = properties.find(p => p.id === ex.receiverListingId);
        const proposerProperty = properties.find(p => p.id === ex.proposerListingId);

        return {
          id: ex.id,
          propertyId: ex.receiverListingId,
          propertyName: receiverProperty?.title || `Sản phẩm nhận (ID: ${ex.receiverListingId.substring(0, 8)})`,
          propertyImage: receiverProperty?.images?.[0] || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
          checkIn: new Date(ex.createdAt).toLocaleDateString("vi-VN"),
          checkOut: "",
          guests: {
            adults: 1,
            children: 0
          },
          totalPrice: (receiverProperty?.price || 0) / 1000,
          bookedAt: ex.createdAt,
          // Custom exchange fields
          isExchange: true,
          status: ex.status,
          message: ex.message,
          proposerListingId: ex.proposerListingId,
          proposerPropertyName: proposerProperty?.title || `Sản phẩm đề xuất (ID: ${ex.proposerListingId.substring(0, 8)})`,
          proposerPropertyImage: proposerProperty?.images?.[0] || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
          proposerId: ex.proposerId,
          receiverId: ex.receiverId,
          receiverOwnerName: receiverProperty?.ownerName || "Chủ sản phẩm"
        } as Booking & {
          isExchange: boolean;
          status: string;
          message: string;
          proposerListingId: string;
          proposerPropertyName: string;
          proposerPropertyImage: string;
          proposerId: string;
          receiverId: string;
          receiverOwnerName: string;
        };
      });

      setBookings([...mappedExchanges, ...mockBookings]);
      setExchanges(backendExchanges);
    } catch (e) {
      console.error("Error loading exchange proposals:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, []);

  const createProposal = async (
    proposalData: Omit<Booking, "id" | "bookedAt"> & {
      isExchange?: boolean;
      proposerListingId?: string;
      receiverListingId?: string;
      message?: string;
    }
  ) => {
    if (proposalData.isExchange && proposalData.proposerListingId && proposalData.receiverListingId) {
      const created = await apiClient.createExchange({
        proposerListingId: proposalData.proposerListingId,
        receiverListingId: proposalData.receiverListingId,
        message: proposalData.message || ""
      });
      await loadProposals();
      return created;
    } else {
      const newProposal: Booking = {
        ...proposalData,
        id: `booking-${Date.now()}`,
        bookedAt: new Date().toISOString()
      };
      await apiClient.createBooking(newProposal);
      await loadProposals();
      return null;
    }
  };

  const cancelProposal = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đề xuất trao đổi này không?")) {
      if (id.startsWith("booking-")) {
        await apiClient.cancelBooking(id);
      } else {
        await apiClient.cancelExchange(id);
      }
      await loadProposals();
    }
  };

  return {
    bookings,
    exchanges,
    loading,
    createProposal,
    cancelProposal,
    reloadProposals: loadProposals
  };
}
