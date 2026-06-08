import React, { useState } from "react";
import { emissionService } from "../services/emissionService";
import { type EmissionCategoryLookupDto } from "../types/emission.types";

interface CategoryFormProps {
  onCategoryCreated: () => void;
  existingCategories: EmissionCategoryLookupDto[]; // Liste für die Duplikat-Prüfung
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  onCategoryCreated,
  existingCategories,
}) => {
  const [nameInput, setNameInput] = useState<string>("");
  const [scopeInput, setScopeInput] = useState<number>(1);
  const [unitInput, setUnitInput] = useState<string>("");
  const [factorInput, setFactorInput] = useState<string>("");

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedName = nameInput.trim();
    if (!trimmedName || !unitInput || !factorInput) return;

    // Duplikat-Prüfung: Vergleicht den Namen (ignoriert Groß-/Kleinschreibung)
    const isDuplicate = existingCategories.some(
      (cat) => cat.name.trim().toLowerCase() === trimmedName.toLowerCase(),
    );

    if (isDuplicate) {
      setErrorMessage(
        `Eine Kategorie mit dem Namen "${trimmedName}" existiert bereits.`,
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // Hier passen Sie die Payload an Ihre genaue Backend-Create-Methode an
      await emissionService.createCategory({
        name: trimmedName,
        scope: scopeInput,
        unit: unitInput.trim(),
        co2Factor: parseFloat(factorInput.replace(",", ".")) || 0,
      });

      // Formular zurücksetzen
      setNameInput("");
      setUnitInput("");
      setFactorInput("");
      setScopeInput(1);

      // Hauptseite aktualisieren
      onCategoryCreated();
    } catch (error) {
      console.error("Fehler beim Erstellen der Kategorie:", error);
      setErrorMessage("Die Kategorie konnte nicht gespeichert werden.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
      <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
        Neue Kategorie anlegen
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs font-medium flex items-start gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Kategoriename
          </label>
          <input
            type="text"
            required
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="z.B. Strommix Deutschland"
            className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Scope
          </label>
          <select
            value={scopeInput}
            onChange={(e) => setScopeInput(Number(e.target.value))}
            className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
          >
            <option value={1}>Scope 1 (Direkte Emissionen)</option>
            <option value={2}>Scope 2 (Indirekte Emissionen - Energie)</option>
            <option value={3}>Scope 3 (Indirekte Emissionen - Kette)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Einheit
          </label>
          <input
            type="text"
            required
            value={unitInput}
            onChange={(e) => setUnitInput(e.target.value)}
            placeholder="z.B. kWh oder Liters"
            className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            CO₂-Faktor (kg CO₂e / Einheit)
          </label>
          <input
            type="text"
            required
            value={factorInput}
            onChange={(e) => setFactorInput(e.target.value)}
            placeholder="z.B. 0.42"
            className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium text-sm rounded-lg shadow-sm transition"
        >
          {isSubmitting ? "Wird gespeichert..." : "Kategorie speichern"}
        </button>
      </form>
    </div>
  );
};
