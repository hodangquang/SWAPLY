import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Property } from "@/types";

type PageType = "home" | "detail" | "chat" | "profile" | "admin";

interface RouterContextProps {
  page: PageType;
  selectedProperty: Property | null;
  activeDashboardTab: "trips" | "wishlist" | "host" | null;
  navigate: (page: PageType, property?: Property | null, dashboardTab?: "trips" | "wishlist" | "host" | null) => void;
}

const RouterContext = createContext<RouterContextProps | undefined>(undefined);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<PageType>(() => {
    const savedPage = sessionStorage.getItem("swaply_page");
    if (savedPage) return savedPage as PageType;
    return window.location.pathname === "/admin" || window.location.pathname === "/admin/" ? "admin" : "home";
  });
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(() => {
    const savedProp = sessionStorage.getItem("swaply_selected_property");
    try {
      return savedProp ? JSON.parse(savedProp) : null;
    } catch {
      return null;
    }
  });
  const [activeDashboardTab, setActiveDashboardTab] = useState<"trips" | "wishlist" | "host" | null>(() => {
    return (sessionStorage.getItem("swaply_dashboard_tab") as "trips" | "wishlist" | "host" | null) || null;
  });

  const navigate = (
    newPage: PageType,
    property: Property | null = null,
    dashboardTab: "trips" | "wishlist" | "host" | null = null
  ) => {
    setPage(newPage);
    setSelectedProperty(property);
    setActiveDashboardTab(dashboardTab);

    // Save state to sessionStorage to preserve across browser Refresh (F5)
    sessionStorage.setItem("swaply_page", newPage);
    if (property) {
      sessionStorage.setItem("swaply_selected_property", JSON.stringify(property));
    } else {
      sessionStorage.removeItem("swaply_selected_property");
    }
    if (dashboardTab) {
      sessionStorage.setItem("swaply_dashboard_tab", dashboardTab);
    } else {
      sessionStorage.removeItem("swaply_dashboard_tab");
    }

    // Update browser URL path without page refresh
    if (newPage === "admin") {
      window.history.pushState({}, "", "/admin");
    } else if (newPage === "home") {
      window.history.pushState({}, "", "/");
      sessionStorage.removeItem("swaply_page");
      sessionStorage.removeItem("swaply_selected_property");
      sessionStorage.removeItem("swaply_dashboard_tab");
    } else {
      window.history.pushState({}, "", `/${newPage}`);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === "/admin" || path === "/admin/") {
        setPage("admin");
      } else if (path === "/" || path === "") {
        setPage("home");
      } else {
        const cleanPath = path.replace(/^\/+/, "") as PageType;
        if (["home", "detail", "chat", "profile", "admin"].includes(cleanPath)) {
          setPage(cleanPath);
        }
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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
