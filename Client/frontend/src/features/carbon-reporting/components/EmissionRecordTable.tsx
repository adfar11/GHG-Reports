import React from "react";
import { emissionService } from "../services/emissionService";
import { type EmissionRecordListItemDto } from "../types/emission.types";

interface EmissionRecordTableProps {
  records: EmissionRecordListItemDto[];
  onRefreshRequired: () => void; // 🔥 NEU: Triggert das Neuladen des Dashboards
}

export const EmissionRecordTable: React.FC<EmissionRecordTableProps> = ({
  records,
  onRefreshRequired,
}) => {
  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Möchten Sie diesen CO₂-Eintrag wirklich unwiderruflich löschen?",
      )
    )
      return;

    try {
      await emissionService.deleteRecord(id);
      onRefreshRequired(); // Aktualisiert KPIs und Tabelle live
    } catch (err) {
      console.error("Fehler beim Löschen des Eintrags:", err);
      alert("Fehler beim Löschen des Eintrags.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 text-xs font-semibold uppercase">
              <th className="py-3 px-5">Datum</th>
              <th className="py-3 px-5">Standort</th>
              <th className="py-3 px-5">Kategorie</th>
              <th className="py-3 px-5 text-right">Menge</th>
              <th className="py-3 px-5 text-right">CO₂e</th>
              <th className="py-3 px-5 text-center">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {records.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  Keine Einträge für diesen Zeitraum gefunden.
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="py-3.5 px-5 font-mono text-xs">
                    {formatDate(r.consumptionDate)}
                  </td>
                  <td className="py-3.5 px-5 font-medium text-slate-900">
                    {r.facilityName}
                  </td>
                  <td className="py-3.5 px-5">
                    <div>{r.categoryName}</div>
                    {r.description && (
                      <div className="text-xs text-slate-400 italic mt-0.5">
                        {r.description}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    {r.quantity}{" "}
                    <span className="text-xs text-slate-400">{r.unit}</span>
                  </td>
                  <td className="py-3.5 px-5 text-right font-semibold text-slate-900">
                    {r.calculatedCO2e >= 1000
                      ? `${(r.calculatedCO2e / 1000).toFixed(2)} t`
                      : `${r.calculatedCO2e.toFixed(1)} kg`}
                  </td>

                  <td className="py-3.5 px-5 text-center">
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                      title="Eintrag löschen"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
