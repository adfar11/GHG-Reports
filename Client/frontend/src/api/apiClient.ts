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
  (response) => response, // Wenn der Request erfolgreich war, einfach weiterleiten
  (error: AxiosError) => {
    // Falls der Server mit einem Fehler antwortet (400, 404, 500, etc.)
    if (error.response) {
      const apiError = error.response.data as ApiValidationError;

      // Du kannst hier globale Seiteneffekte einbauen (z. B. Toasts oder Logger)
      console.error(`[API Error ${error.response.status}]:`, apiError.message);

      // Bei einem 401 Unauthorized könnte man hier den User ausloggen
      if (error.response.status === 401) {
        // localStorage.removeItem('token');
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // Der Request wurde gesendet, aber keine Antwort empfangen (z. B. Backend läuft nicht)
      console.error("[API Network Error]: Das Backend ist nicht erreichbar.");
    }

    // Den Fehler weiterreichen, damit die UI-Komponente (z.B. das Formular) spezifisch reagieren kann
    return Promise.reject(error);
  },
);
