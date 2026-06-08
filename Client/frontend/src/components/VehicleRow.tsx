import React from "react";
import { type VehicleLookupDto } from "../features/carbon-reporting/types/emission.types";

interface VehicleRowProps {
  vehicle: VehicleLookupDto;
  onDelete: (id: string, name: string) => void;
}

export const VehicleRow: React.FC<VehicleRowProps> = ({
  vehicle,
  onDelete,
}) => {
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

  // Fängt sowohl camelCase (isUsed) als auch PascalCase (IsUsed) aus der API ab
  const isUsedInBackend = vehicle.isUsed ?? (vehicle as any).IsUsed ?? false;
  const isDeletable = !isUsedInBackend;

  const handleClick = () => {
    if (!isDeletable) {
      // Sichtbare Notifikation im Frontend statt stillem Fehler
      alert(
        `Action blocked: The vehicle "${vehicle.vehicleName}" is still referenced in active records (emission reports) and cannot be deleted.`,
      );
      return;
    }

    onDelete(vehicle.vehicleId, vehicle.vehicleName);
  };

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4 font-medium text-slate-900">
        {vehicle.vehicleName}
      </td>
      <td className="px-6 py-4 font-mono text-xs text-slate-500">
        {vehicle.licensePlate}
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            vehicle.type === "BatteryElectric"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : vehicle.type === "PlugInHybrid"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}
        >
          {getReadableType(vehicle.type)}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <button
          onClick={handleClick}
          title={!isDeletable ? "Vehicle in use" : "Delete vehicle"}
          className={`font-medium text-xs transition-colors cursor-pointer ${
            isDeletable
              ? "text-red-600 hover:text-red-900"
              : "text-slate-400 hover:text-slate-600 font-semibold"
          }`}
        >
          {isDeletable ? "Delete" : "In Use"}
        </button>
      </td>
    </tr>
  );
};
