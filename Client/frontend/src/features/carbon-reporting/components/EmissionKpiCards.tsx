import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { type EmissionRecordListItemDto } from "../types/emission.types";

interface EmissionKpiCardsProps {
  records: EmissionRecordListItemDto[];
}

export const EmissionKpiCards: React.FC<EmissionKpiCardsProps> = ({
  records,
}) => {
  // 1. Berechnung der KPI-Werte
  const totalCO2 = records.reduce((sum, r) => sum + (r.calculatedCO2e || 0), 0);

  const scope1CO2 = records
    .filter((r) => {
      const name = r.categoryName?.toLowerCase() || "";
      return (
        name.includes("diesel") ||
        name.includes("benzin") ||
        name.includes("erdgas") ||
        name.includes("heizöl")
      );
    })
    .reduce((sum, r) => sum + (r.calculatedCO2e || 0), 0);

  const scope2CO2 = records
    .filter((r) => {
      const name = r.categoryName?.toLowerCase() || "";
      return name.includes("strom") || name.includes("netz");
    })
    .reduce((sum, r) => sum + (r.calculatedCO2e || 0), 0);

  const scope3CO2 = Math.max(0, totalCO2 - scope1CO2 - scope2CO2);

  // Datenstruktur für das Recharts-Diagramm
  const chartData = [
    {
      name: "Scope 1 (Direkt)",
      value: parseFloat(scope1CO2.toFixed(1)),
      color: "#f59e0b",
    },
    {
      name: "Scope 2 (Indirekt)",
      value: parseFloat(scope2CO2.toFixed(1)),
      color: "#3b82f6",
    },
    {
      name: "Scope 3 (Kette)",
      value: parseFloat(scope3CO2.toFixed(1)),
      color: "#a855f7",
    },
  ].filter((item) => item.value > 0);

  const formatCO2 = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(2)} t`;
    return `${value.toFixed(1)} kg`;
  };

  return (
    // 🔥 HAUPT-GRID: Teilt den oberen Bereich in Karten (links) und Diagramm (rechts)
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
      {/* LINKER BEREICH (2 Drittel Breite): Die 4 KPI Karten im 2x2 Grid */}
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Karte 1: Gesamt */}
        <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Gesamt-Emissionen
              </span>
              <span className="p-1 rounded bg-slate-800 text-sm">🌍</span>
            </div>
            <div className="text-2xl font-bold tracking-tight mt-2">
              {formatCO2(totalCO2)}
            </div>
          </div>
          <p className="text-[11px] text-emerald-400 mt-2">
            CO₂-Äquivalent (CO₂e) aktiv
          </p>
        </div>

        {/* Karte 2: Scope 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Scope 1
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                Direkt
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight mt-2">
              {formatCO2(scope1CO2)}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Anteil:{" "}
            {totalCO2 > 0 ? ((scope1CO2 / totalCO2) * 100).toFixed(0) : 0}%
          </div>
        </div>

        {/* Karte 3: Scope 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Scope 2
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                Energie
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight mt-2">
              {formatCO2(scope2CO2)}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Anteil:{" "}
            {totalCO2 > 0 ? ((scope2CO2 / totalCO2) * 100).toFixed(0) : 0}%
          </div>
        </div>

        {/* Karte 4: Scope 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Scope 3
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                Kette
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight mt-2">
              {formatCO2(scope3CO2)}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Anteil:{" "}
            {totalCO2 > 0 ? ((scope3CO2 / totalCO2) * 100).toFixed(0) : 0}%
          </div>
        </div>
      </div>

      {/* RECHTER BEREICH (1 Drittel Breite): Das Donut-Diagramm */}
      {/* "flex flex-col h-full justify-between" sorgt dafür, dass die Box genauso hoch ist wie die Karten links! */}
      <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Verteilung nach Scope
          </h3>
          <p className="text-[11px] text-slate-400">Prozentualer CO₂e-Split</p>
        </div>

        {chartData.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-xs text-slate-400">
            Keine Daten im Zeitraum.
          </div>
        ) : (
          <div className="h-44 w-full flex items-center justify-center mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="45%"
                  innerRadius={45} // Leicht verkleinert, damit es perfekt in die Box passt
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [
                    `${value} kg CO₂e`,
                    "Emission",
                  ]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "11px",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "11px", pt: 2 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
