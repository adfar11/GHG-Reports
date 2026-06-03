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
      <div className="flex gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg items-center justify-between">
        <div className="text-sm text-slate-600 font-medium">
          Stammdaten verwalten:
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsFacilityModalOpen(true)}
            className="inline-flex items-center px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md text-xs font-medium shadow-sm transition"
          >
            🏢 + Standort hinzufügen
          </button>
          <button
            onClick={() => setIsVehicleModalOpen(true)}
            className="inline-flex items-center px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md text-xs font-medium shadow-sm transition"
          >
            🚗 + Fahrzeug hinzufügen
          </button>
        </div>
      </div>

      <EmissionKpiCards records={records} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <EmissionRecordForm
            onRecordCreated={handleRecordCreated}
            key={refreshTrigger}
          />
        </div>
        <div className="lg:col-span-2">
          <EmissionRecordTable records={records} />
        </div>
      </div>

      {/* MODAL: STANDORT (FACILITY) */}
      {isFacilityModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 relative">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Neuen Standort hinzufügen
            </h3>
            <form onSubmit={handleSubmitFacility} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Standortname
                </label>
                <input
                  type="text"
                  required
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  placeholder="z.B. Hauptverwaltung Bochum"
                  className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Land
                </label>
                <input
                  type="text"
                  required
                  value={facilityCountry}
                  onChange={(e) => setFacilityCountry(e.target.value)}
                  placeholder="z.B. Deutschland"
                  className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFacilityModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition"
                >
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FAHRZEUG (VEHICLE) */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 relative">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Neues Fahrzeug hinzufügen
            </h3>
            <form onSubmit={handleSubmitVehicle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fahrzeugbezeichnung
                </label>
                <input
                  type="text"
                  required
                  value={vehicleName}
                  onChange={(e) => setVehicleName(e.target.value)}
                  placeholder="z.B. VW ID.4 Poolwagen"
                  className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kennzeichen
                </label>
                <input
                  type="text"
                  required
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  placeholder="z.B. BO-GHG-2026"
                  className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Typ
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="PKW">PKW</option>
                  <option value="LKW">LKW</option>
                  <option value="Logistik">Logistik / Transporter</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition"
                >
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
