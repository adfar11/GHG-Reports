import React from "react";

// Wir definieren den exakten Typen, den Ihr Backend-Query-Handler (EmissionCategoryDto) liefert
interface EmissionCategoryDto {
  id: string;
  name: string;
  code: string;
  description: string;
  isUsed?: boolean;
  IsUsed?: boolean;
}

interface CategoryRowProps {
  cat: EmissionCategoryDto;
  getScopeBadge: (scope: number) => React.ReactNode;
  onDelete: (id: string, name: string) => void;
}

export const CategoryRow: React.FC<CategoryRowProps> = ({
  cat,
  getScopeBadge,
  onDelete,
}) => {
  const name = cat.name ?? "Unbekannt";
  const rawDescription = cat.description ?? "";
  const rawCode = cat.code ?? "";

  // 1. Einheit (Unit) aus dem Text herausfiltern
  let unit = "-";
  if (rawDescription.includes("Unit:")) {
    const unitPart = rawDescription.split("Unit:")[1]?.split(",")[0];
    if (unitPart) unit = unitPart.trim();
  }

  // 2. CO₂-Faktor aus dem Text herausfiltern
  let co2Factor = 0;
  if (rawDescription.includes("Faktor:")) {
    const factorPart = rawDescription.split("Faktor:")[1];
    if (factorPart) {
      const cleanFactor = factorPart.replace(",", ".").trim();
      co2Factor = parseFloat(cleanFactor) || 0;
    }
  }

  // 3. Scope aus dem Code ("Scope1", "Scope2", "Scope3") ermitteln
  let scope = 0;
  if (rawCode.includes("Scope1")) scope = 1;
  if (rawCode.includes("Scope2")) scope = 2;
  if (rawCode.includes("Scope3")) scope = 3;

  // Duplikat- & Benutzungsschutz (Prüft das vom Backend gelieferte Feld)
  const isUsedInBackend = cat.isUsed ?? cat.IsUsed ?? false;
  const isDeletable = !isUsedInBackend;

  const handleClick = () => {
    if (!isDeletable) {
      alert(
        `Aktion blockiert: Die Kategorie "${name}" wird bereits in bestehenden Datenflüssen verwendet und kann nicht gelöscht werden.`,
      );
      return;
    }
    onDelete(cat.id, name);
  };

  return (
    <tr className="hover:bg-slate-50/70 transition-colors">
      <td className="py-3.5 px-5 font-medium text-slate-900">{name}</td>
      <td className="py-3.5 px-5">{getScopeBadge(scope)}</td>
      <td className="py-3.5 px-5 text-slate-500 font-mono text-xs">{unit}</td>
      <td className="py-3.5 px-5 text-right font-semibold text-slate-800">
        {co2Factor.toFixed(3)}{" "}
        <span className="text-xs font-normal text-slate-400">kg/Unit</span>
      </td>
      <td className="py-3.5 px-5 text-right">
        <button
          onClick={handleClick}
          title={!isDeletable ? "Kategorie in Benutzung" : "Kategorie löschen"}
          className={`font-medium text-xs transition-colors cursor-pointer ${
            isDeletable
              ? "text-red-600 hover:text-red-900"
              : "text-slate-400 hover:text-slate-600 font-semibold"
          }`}
        >
          {isDeletable ? "Löschen" : "In Benutzung"}
        </button>
      </td>
    </tr>
  );
};
