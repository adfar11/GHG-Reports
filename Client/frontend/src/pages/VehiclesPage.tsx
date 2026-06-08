import React, { useState, useEffect } from "react";
import { emissionService } from "../features/carbon-reporting/services/emissionService";
import { type VehicleLookupDto } from "../features/carbon-reporting/types/emission.types";
import { VehicleRow } from "../components/VehicleRow";

export const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleLookupDto[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [nameInput, setNameInput] = useState<string>("");
  const [plateInput, setPlateInput] = useState<string>("");
  const [typeInput, setTypeInput] = useState<string>("InternalCombustion");
  const [errorMessage, setErrorMessage] = useState<string>("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!nameInput || !plateInput) return;

    const cleanInputPlate = plateInput.replace(/\s+/g, "").toLowerCase();
    const isDuplicate = vehicles.some(
      (v) =>
        v.licensePlate.replace(/\s+/g, "").toLowerCase() === cleanInputPlate,
    );

    if (isDuplicate) {
      setErrorMessage("Ein Fahrzeug mit diesem Kennzeichen existiert bereits.");
      return;
    }

    try {
      await emissionService.createVehicle({
        vehicleName: nameInput,
        licensePlate: plateInput,
        type: typeInput,
      });
      setIsModalOpen(false);
      setNameInput("");
      setPlateInput("");
      setTypeInput("InternalCombustion");
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Fehler beim Erstellen des Fahrzeugs:", error);
      setErrorMessage("Das Fahrzeug konnte nicht angelegt werden.");
    }
  };

  const handleDelete = async (vehicleId: string, vehicleName: string) => {
    const confirmed = window.confirm(
      `Möchten Sie das Fahrzeug "${vehicleName}" wirklich löschen?`,
    );
    if (!confirmed) return;

    try {
      await emissionService.deleteVehicle(vehicleId);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Fehler beim Löschen des Fahrzeugs:", error);
      alert("Das Fahrzeug konnte nicht gelöscht werden.");
    }
  };

  return (
    <div className="space-y-6 p-6">
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
          onClick={() => {
            setErrorMessage("");
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition"
        >
          🚗 + Fahrzeug hinzufügen
        </button>
      </div>

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
                <th className="px-6 py-3 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {vehicles.map((v) => (
                <VehicleRow
                  key={v.vehicleId}
                  vehicle={v}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Neues Fahrzeug registrieren
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs font-medium flex items-start gap-2">
                  <span>⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}
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
