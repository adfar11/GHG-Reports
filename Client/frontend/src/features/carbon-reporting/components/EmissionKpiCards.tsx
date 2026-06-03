import React from "react";
import { type EmissionRecordListItemDto } from "../types/emission.types";

interface EmissionKpiCardsProps {
  records: EmissionRecordListItemDto[];
}

export const EmissionKpiCards: React.FC<EmissionKpiCardsProps> = ({
  records,
}) => {
  // Berechnungen basierend auf den geladenen Backend-Daten
  const totalCO2 = records.reduce((sum, r) => sum + r.calculatedCO2e, 0);
  const totalEntries = records.length;

  // Durchschnitt pro Eintrag
  const averageCO2 = totalEntries > 0 ? totalCO2 / totalEntries : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {/* KPI 1: Gesamte Emissionen */}
      <div className="bg-linear-to-br from-emerald-50 to-white border border-emerald-200 rounded-xl p-5 shadow-xs">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
          Gesamte Emissionen
        </p>
        <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">
          {totalCO2.toLocaleString("de-DE", { maximumFractionDigits: 1 })}{" "}
          <span className="text-sm font-normal text-slate-500">kg CO₂e</span>
        </p>
      </div>

      {/* KPI 2: Anzahl Datensätze */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Erfasste Einträge
        </p>
        <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">
          {totalEntries}{" "}
          <span className="text-sm font-normal text-slate-500">Messungen</span>
        </p>
      </div>

      {/* KPI 3: Durchschnitt */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Ø pro Erfassung
        </p>
        <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">
          {averageCO2.toLocaleString("de-DE", { maximumFractionDigits: 1 })}{" "}
          <span className="text-sm font-normal text-slate-500">kg</span>
        </p>
      </div>
    </div>
  );
};
