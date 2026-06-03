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
    const response = await apiClient.post<{ id: string }>(
      "/EmissionRecords",
      dto,
    );
    return response.data.id;
  },

  // GET: api/EmissionCategories (Liefert alle Kategorien für das Dropdown)
  getCategories: async (): Promise<EmissionCategoryLookupDto[]> => {
    const response = await apiClient.get<EmissionCategoryLookupDto[]>(
      "/EmissionCategories",
    );
    return response.data;
  },

  // GET: api/Facilities (Falls du den Controller hast, liefert alle Standorte)
  getFacilities: async (): Promise<FacilityLookupDto[]> => {
    const response = await apiClient.get<FacilityLookupDto[]>("/Facilities");
    return response.data;
  },

  // KORRIGIERT: Semikolon am Ende durch ein Komma (oder gar nichts beim letzten Element) ersetzt
  getRecords: async (): Promise<EmissionRecordListItemDto[]> => {
    const response =
      await apiClient.get<EmissionRecordListItemDto[]>("/EmissionRecords");
    return response.data;
  },

  // Erweitere das bestehende emissionService-Objekt um diesen Eintrag:

  createFacility: async (facility: {
    facilityName: string;
    country: string;
  }): Promise<string> => {
    // Wir mappen die Keys auf PascalCase um, passend zum C# Record
    const response = await apiClient.post<{ id: string }>("/Facilities", {
      FacilityName: facility.facilityName, // 👈 Großgeschrieben (PascalCase)
      Country: facility.country, // 👈 Großgeschrieben (PascalCase)
    });
    return response.data.id;
  },

  // Erweitere das bestehende emissionService-Objekt um diese zwei Methoden:

  // GET: api/Vehicles (Lädt alle Fahrzeuge)
  // GET: api/Vehicles
  getVehicles: async (): Promise<VehicleLookupDto[]> => {
    const response = await apiClient.get<VehicleLookupDto[]>("/Vehicles");
    return response.data;
  },

  // POST: api/Vehicles
  createVehicle: async (vehicle: CreateVehicleDto): Promise<string> => {
    const response = await apiClient.post<{ id: string }>("/Vehicles", {
      // Explizites Mapping auf die C#-PascalCase-Eigenschaften des Commands
      VehicleName: vehicle.vehicleName,
      LicensePlate: vehicle.licensePlate,
      Type: vehicle.type,
    });
    return response.data.id;
  },

  // Fügen Sie diese Methode in Ihre 'emissionService.ts' oder einen passenden 'reportService.ts' ein:
  // Fügen Sie diese Methode in Ihr Service-Objekt ein:

  downloadAnnualReportPdf: async (
    year: number,
    month?: number,
  ): Promise<void> => {
    // Query-Parameter für den Monat nur anhängen, wenn er existiert
    const queryParams = month ? `?month=${month}` : "";
    const url = `/carbonreport/${year}/pdf${queryParams}`;

    const response = await apiClient.get(url, {
      responseType: "blob", // Verhindert, dass die Binärdaten korrumpiert werden
    });

    // Erstellt einen Download-Link im Browser-Speicher
    const blob = new Blob([response.data], { type: "application/pdf" });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;

    // Dynamischer Dateiname passend zum Backend
    const dateiname = month
      ? `Emission_Report_${year}_${String(month).padStart(2, "0")}.pdf`
      : `Yearly_Emission_Report_${year}.pdf`;

    link.setAttribute("download", dateiname);
    document.body.appendChild(link);
    link.click();

    // Speicherbereinigung
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },
};

// Erweitere das bestehende emissionService-Objekt um diese Methode:
