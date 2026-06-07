import React, { useState, useEffect } from "react";
import { emissionService } from "../services/emissionService";
import {
  type EmissionCategoryLookupDto,
  type FacilityLookupDto,
  type VehicleLookupDto,
} from "../types/emission.types";

interface EmissionRecordFormProps {
  onRecordCreated: () => void;
}

type FuelTypeToggle = "BENZIN" | "DIESEL";

// 🌟 HIER GEÄNDERT: Name ist jetzt wieder exakt 'EmissionRecordForm'
export const EmissionRecordForm: React.FC<EmissionRecordFormProps> = ({
  onRecordCreated,
}) => {
  // Stammdaten-Listen aus dem Backend
  const [categories, setCategories] = useState<EmissionCategoryLookupDto[]>([]);
  const [facilities, setFacilities] = useState<FacilityLookupDto[]>([]);
  const [vehicles, setVehicles] = useState<VehicleLookupDto[]>([]);

  // Formular-States
  const [selectedFacility, setSelectedFacility] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [fuelType, setFuelType] = useState<FuelTypeToggle>("BENZIN");

  // Mengenfelder
  const [facilityQuantity, setFacilityQuantity] = useState<number | "">("");
  const [vehicleElectricityQuantity, setVehicleElectricityQuantity] = useState<
    number | ""
  >("");
  const [vehicleFuelQuantity, setVehicleFuelQuantity] = useState<number | "">(
    "",
  );

  const [consumptionDate, setConsumptionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Stammdaten laden
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [catData, facData, vehData] = await Promise.all([
          emissionService.getCategories(),
          emissionService.getFacilities(),
          emissionService.getVehicles(),
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

  const getCategoryByKeyword = (keyword: string) => {
    return categories.find((c) => c.name.toLowerCase().includes(keyword));
  };

  const isCurrentCategoryFuel = () => {
    const currentCat = categories.find((c) => c.id === selectedCategory);
    if (!currentCat) return false;
    const name = currentCat.name.toLowerCase();
    return (
      name.includes("diesel") ||
      name.includes("benzin") ||
      name.includes("sprit") ||
      name.includes("kraftstoff")
    );
  };

  const isCurrentCategoryElectricity = () => {
    const currentCat = categories.find((c) => c.id === selectedCategory);
    return currentCat ? currentCat.name.toLowerCase().includes("strom") : false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !selectedFacility) return;

    const hasFacilityAmount =
      facilityQuantity !== "" && Number(facilityQuantity) > 0;
    const hasVehElectricity =
      vehicleElectricityQuantity !== "" &&
      Number(vehicleElectricityQuantity) > 0;
    const hasVehFuel =
      vehicleFuelQuantity !== "" && Number(vehicleFuelQuantity) > 0;

    if (!hasFacilityAmount && !hasVehElectricity && !hasVehFuel) {
      alert("Bitte tragen Sie mindestens eine Verbrauchsmenge ein.");
      return;
    }

    try {
      setIsSubmitting(true);
      const apiCalls = [];

      if (hasFacilityAmount) {
        apiCalls.push(
          emissionService.create({
            facilityId: selectedFacility,
            emissionCategoryId: selectedCategory,
            quantity: Number(facilityQuantity),
            consumptionDate: consumptionDate,
            description: description,
            vehicleId: null,
          }),
        );
      }

      if (selectedVehicle && hasVehElectricity) {
        const electricityCat = isCurrentCategoryElectricity()
          ? categories.find((c) => c.id === selectedCategory)
          : getCategoryByKeyword("strom");

        apiCalls.push(
          emissionService.create({
            facilityId: selectedFacility,
            emissionCategoryId: electricityCat
              ? electricityCat.id
              : selectedCategory,
            quantity: Number(vehicleElectricityQuantity),
            consumptionDate: consumptionDate,
            description: `${description} (Fahrzeug-Ladung Strom)`.trim(),
            vehicleId: selectedVehicle,
          }),
        );
      }

      if (selectedVehicle && hasVehFuel) {
        const keywordToSearch = fuelType === "DIESEL" ? "diesel" : "benzin";
        const fuelCat = isCurrentCategoryFuel()
          ? categories.find((c) => c.id === selectedCategory)
          : getCategoryByKeyword(keywordToSearch) ||
            getCategoryByKeyword("kraftstoff");

        apiCalls.push(
          emissionService.create({
            facilityId: selectedFacility,
            emissionCategoryId: fuelCat ? fuelCat.id : selectedCategory,
            quantity: Number(vehicleFuelQuantity),
            consumptionDate: consumptionDate,
            description:
              `${description} (Fahrzeug-Betankung ${fuelType === "DIESEL" ? "Diesel" : "Benzin"})`.trim(),
            vehicleId: selectedVehicle,
          }),
        );
      }

      await Promise.all(apiCalls);

      setFacilityQuantity("");
      setVehicleElectricityQuantity("");
      setVehicleFuelQuantity("");
      setDescription("");
      setSelectedVehicle("");
      setSelectedCategory("");
      setFuelType("BENZIN");

      onRecordCreated();
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      alert("Fehler beim Speichern des Eintrags.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // HIER MIT TEIL 2 WEITERMACHEN
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900 mb-4">
        Emission erfassen
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Standort-Auswahl */}
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
            {facilities.map((f: any) => {
              const id = f.facilityId || f.id;
              const name = f.facilityName || f.name;
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              );
            })}
          </select>
        </div>

        {/* 2. Kategorie-Auswahl */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Kategorie
          </label>
          <select
            value={selectedCategory}
            required
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setFacilityQuantity("");
              setVehicleElectricityQuantity("");
              setVehicleFuelQuantity("");
              if (
                e.target.value &&
                categories
                  .find((c) => c.id === e.target.value)
                  ?.name.toLowerCase()
                  .includes("diesel")
              ) {
                setFuelType("DIESEL");
              } else {
                setFuelType("BENZIN");
              }
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

        {/* 🏢 GEBÄUDE-MENGE */}
        {selectedCategory && !isCurrentCategoryFuel() && (
          <div className="animate-fadeIn">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              🏢 Strommenge für das Gebäude / die Location (in kWh)
            </label>
            <input
              type="number"
              step="any"
              value={facilityQuantity}
              onChange={(e) =>
                setFacilityQuantity(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              placeholder="z.B. 100"
              className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        )}

        {/* 🚗 FAHRZEUG-BEREICH */}
        {selectedCategory && (
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                🚗 Fahrzeug zuordnen{" "}
                {isCurrentCategoryFuel() ? "(Pflichtfeld)" : "(Optional)"}
              </label>
              <select
                value={selectedVehicle}
                required={isCurrentCategoryFuel()}
                onChange={(e) => {
                  setSelectedVehicle(e.target.value);
                  if (e.target.value === "") {
                    setVehicleElectricityQuantity("");
                    setVehicleFuelQuantity("");
                  }
                }}
                className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
              >
                <option value="">-- Kein Fahrzeug ausgewählt --</option>
                {vehicles.map((v: any) => {
                  const id = v.vehicleId || v.id;
                  const name = v.vehicleName || v.name;
                  const plate = v.licensePlate || v.plate || "";
                  return (
                    <option key={id} value={id}>
                      {name} {plate ? `(${plate})` : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* HYBRID SPEZIFISCH */}
            {selectedVehicle && (
              <div className="animate-fadeIn bg-blue-50/50 border border-blue-100 p-3 rounded-md space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-blue-800 mb-1">
                    🔋 Geladener Strom für das Fahrzeug (in kWh)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={vehicleElectricityQuantity}
                    onChange={(e) =>
                      setVehicleElectricityQuantity(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    placeholder="z.B. 35"
                    className="w-full rounded-md border-blue-300 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div className="border-t border-blue-100/70 pt-2">
                  <label className="block text-xs font-semibold text-blue-800 mb-1.5">
                    Kraftstoffart wählen
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="fuelTypeToggle"
                        value="BENZIN"
                        checked={fuelType === "BENZIN"}
                        onChange={() => setFuelType("BENZIN")}
                        className="h-3.5 w-3.5 text-blue-600 border-slate-300"
                      />
                      <span className="ml-1.5">Benzin (Super)</span>
                    </label>
                    <label className="inline-flex items-center text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="fuelTypeToggle"
                        value="DIESEL"
                        checked={fuelType === "DIESEL"}
                        onChange={() => setFuelType("DIESEL")}
                        className="h-3.5 w-3.5 text-blue-600 border-slate-300"
                      />
                      <span className="ml-1.5">Diesel</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-blue-800 mb-1">
                    #️⃣ Getankte Menge{" "}
                    {fuelType === "DIESEL" ? "Diesel" : "Benzin"} (in Liter)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={vehicleFuelQuantity}
                    onChange={(e) =>
                      setVehicleFuelQuantity(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    placeholder="z.B. 45"
                    className="w-full rounded-md border-blue-300 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Datum & Beschreibung */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Verbrauchs- / Tankdatum
          </label>
          <input
            type="date"
            required
            value={consumptionDate}
            onChange={(e) => setConsumptionDate(e.target.value)}
            className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Notiz / Beleg-Nr. (optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="z.B. Tankbeleg oder Monatsabrechnung"
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
