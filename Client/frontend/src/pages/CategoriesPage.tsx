import React, { useState, useEffect } from "react";
import { CategoryForm } from "../features/carbon-reporting/components/CategoryForm";
import { emissionService } from "../features/carbon-reporting/services/emissionService";
import { type EmissionCategoryLookupDto } from "../features/carbon-reporting/types/emission.types";

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<EmissionCategoryLookupDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Funktion zum Laden der Kategorien aus dem Backend
  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await emissionService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Fehler beim Laden der Kategorien:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Neu laden, wenn der Trigger sich erhöht
  useEffect(() => {
    loadCategories();
  }, [refreshTrigger]);

  const handleCategoryCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Hilfsfunktion für farbige Scope-Badges
  const getScopeBadge = (scope: number) => {
    switch (scope) {
      case 1:
        return (
          <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-amber-50 text-amber-800 border border-amber-100">
            Scope 1 (Direkt)
          </span>
        );
      case 2:
        return (
          <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-800 border border-blue-100">
            Scope 2 (Indirekt)
          </span>
        );
      case 3:
        return (
          <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-purple-50 text-purple-800 border border-purple-100">
            Scope 3 (Kette)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-50 text-slate-800 border border-slate-100">
            Unbekannt
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Emissionskategorien verwalten
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Definieren Sie Treibhausgas-Kategorien und hinterlegen Sie die
          offiziellen CO₂e-Umrechnungsfaktoren.
        </p>
      </div>

      {/* 2-Spalten-Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Linke Spalte: Das Formular */}
        <div className="lg:col-span-1">
          <CategoryForm onCategoryCreated={handleCategoryCreated} />
        </div>

        {/* Rechte Spalte: Die Tabelle der existierenden Kategorien */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-sm font-semibold text-slate-900">
              Aktive Kategorien im System
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-5">Name</th>
                  <th className="py-3 px-5">Scope</th>
                  <th className="py-3 px-5">Einheit</th>
                  <th className="py-3 px-5 text-right">CO₂-Faktor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading && categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      Kategorien werden geladen...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      Keine Kategorien vorhanden. Legen Sie links eine an!
                    </td>
                  </tr>
                ) : (
                  categories.map((cat: any) => {
                    const name = cat.name ?? "Unbekannt";
                    const rawDescription = cat.description ?? ""; // z.B. "Unit: Liter, Faktor: 2,64"
                    const rawCode = cat.code ?? ""; // z.B. "Scope1"

                    // 1. Einheit (Unit) aus dem Text herausschneiden
                    let unit = "-";
                    if (rawDescription.includes("Unit:")) {
                      // Schneidet den Text zwischen "Unit: " und dem nächsten Komma aus
                      const unitPart = rawDescription
                        .split("Unit:")[1]
                        ?.split(",")[0];
                      if (unitPart) unit = unitPart.trim();
                    }

                    // 2. CO₂-Faktor aus dem Text herausschneiden und deutsche Kommas zu Punkten wandeln
                    let co2Factor = 0;
                    if (rawDescription.includes("Faktor:")) {
                      const factorPart = rawDescription.split("Faktor:")[1];
                      if (factorPart) {
                        // Ersetzt das deutsche Komma durch einen Punkt, damit JavaScript es als Zahl versteht
                        const cleanFactor = factorPart.replace(",", ".").trim();
                        co2Factor = parseFloat(cleanFactor) || 0;
                      }
                    }

                    // 3. Scope aus dem "code"-Feld ermitteln
                    let scope = 0;
                    if (rawCode.includes("Scope1")) scope = 1;
                    if (rawCode.includes("Scope2")) scope = 2;
                    if (rawCode.includes("Scope3")) scope = 3;

                    return (
                      <tr
                        key={cat.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        {/* Name */}
                        <td className="py-3.5 px-5 font-medium text-slate-900">
                          {name}
                        </td>

                        {/* Scope-Badge (Nutzt die ermittelte scope-Zahl) */}
                        <td className="py-3.5 px-5">{getScopeBadge(scope)}</td>

                        {/* Einheit */}
                        <td className="py-3.5 px-5 text-slate-500 font-mono text-xs">
                          {unit}
                        </td>

                        {/* CO₂-Faktor */}
                        <td className="py-3.5 px-5 text-right font-semibold text-slate-800">
                          {co2Factor.toFixed(3)}{" "}
                          <span className="text-xs font-normal text-slate-400">
                            kg/Unit
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
