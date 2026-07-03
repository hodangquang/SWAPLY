import { useState, useEffect } from "react";
import { Booking } from "@/types";
import { apiClient } from "@/shared/api/apiClient";

export function useExchange() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProposals = async () => {
    setLoading(true);
    const data = await apiClient.fetchBookings();
    setBookings(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProposals();
  }, []);

  const createProposal = async (proposalData: Omit<Booking, "id" | "bookedAt">) => {
    const newProposal: Booking = {
      ...proposalData,
      id: `booking-${Date.now()}`,
      bookedAt: new Date().toISOString()
    };
    await apiClient.createBooking(newProposal);
    await loadProposals();
  };

  const cancelProposal = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đề xuất trao đổi này không?")) {
      await apiClient.cancelBooking(id);
      await loadProposals();
    }
  };

  return {
    bookings,
    loading,
    createProposal,
    cancelProposal,
    reloadProposals: loadProposals
  };
}
