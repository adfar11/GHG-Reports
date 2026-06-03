import React from "react";
import { type EmissionRecordListItemDto } from "../types/emission.types"; // Pfad prüfen

interface EmissionRecordTableProps {
  records: EmissionRecordListItemDto[];
}

export const EmissionRecordTable: React.FC<EmissionRecordTableProps> = ({
  records,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
        <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3">Datum</th>
            <th className="px-4 py-3">Kategorie</th>
            <th className="px-4 py-3">Standort</th>
            <th className="px-4 py-3">Menge</th>
            <th className="px-4 py-3 text-right">CO₂e (kg)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {records.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-8 text-slate-400">
                Keine Emissionsdaten vorhanden.
              </td>
            </tr>
          ) : (
            records.map((record) => (
              <tr
                key={record.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(record.consumptionDate).toLocaleDateString("de-DE")}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {record.categoryName}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {record.facilityName}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {record.quantity} {record.unit}
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                  {record.calculatedCO2e.toLocaleString("de-DE", {
                    maximumFractionDigits: 1,
                  })}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
