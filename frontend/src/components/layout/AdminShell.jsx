import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AdminShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const adminMenu = [
    { label: "Dashboard", path: "/admin" },
    { label: "Services", path: "/admin/services" },
    { label: "Categories", path: "/admin/categories" },
    { label: "Providers", path: "/admin/providers" },
    { label: "Bookings", path: "/admin/bookings" },
    { label: "Warranty", path: "/admin/warranty" },
    { label: "Reviews", path: "/admin/reviews" },
    { label: "Analytics", path: "/admin/analytics" },
    { label: "Users", path: "/admin/users" },
    { label: "Profile", path: "/admin/profile" },
  ];

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 bg-gray-50 min-h-0">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block h-full">
          <Sidebar menu={adminMenu} />
        </div>
 

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="lg:hidden fixed top-0 left-0 h-full z-50 transform transition-transform duration-300">
            <Sidebar menu={adminMenu} onClose={() => setMobileMenuOpen(false)} />
          </div>
        </>
      )}

      {/* Content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 w-full overflow-y-auto">
        <Outlet />
      </main>
      </div>
    </div>
  );
}
