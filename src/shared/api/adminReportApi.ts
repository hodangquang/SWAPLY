import {
  fetchAdminReports as fetchAdminReportsApi,
  fetchAdminPendingReports as fetchAdminPendingReportsApi,
  fetchAdminReportById as fetchAdminReportByIdApi,
  approveAdminReport as approveAdminReportApi,
  rejectAdminReport as rejectAdminReportApi,
} from "./listingApi";

export interface AdminReport {
  id: string;
  reporterId?: string;
  reporterName: string;
  targetType: string;
  targetId: string;
  targetName: string;
  reason: string;
  description: string;
  status: string;
  adminNote?: string;
  createdAt: string;
  processedAt?: string;
}

export async function fetchAdminReports(page: number = 1, pageSize: number = 100): Promise<AdminReport[]> {
  return fetchAdminReportsApi(page, pageSize);
}

export async function fetchAdminPendingReports(): Promise<AdminReport[]> {
  return fetchAdminPendingReportsApi();
}

export async function fetchAdminReportById(id: string): Promise<AdminReport | null> {
  return fetchAdminReportByIdApi(id);
}

export async function approveAdminReport(id: string, adminNote: string = "Đã duyệt báo cáo"): Promise<void> {
  return approveAdminReportApi(id, adminNote);
}

export async function rejectAdminReport(id: string, adminNote: string = "Đã bác bỏ báo cáo"): Promise<void> {
  return rejectAdminReportApi(id, adminNote);
}
