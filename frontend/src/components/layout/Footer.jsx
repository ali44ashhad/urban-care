import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-8 sm:mt-12">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 text-center text-gray-600 text-xs sm:text-sm">
        <p>© {new Date().getFullYear()} UrbanCare Platform — All Rights Reserved.</p>
      </div>
    </footer>
  );
}
