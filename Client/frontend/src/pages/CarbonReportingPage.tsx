import React, { useState, useEffect } from "react";
import { EmissionRecordForm } from "../features/carbon-reporting/components/EmissionRecordForm";
import { EmissionRecordTable } from "../features/carbon-reporting/components/EmissionRecordTable";
import { EmissionKpiCards } from "../features/carbon-reporting/components/EmissionKpiCards";
import { emissionService } from "../features/carbon-reporting/services/emissionService";
import { type EmissionRecordListItemDto } from "../features/carbon-reporting/types/emission.types";

export const CarbonReportingPage: React.FC = () => {
  const [records, setRecords] = useState<EmissionRecordListItemDto[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Filter-States
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(
    undefined,
  );
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const years = [2026, 2025, 2024, 2023];
  const months = [
    { value: 1, name: "Januar" },
    { value: 2, name: "Februar" },
    { value: 3, name: "März" },
    { value: 4, name: "April" },
    { value: 5, name: "Mai" },
    { value: 6, name: "Juni" },
    { value: 7, name: "Juli" },
    { value: 8, name: "August" },
    { value: 9, name: "September" },
    { value: 10, name: "Oktober" },
    { value: 11, name: "November" },
    { value: 12, name: "Dezember" },
  ];

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      await emissionService.downloadAnnualReportPdf(
        selectedYear,
        selectedMonth,
      );
    } catch (error) {
      console.error("PDF-Download fehlgeschlagen:", error);
      alert("Der PDF-Bericht konnte nicht heruntergeladen werden.");
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const data = await emissionService.getRecords();
        setRecords(data);
      } catch (err) {
        console.error(`Fehler ${err} beim Aktualisieren der Dashboard-Daten`);
      }
    };
    loadRecords();
  }, [refreshTrigger]);

  const handleRefreshData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const filteredRecords = records.filter((record) => {
    const recordDate = new Date(record.consumptionDate);
    const matchYear = recordDate.getFullYear() === selectedYear;
    const matchMonth =
      selectedMonth === undefined ||
      recordDate.getMonth() + 1 === selectedMonth;
    return matchYear && matchMonth;
  });

  return (
    <div className="space-y-8 relative">
      {/* HEADER-BEREICH */}
      <div className="border-b border-slate-200 pb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Treibhausgas-Reporting (GHG)
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Verwalten und bilanzieren Sie Ihre betrieblichen CO₂-Emissionen.
          </p>
        </div>

        {/* FILTER UND PDF EXPORT */}
        <div className="flex flex-wrap items-center gap-3 lg:self-end">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-md border-slate-300 py-1.5 pl-3 pr-8 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white shadow-sm"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <select
            value={selectedMonth ?? ""}
            onChange={(e) =>
              setSelectedMonth(
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
            className="rounded-md border-slate-300 py-1.5 pl-3 pr-8 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white shadow-sm"
          >
            <option value="">Ganzes Jahr</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors disabled:bg-blue-400"
          >
            {isDownloading ? "Generiert..." : "📄 PDF exportieren"}
          </button>
        </div>
      </div>

      {/* KPI KARTEN */}
      <EmissionKpiCards records={filteredRecords} />

      {/* REINE ZWEI-SPALTEN-STRUKTUR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LINKE SPALTE: Nur das Erfassungsformular */}
        <div className="lg:col-span-1">
          <EmissionRecordForm
            onRecordCreated={handleRefreshData}
            key={refreshTrigger}
          />
        </div>

        {/* RECHTE SEITE: Die Verlaufstabelle */}
        <div className="lg:col-span-2">
          <EmissionRecordTable records={filteredRecords} />
        </div>
      </div>
    </div>
  );
};
