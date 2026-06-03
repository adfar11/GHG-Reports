import React, { useState, useEffect } from "react";
import { emissionService } from "../services/emissionService"; // Pfad prüfen
import {
  type EmissionCategoryLookupDto,
  type FacilityLookupDto,
  type VehicleLookupDto,
} from "../types/emission.types";

interface EmissionRecordFormProps {
  onRecordCreated: () => void;
}

export const EmissionRecordForm: React.FC<EmissionRecordFormProps> = ({
  onRecordCreated,
}) => {
  // Stammdaten-Listen aus dem Backend
  const [categories, setCategories] = useState<EmissionCategoryLookupDto[]>([]);
  const [facilities, setFacilities] = useState<FacilityLookupDto[]>([]);
  const [vehicles, setVehicles] = useState<VehicleLookupDto[]>([]);

  // Formular-States
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedFacility, setSelectedFacility] = useState<string>("");
  const [selectedVehicle, setSelectedVehicle] = useState<string>(""); // Neu für Fahrzeuge
  const [quantity, setQuantity] = useState<number>(0);
  const [consumptionDate, setConsumptionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [description, setDescription] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 1. Alle Stammdaten (inklusive Fahrzeuge) beim Laden abrufen
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [catData, facData, vehData] = await Promise.all([
          emissionService.getCategories(),
          emissionService.getFacilities(),
          emissionService.getVehicles(), // Lädt die fahrbereiten Autos
        ]);
        setCategories(catData);
        setFacilities(facData);
        setVehicles(vehData);
      } catch (err) {
        console.error("Fehler beim Laden der Formular-Stammdaten:", err);
      }
    };
    loadDropdownData();
  }, []);

  // 2. Dynamische Prüfung: Handelt es sich um eine Fahrzeug-Kategorie?
  // Erkennt Schlüsselwörter wie "Sprit", "Diesel", "Benzin", "Kraftstoff", "Ladestrom", "Fahrzeug"
  const isVehicleCategory = () => {
    const currentCat = categories.find((c) => c.id === selectedCategory);
    if (!currentCat) return false;

    const name = currentCat.name.toLowerCase();
    return (
      name.includes("sprit") ||
      name.includes("diesel") ||
      name.includes("benzin") ||
      name.includes("strom") ||
      name.includes("fahrt") ||
      name.includes("kraftstoff")
    );
  };

  // 3. Formular absenden
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !selectedFacility || quantity <= 0) return;

    try {
      setIsSubmitting(true);
      await emissionService.create({
        facilityId: selectedFacility,
        emissionCategoryId: selectedCategory,
        quantity: quantity,
        consumptionDate: consumptionDate,
        description: description,
        // Wenn es keine Fahrzeug-Kategorie ist, senden wir null an das C#-Backend
        vehicleId:
          isVehicleCategory() && selectedVehicle ? selectedVehicle : null,
      });

      // Formular zurücksetzen
      setQuantity(0);
      setDescription("");
      setSelectedVehicle("");

      onRecordCreated(); // Aktualisiert Dashboard-KPIs und Tabelle
    } catch (error) {
      console.error("Fehler beim Speichern des Eintrags:", error);
      alert("Fehler beim Speichern des CO₂-Eintrags.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900 mb-4">
        Emission erfassen
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Kategorie-Auswahl */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Kategorie
          </label>
          <select
            value={selectedCategory}
            required
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedVehicle(""); // Zurücksetzen bei Kategorie-Wechsel
            }}
            className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
          >
            <option value="">-- Bitte wählen --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.unit})
              </option>
            ))}
          </select>
        </div>

        {/* 🚗 DYNAMISCHES FAHRZEUG-DROPDOWN: Wird nur eingeblendet wenn isVehicleCategory() wahr ist */}
        {isVehicleCategory() && (
          <div className="animate-fadeIn bg-blue-50/50 border border-blue-100 p-3 rounded-lg">
            <label className="block text-xs font-semibold text-blue-800 mb-1">
              🚗 Zugeordnetes Fahrzeug
            </label>
            <select
              value={selectedVehicle}
              required={isVehicleCategory()} // Pflichtfeld wenn eingeblendet
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full rounded-md border-blue-300 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
            >
              <option value="">-- Welches Fahrzeug wurde genutzt? --</option>
              {vehicles.map((v) => (
                <option key={v.vehicleId} value={v.vehicleId}>
                  {v.vehicleName} ({v.licensePlate})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Standort-Auswahl */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Standort / Betriebsstätte
          </label>
          <select
            value={selectedFacility}
            required
            onChange={(e) => setSelectedFacility(e.target.value)}
            className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
          >
            <option value="">-- Bitte wählen --</option>
            {facilities.map((f) => (
              <option key={f.facilityId} value={f.facilityId}>
                {f.facilityName}
              </option>
            ))}
          </select>
        </div>

        {/* Menge */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Verbrauchsmenge
          </label>
          <input
            type="number"
            step="any"
            required
            value={quantity || ""}
            onChange={(e) => setQuantity(Number(e.target.value))}
            placeholder="z.B. 45.5"
            className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Datum */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Verbrauchsdatum
          </label>
          <input
            type="date"
            required
            value={consumptionDate}
            onChange={(e) => setConsumptionDate(e.target.value)}
            className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Beschreibung */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Notiz / Beleg-Nr. (optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="z.B. Tankbeleg Aral"
            className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-md shadow-sm transition disabled:bg-blue-400"
        >
          {isSubmitting ? "Speichert..." : "Eintrag speichern"}
        </button>
      </form>
    </div>
  );
};
