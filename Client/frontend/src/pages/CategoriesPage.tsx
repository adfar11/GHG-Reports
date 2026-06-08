import React, { useState, useEffect } from "react";
import { CategoryForm } from "../features/carbon-reporting/components/CategoryForm";
import { emissionService } from "../features/carbon-reporting/services/emissionService";
import { type EmissionCategoryLookupDto } from "../features/carbon-reporting/types/emission.types";
import { CategoryRow } from "../components/CategoryRow";

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<EmissionCategoryLookupDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

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

  useEffect(() => {
    loadCategories();
  }, [refreshTrigger]);

  const handleCategoryCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDelete = async (categoryId: string, categoryName: string) => {
    const confirmed = window.confirm(
      `Möchten Sie die Kategorie "${categoryName}" wirklich löschen?`,
    );
    if (!confirmed) return;

    try {
      await emissionService.deleteCategory(categoryId);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Fehler beim Löschen der Kategorie:", error);
      alert("Die Kategorie konnte nicht gelöscht werden.");
    }
  };

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
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Emissionskategorien verwalten
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Definieren Sie Treibhausgas-Kategorien und hinterlegen Sie die
          offiziellen CO₂e-Umrechnungsfaktoren.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Linke Spalte: Das Formular (Erhält jetzt die Kategorieliste als Prop) */}
        <div className="lg:col-span-1">
          <CategoryForm
            onCategoryCreated={handleCategoryCreated}
            existingCategories={categories}
          />
        </div>

        {/* Rechte Spalte: Die Tabelle */}
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
                  <th className="py-3 px-5 text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading && categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Kategorien werden geladen...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Keine Kategorien vorhanden. Legen Sie links eine an!
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <CategoryRow
                      key={cat.id}
                      cat={cat}
                      getScopeBadge={getScopeBadge}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
