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

  // Modal-Sichtbarkeiten
  const [isFacilityModalOpen, setIsFacilityModalOpen] =
    useState<boolean>(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState<boolean>(false);

  // Formular-States für Modals
  const [facilityName, setFacilityName] = useState("");
  const [facilityCountry, setFacilityCountry] = useState("");
  const [vehicleName, setVehicleName] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleType, setVehicleType] = useState("PKW");

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

  const handleSubmitFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityName || !facilityCountry) return;
    try {
      await emissionService.createFacility({
        facilityName,
        country: facilityCountry,
      });
      setIsFacilityModalOpen(false);
      setFacilityName("");
      setFacilityCountry("");
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Fehler beim Erstellen des Standorts:", error);
    }
  };

  const handleSubmitVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleName || !vehiclePlate) return;
    try {
      await emissionService.createVehicle({
        vehicleName: vehicleName,
        licensePlate: vehiclePlate,
        type: vehicleType,
        // model: vehicleType,
      });
      setIsVehicleModalOpen(false);
      setVehicleName("");
      setVehiclePlate("");
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Fehler beim Erstellen des Fahrzeugs:", error);
    }
  };

  // Zentraler Daten-Fetch für KPI und Tabelle (bleibt gleich)
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

  const handleRecordCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // 🔥 NEU: Dynamische Filterung direkt zur Laufzeit im Frontend
  const filteredRecords = records.filter((record) => {
    const recordDate = new Date(record.consumptionDate);
    const matchYear = recordDate.getFullYear() === selectedYear;

    // Wenn kein Monat gewählt ist (Ganzes Jahr), zählt nur das Jahr.
    // Ansonsten muss auch der Monat übereinstimmen (Achtung: JS Monate sind 0-basiert, daher + 1)
    const matchMonth =
      selectedMonth === undefined ||
      recordDate.getMonth() + 1 === selectedMonth;

    return matchYear && matchMonth;
  });

  return (
    <div className="space-y-8 relative">
      {/* HEADER-BEREICH (mit den funktionsfähigen Dropdowns) */}
      <div className="border-b border-slate-200 pb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Treibhausgas-Reporting (GHG)
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Verwalten und bilanzieren Sie Ihre betrieblichen CO₂-Emissionen.
          </p>
        </div>

        {/* RECHTE SEITE: FILTER UND PDF EXPORT */}
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
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isDownloading ? "Generiert..." : "📄 PDF exportieren"}
          </button>
        </div>
      </div>

      {/* SCHNELL-AKTIONEN FÜR STAMMDATEN */}
      {/* ... (Ihr bestehender Stammdaten-Bereich für Modals bleibt hier unverändert) ... */}

      {/* ✅ KORRIGIERT: Übergabe des GEFILTERTEN Arrays für die KPI-Berechnung */}
      <EmissionKpiCards records={filteredRecords} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <EmissionRecordForm
            onRecordCreated={handleRecordCreated}
            key={refreshTrigger}
          />
        </div>

        {/* ✅ KORRIGIERT: Übergabe des GEFILTERTEN Arrays für die Tabellenanzeige */}
        <div className="lg:col-span-2">
          <EmissionRecordTable records={filteredRecords} />
        </div>
      </div>

      {/* ... (Die beiden Modals für Facility und Vehicle bleiben hier unten unverändert) ... */}
    </div>
  );
};
