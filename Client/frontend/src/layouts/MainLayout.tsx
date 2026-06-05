import React from "react";
import { NavLink, Outlet } from "react-router-dom";

export const MainLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white tracking-wider uppercase">
            CO₂ Tracker
          </h2>
          <p className="text-xs text-emerald-400 font-medium mt-1">
            Clean Architecture & React Router 6 Demo
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {/* Navigation Link 1: Dashboard / Emissionen */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              `w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            📊 Emissionen erfassen
          </NavLink>

          {/* Navigation Link 2: Standorte */}
          <NavLink
            to="/facilities"
            className={({ isActive }) =>
              `w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            🏢 Standorte (Facilities)
          </NavLink>

          {/* Navigation Link 3: Fuhrpark */}
          <NavLink
            to="/vehicles"
            className={({ isActive }) =>
              `w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            🚗 Fuhrpark (Vehicles)
          </NavLink>

          {/* 🔥 NEU - Navigation Link 4: Emissionskategorien */}
          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            🏷️ Emissionskategorien
          </NavLink>
        </nav>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
          © {new Date().getFullYear()} GHG Dashboard
        </div>
      </aside>

      {/* HAUPTINHALT (Rechte Seite) */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Outlet ist der Platzhalter, in den React-Router die jeweils aktive Seite rendert */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};
