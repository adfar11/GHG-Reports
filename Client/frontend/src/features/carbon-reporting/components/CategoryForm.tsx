import React, { useState } from "react";
import { emissionService } from "../services/emissionService";

interface CategoryFormProps {
  onCategoryCreated: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  onCategoryCreated,
}) => {
  const [name, setName] = useState<string>("");
  const [unit, setUnit] = useState<string>("");
  const [scope, setScope] = useState<number>(1);
  const [co2Factor, setCo2Factor] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !unit || co2Factor < 0) return;

    try {
      setIsSubmitting(true);
      await emissionService.createCategory({
        name,
        unit,
        scope,
        co2Factor,
      });

      // Formular zurücksetzen
      setName("");
      setUnit("");
      setScope(1);
      setCo2Factor(0);

      alert("Emissionskategorie erfolgreich hinzugefügt!");
      onCategoryCreated(); // Triggert das Neuladen des Haupt-Dropdowns
    } catch (err) {
      console.error("Fehler beim Erstellen der Kategorie:", err);
      alert("Fehler beim Erstellen der Kategorie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900 mb-4">
        Neue Emissionskategorie anlegen
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Kategoriename
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z.B. Benzin E10 oder Erdgas"
            className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Einheit
            </label>
            <input
              type="text"
              required
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="z.B. Liter oder kWh"
              className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Scope
            </label>
            <select
              value={scope}
              onChange={(e) => setScope(Number(e.target.value))}
              className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
            >
              <option value={1}>Scope 1 (Direkt)</option>
              <option value={2}>Scope 2 (Indirekt, Strom/Wärme)</option>
              <option value={3}>Scope 3 (Wertschöpfungskette)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            CO₂-Faktor (kg CO₂e pro Einheit)
          </label>
          <input
            type="number"
            step="any"
            required
            value={co2Factor || ""}
            onChange={(e) => setCo2Factor(Number(e.target.value))}
            placeholder="z.B. 2.64"
            className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-900 text-white font-medium text-sm rounded-md shadow-sm transition disabled:bg-slate-400"
        >
          {isSubmitting ? "Wird gespeichert..." : "Kategorie speichern"}
        </button>
      </form>
    </div>
  );
};
