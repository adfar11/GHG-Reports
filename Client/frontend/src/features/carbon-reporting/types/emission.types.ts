export interface CreateEmissionRecordDto {
  facilityId: string;
  emissionCategoryId: string;
  quantity: number;
  consumptionDate: string;
  description: string;
  vehicleId: string | null;
}

export interface EmissionRecordListItemDto {
  id: string;
  facilityName: string;
  categoryName: string;
  quantity: number;
  unit: string;
  consumptionDate: string;
  description: string;
  calculatedCO2e: number; // Der vom Backend berechnete Wert
}

export interface ApiValidationError {
  statusCode: number;
  message: string;
  errors: { [key: string]: string[] } | null; // Mappt z.B. "Quantity" -> ["Quantity must be greater than 0."]
  detailed: string | null;
}

export interface FacilityLookupDto {
  facilityId: string;
  facilityName: string;
  country: string;
}

export interface EmissionCategoryLookupDto {
  id: string;
  name: string;
  unit: string;
}

export interface VehicleLookupDto {
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  type: string;
}

export interface CreateVehicleDto {
  vehicleName: string;
  licensePlate: string;
  type: string;
}
