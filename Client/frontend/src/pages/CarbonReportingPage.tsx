import React, { useState, useEffect } from "react";
import { EmissionRecordForm } from "../features/carbon-reporting/components/EmissionRecordForm";
import { EmissionRecordTable } from "../features/carbon-reporting/components/EmissionRecordTable";
import { EmissionKpiCards } from "../features/carbon-reporting/components/EmissionKpiCards";
import { emissionService } from "../features/carbon-reporting/services/emissionService";
import {
  type EmissionRecordListItemDto,
  type FacilityLookupDto,
} from "../features/carbon-reporting/types/emission.types";

export const CarbonReportingPage: React.FC = () => {
  const [records, setRecords] = useState<EmissionRecordListItemDto[]>([]);
  const [facilities, setFacilities] = useState<FacilityLookupDto[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Filter-States
  const [selectedFacilityName, setSelectedFacilityName] = useState<string>("");
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

  // 🌟 HIER ERWEITERT: Gibt den gewählten Standort an den API-Service weiter
  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);

      // Wenn "Alle Standorte" gewählt ist, senden wir undefined, ansonsten den Namen
      const facilityParam =
        selectedFacilityName === "" ? undefined : selectedFacilityName;

      await emissionService.downloadAnnualReportPdf(
        selectedYear,
        selectedMonth,
        facilityParam, // 👈 Neu als 3. Parameter
      );
    } catch (error) {
      console.error("PDF-Download fehlgeschlagen:", error);
      alert("Der PDF-Bericht konnte nicht heruntergeladen werden.");
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [recordsData, facilitiesData] = await Promise.all([
          emissionService.getRecords(),
          emissionService.getFacilities(),
        ]);
        setRecords(recordsData);
        if (Array.isArray(facilitiesData)) {
          setFacilities(facilitiesData);
        }
      } catch (err) {
        console.error(`Fehler ${err} beim Aktualisieren der Dashboard-Daten`);
      }
    };
    loadInitialData();
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

    const matchFacility =
      selectedFacilityName === "" ||
      record.facilityName === selectedFacilityName;

    return matchYear && matchMonth && matchFacility;
  });

  // HIER MIT TEIL 2 WEITERMACHEN
  return (
    <div className="space-y-8 relative text-slate-600">
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
          {/* Standort Dropdown */}
          <select
            value={selectedFacilityName}
            onChange={(e) => setSelectedFacilityName(e.target.value)}
            className="rounded-md border-slate-300 py-1.5 pl-3 pr-8 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white shadow-sm font-medium text-slate-700 cursor-pointer min-w-[180px]"
          >
            <option value="">🏢 Alle Standorte</option>
            {facilities.map((f: any) => {
              const name = f.facilityName || f.name;
              return (
                <option key={name} value={name}>
                  {name}
                </option>
              );
            })}
          </select>

          {/* Jahres-Auswahl */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-md border-slate-300 py-1.5 pl-3 pr-8 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white shadow-sm font-medium text-slate-700 cursor-pointer"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Monats-Auswahl */}
          <select
            value={selectedMonth ?? ""}
            onChange={(e) =>
              setSelectedMonth(
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
            className="rounded-md border-slate-300 py-1.5 pl-3 pr-8 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white shadow-sm font-medium text-slate-700 cursor-pointer"
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
        {/* LINKE SPALTE */}
        <div className="lg:col-span-1">
          <EmissionRecordForm
            onRecordCreated={handleRefreshData}
            key={refreshTrigger}
          />
        </div>

        {/* RECHTE SEITE */}
        <div className="lg:col-span-2">
          <EmissionRecordTable
            records={filteredRecords}
            onRefreshRequired={handleRefreshData}
          />
        </div>
      </div>
    </div>
  );
};
