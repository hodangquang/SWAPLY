import React, { createContext, useContext, useState, ReactNode } from "react";
import { Property } from "@/types";

type PageType = "home" | "detail" | "chat" | "profile";

interface RouterContextProps {
  page: PageType;
  selectedProperty: Property | null;
  activeDashboardTab: "trips" | "wishlist" | "host" | null;
  navigate: (page: PageType, property?: Property | null, dashboardTab?: "trips" | "wishlist" | "host" | null) => void;
}

const RouterContext = createContext<RouterContextProps | undefined>(undefined);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<PageType>("home");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeDashboardTab, setActiveDashboardTab] = useState<"trips" | "wishlist" | "host" | null>(null);

  const navigate = (
    newPage: PageType,
    property: Property | null = null,
    dashboardTab: "trips" | "wishlist" | "host" | null = null
  ) => {
    setPage(newPage);
    setSelectedProperty(property);
    setActiveDashboardTab(dashboardTab);
  };

  return (
    <RouterContext.Provider value={{ page, selectedProperty, activeDashboardTab, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useRouter must be used within a RouterProvider");
  }
  return context;
}
