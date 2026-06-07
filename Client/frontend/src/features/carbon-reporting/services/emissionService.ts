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

  /**
   * Lädt den CO₂-Jahresbericht als PDF vom Backend herunter.
   * KORRIGIERT: Nutzt jetzt 'apiClient.get' und ist am Ende vollzählig geschlossen.
   */
  /**
   * Lädt den CO₂-Bericht vom festen Jahres-Pfad herunter.
   * KORRIGIERT: Baut die URL exakt als /carbonreport/{year}/pdf auf.
   */
  async downloadAnnualReportPdf(
    year: number,
    month?: number,
    facilityName?: string,
  ): Promise<void> {
    try {
      // 1. Wir packen Monat und Standort in die Query-Parameter
      const queryParams = new URLSearchParams();

      if (month !== undefined && month !== null) {
        queryParams.append("month", month.toString());
      }

      if (facilityName && facilityName.trim() !== "") {
        queryParams.append("facilityName", facilityName.trim());
      }

      // 2. 🌟 KORREKTUR: Das '/pdf' muss direkt hinter das Jahr, vor das Fragezeichen!
      // Ergibt exakt: /carbonreport/2026/pdf?month=6&facilityName=Werk-Hamburg
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
