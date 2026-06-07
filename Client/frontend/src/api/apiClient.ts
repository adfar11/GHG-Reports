import axios, { AxiosError } from "axios";
import { type ApiValidationError } from "../features/carbon-reporting/types/emission.types";

// Zentrale Axios-Instanz erstellen
export const apiClient = axios.create({
  baseURL: "http://localhost:5000/api", // Stelle hier deinen echten .NET-Port ein
  headers: {
    "Content-Type": "application/json",
  },
});

// Globaler Response-Interceptor für Fehlerbehandlung
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const apiError = error.response.data as ApiValidationError;
      console.error(`[API Error ${error.response.status}]:`, apiError?.message);
    } else if (error.request) {
      console.error("[API Network Error]: Das Backend ist nicht erreichbar.");
    }
    return Promise.reject(error);
  },
);
