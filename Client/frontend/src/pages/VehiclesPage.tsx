import React, { useState, useEffect } from "react";
import { emissionService } from "../features/carbon-reporting/services/emissionService";
import { type VehicleLookupDto } from "../features/carbon-reporting/types/emission.types";

export const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleLookupDto[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Formular-Zustände
  const [nameInput, setNameInput] = useState<string>("");
  const [plateInput, setPlateInput] = useState<string>("");
  const [typeInput, setTypeInput] = useState<string>("InternalCombustion");

  // 1. Daten laden
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setIsLoading(true);
        const data = await emissionService.getVehicles();
        setVehicles(data);
      } catch (err) {
        console.error("Fehler beim Laden der Fahrzeugliste:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadVehicles();
  }, [refreshTrigger]);

  // 2. Formular absenden
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput || !plateInput) return;

    try {
      await emissionService.createVehicle({
        vehicleName: nameInput,
        licensePlate: plateInput,
        type: typeInput,
      });

      // Reset & Schließen
      setIsModalOpen(false);
      setNameInput("");
      setPlateInput("");
      setTypeInput("InternalCombustion");

      // Liste aktualisieren
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Fehler beim Erstellen des Fahrzeugs:", error);
      alert("Das Fahrzeug konnte nicht angelegt werden.");
    }
  };

  const getReadableType = (type: string) => {
    switch (type) {
      case "InternalCombustion":
        return "Reiner Verbrenner";
      case "BatteryElectric":
        return "Reines E-Auto";
      case "PlugInHybrid":
        return "Plug-In Hybrid";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Fahrzeugflotte verwalten
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Übersicht und Verwaltung aller registrierten Firmenfahrzeuge.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition"
        >
          🚗 + Fahrzeug hinzufügen
        </button>
      </div>

      {/* TABELLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            Fahrzeuge werden geladen...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Keine Fahrzeuge registriert.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-3">Bezeichnung</th>
                <th className="px-6 py-3">Kennzeichen</th>
                <th className="px-6 py-3">Antriebstyp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {vehicles.map((v) => (
                <tr
                  key={v.vehicleId}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {v.vehicleName}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">
                    {v.licensePlate}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        v.type === "BatteryElectric"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : v.type === "PlugInHybrid"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {getReadableType(v.type)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Neues Fahrzeug registrieren
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fahrzeugbezeichnung
                </label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="z.B. Poolwagen Logistik"
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
                  value={plateInput}
                  onChange={(e) => setPlateInput(e.target.value)}
                  placeholder="z.B. BO-GHG-2026"
                  className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Antriebstyp
                </label>
                <select
                  value={typeInput}
                  onChange={(e) => setTypeInput(e.target.value)}
                  className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                >
                  <option value="InternalCombustion">
                    Reiner Verbrenner (Benzin/Diesel)
                  </option>
                  <option value="BatteryElectric">Reines E-Auto</option>
                  <option value="PlugInHybrid">Plug-In Hybrid</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm"
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
