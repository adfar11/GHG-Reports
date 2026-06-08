import { apiClient } from "../../../api/apiClient";

import type {
  CreateEmissionRecordDto,
  CreateVehicleDto,
  EmissionCategoryLookupDto,
  EmissionRecordListItemDto,
  FacilityLookupDto,
  VehicleLookupDto,
} from "../types/emission.types";

export const emissionService = {
  create: async (dto: CreateEmissionRecordDto): Promise<string> => {
    const cleanVehicleId =
      dto.vehicleId && dto.vehicleId.trim() !== "" ? dto.vehicleId : null;

    const cleanDescription =
      dto.description && dto.description.trim() !== "" ? dto.description : "-";

    const response = await apiClient.post<{ id: string }>("/EmissionRecords", {
      EmissionCategoryId: dto.emissionCategoryId,
      FacilityId: dto.facilityId,
      Quantity: Number(dto.quantity),
      ConsumptionDate: dto.consumptionDate,
      Description: cleanDescription,
      VehicleId: cleanVehicleId,
    });
    return response.data.id;
  },

  getCategories: async (): Promise<EmissionCategoryLookupDto[]> => {
    const response = await apiClient.get<EmissionCategoryLookupDto[]>(
      "/EmissionCategories",
    );
    return response.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/EmissionCategories/${id}`);
  },

  getFacilities: async (): Promise<FacilityLookupDto[]> => {
    const response = await apiClient.get<FacilityLookupDto[]>("/Facilities");
    return response.data;
  },

  getRecords: async (): Promise<EmissionRecordListItemDto[]> => {
    const response =
      await apiClient.get<EmissionRecordListItemDto[]>("/EmissionRecords");
    return response.data;
  },

  createCategory: async (category: {
    name: string;
    unit: string;
    co2Factor: number;
    scope: number;
  }): Promise<string> => {
    const response = await apiClient.post<{ id: string }>(
      "/EmissionCategories",
      {
        Name: category.name,
        Unit: category.unit,
        CO2Factor: Number(category.co2Factor),
        Scope: Number(category.scope),
      },
    );
    return response.data.id;
  },

  deleteRecord: async (id: string): Promise<void> => {
    await apiClient.delete(`/EmissionRecords/${id}`);
  },

  async deleteFacility(facilityId: string): Promise<void> {
    // Ersetzen Sie den URL-Pfad passend zu Ihrer Backend-API (z.B. /api/facilities/...)
    await apiClient.delete(`/facilities/${facilityId}`);
  },

  /*  async deleteFacility(facilityId: string): Promise<void> {
  await apiClient.delete(`/api/facilities/${facilityId}`);
} */

  updateRecord: async (
    id: string,
    dto: CreateEmissionRecordDto,
  ): Promise<void> => {
    const cleanVehicleId =
      dto.vehicleId && dto.vehicleId.trim() !== "" ? dto.vehicleId : null;
    const cleanDescription =
      dto.description && dto.description.trim() !== "" ? dto.description : "-";

    await apiClient.put(`/EmissionRecords/${id}`, {
      EmissionCategoryId: dto.emissionCategoryId,
      FacilityId: dto.facilityId,
      Quantity: Number(dto.quantity),
      ConsumptionDate: dto.consumptionDate,
      Description: cleanDescription,
      VehicleId: cleanVehicleId,
    });
  },
  createFacility: async (facility: {
    facilityName: string;
    country: string;
  }): Promise<string> => {
    const response = await apiClient.post<{ id: string }>("/Facilities", {
      FacilityName: facility.facilityName,
      Country: facility.country,
    });
    return response.data.id;
  },

  getVehicles: async (): Promise<VehicleLookupDto[]> => {
    const response = await apiClient.get<VehicleLookupDto[]>("/Vehicles");
    return response.data;
  },

  createVehicle: async (vehicle: CreateVehicleDto): Promise<string> => {
    const response = await apiClient.post<{ id: string }>("/Vehicles", {
      VehicleName: vehicle.vehicleName,
      LicensePlate: vehicle.licensePlate,
      Type: vehicle.type,
    });
    return response.data.id;
  },

  async deleteVehicle(vehicleId: string): Promise<void> {
    // Erzeugt den Request an: DELETE /api/vehicles/GU-ID-HIER
    await apiClient.delete(`/vehicles/${vehicleId}`);
  },
  async downloadAnnualReportPdf(
    year: number,
    month?: number,
    facilityName?: string,
    companyName?: string, // 🌟 NEU: 4. Parameter für die dynamische Firma
  ): Promise<void> {
    try {
      // 1. Wir packen alle Filter und Metadaten in die Query-Parameter
      const queryParams = new URLSearchParams();

      if (month !== undefined && month !== null) {
        queryParams.append("month", month.toString());
      }

      if (facilityName && facilityName.trim() !== "") {
        queryParams.append("facilityName", facilityName.trim());
      }

      // 🌟 NEU: Firmenname an die Query-Parameter anhängen, falls übermittelt
      if (companyName && companyName.trim() !== "") {
        queryParams.append("companyName", companyName.trim());
      }

      // 2. Route zusammenbauen (Das '/pdf' sitzt direkt hinter dem Jahr, vor dem Fragezeichen)
      const hasParams = queryParams.toString() !== "";
      const url = `/carbonreport/${year}/pdf${hasParams ? "?" + queryParams.toString() : ""}`;

      // 3. HTTP-Anfrage über euren registrierten apiClient absenden
      const response = await apiClient.get(url, {
        responseType: "blob", // Zwingend erforderlich, damit der Dateistrom intakt bleibt
      });

      const blob = response.data;

      if (blob.type === "application/json") {
        const errorText = await blob.text();
        console.error("Das Backend hat einen Fehler gemeldet:", errorText);
        alert(
          "Der Server konnte das PDF für diesen Standort nicht generieren.",
        );
        return;
      }

      // 4. Download im Browser auslösen
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      const monthSuffix = month ? `_Monat-${month}` : "";
      const facilitySuffix = facilityName
        ? `_${facilityName.replace(/[^a-zA-Z0-9]/g, "-")}`
        : "";

      // Dateiname lokal für den Browser definieren
      link.setAttribute(
        "download",
        `CO2_Bericht_${year}${monthSuffix}${facilitySuffix}.pdf`,
      );

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error: any) {
      console.error("Fehler beim PDF-Download im Service:", error);
      throw error;
    }
  },
};
