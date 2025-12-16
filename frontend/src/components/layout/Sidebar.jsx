// import React from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import { useAuthContext } from "../../context/AuthContext";

// export default function Sidebar({ menu = [], onClose }) {
//   const { user, logout } = useAuthContext();
//   const navigate = useNavigate();

//   return (
//     <aside className="w-64 min-h-screen bg-white border-r shadow-sm p-4 flex flex-col">
//       <div className="mb-8">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
//             <p className="text-sm text-gray-500">{user?.role?.toUpperCase()}</p>
//           </div>
//           {/* Close button for mobile */}
//           {onClose && (
//             <button
//               onClick={onClose}
//               className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
//               aria-label="Close menu"
//             >
//               <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
//                 <path d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           )}
//         </div>
//       </div>

//       <nav className="space-y-2 flex-1">
//         {menu && menu.length > 0 ? menu.map((item) => (
//           <NavLink
//             key={item.path}
//             to={item.path}
//             onClick={onClose}
//             className={({ isActive }) =>
//               `block px-4 py-3 rounded-lg transition text-sm md:text-base ${
//                 isActive
//                   ? "bg-blue-600 text-white shadow"
//                   : "text-gray-700 hover:bg-gray-100"
//               }`
//             }
//           >
//             {item.label}
//           </NavLink>
//         )) : (
//           <p className="text-gray-500 text-sm">No menu items</p>
//         )}
//       </nav>

//       {/* Profile & Logout Section */}
//       <div className="mt-auto pt-4 border-t space-y-2">
//         {/* Show Profile only for client/provider, not admin */}
//         {user?.role !== 'admin' && (
//           <NavLink
//             to={`/${user?.role}/profile`}
//             onClick={onClose}
//             className={({ isActive }) =>
//               `flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm md:text-base ${
//                 isActive
//                   ? "bg-blue-600 text-white shadow"
//                   : "text-gray-700 hover:bg-gray-100"
//               }`
//             }
//           >
//             <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
//               <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//             </svg>
//             <span>Profile</span>
//           </NavLink>
//         )}

//         <button
//           onClick={() => {
//             logout();
//             navigate('/');
//             if (onClose) onClose();
//           }}
//           className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm md:text-base text-red-600 hover:bg-red-50 font-medium"
//         >
//           <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
//             <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//           </svg>
//           <span>Logout</span>
//         </button>
//       </div>
//     </aside>
//   );
// }

import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

export default function Sidebar({ menu = [], onClose }) {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  // helper: dashboard (root) route exact match only
  const isRootDashboard = (path) =>
    path === "/admin" || path === "/provider";

  return (
    <aside className="w-64 min-h-screen bg-white border-r shadow-sm p-4 flex flex-col">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
            <p className="text-sm text-gray-500">
              {user?.role?.toUpperCase()}
            </p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Close menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Menu */}
      <nav className="space-y-2 flex-1">
        {menu.length > 0 ? (
          menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={isRootDashboard(item.path)}
              onClick={onClose}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg transition text-sm md:text-base ${
                  isActive
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No menu items</p>
        )}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t space-y-2">
        
        {/* Profile (not for admin) */}
        {user?.role !== "admin" && (
          <NavLink
            to={`/${user?.role}/profile`}
            end
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm md:text-base ${
                isActive
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>Profile</span>
          </NavLink>
        )}

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            navigate("/");
            onClose?.();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm md:text-base text-red-600 hover:bg-red-50 font-medium"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
