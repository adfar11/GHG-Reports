import React, { useState, useEffect } from "react";
import { emissionService } from "../features/carbon-reporting/services/emissionService";
import {
  type FacilityLookupDto,
  type ApiValidationError,
} from "../features/carbon-reporting/types/emission.types";
import axios from "axios";

export const FacilitiesPage: React.FC = () => {
  // Listen- und Lade-States
  const [facilities, setFacilities] = useState<FacilityLookupDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Formular-State
  const [formData, setFormData] = useState({
    facilityName: "",
    country: "",
  });

  // Feedback-States
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>(
    {},
  );
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Daten per GET aus dem Backend laden
  useEffect(() => {
    const loadFacilities = async () => {
      try {
        const data = await emissionService.getFacilities();
        setFacilities(data);
      } catch (err) {
        setGlobalError(`Fehler  ${err} beim Laden der Standorte vom Server.`);
      } finally {
        setIsLoading(false);
      }
    };
    loadFacilities();
  }, [refreshTrigger]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2. Formular absenden (POST)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGlobalError(null);
    setSuccessMessage(null);

    try {
      await emissionService.createFacility(formData);
      setSuccessMessage(
        `Standort "${formData.facilityName}" erfolgreich angelegt!`,
      );
      setFormData({ facilityName: "", country: "" }); // Formular leeren
      setRefreshTrigger((prev) => prev + 1); // Tabelle live aktualisieren
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiValidationError;
        if (error.response.status === 400 && apiError.errors) {
          setFieldErrors(apiError.errors);
        } else {
          setGlobalError(apiError.message || "Ein Fehler ist aufgetreten.");
        }
      }
    }
  };

  if (isLoading)
    return (
      <div className="text-slate-500 text-sm animate-pulse p-4">
        Lade Standorte...
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Standorte (Facilities)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Verwalten Sie hier die Werke und Liegenschaften Ihres Unternehmens.
        </p>
      </div>

      {globalError && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {globalError}
        </div>
      )}

      {/* Grid-Layout: Formular links, Tabelle rechts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* FORMULAR: Neuer Standort */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Standort hinzufügen
          </h2>

          {successMessage && (
            <div className="p-3 mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Name des Werks / Büros
              </label>
              <input
                type="text"
                name="facilityName"
                value={formData.facilityName}
                onChange={handleChange}
                placeholder="z.B. Werk Hamburg"
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-hidden focus:ring-2 ${fieldErrors["FacilityName"] ? "border-red-300 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"}`}
              />
              {fieldErrors["FacilityName"] && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors["FacilityName"]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Land (Country)
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="z.B. Deutschland"
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-hidden focus:ring-2 ${fieldErrors["Country"] ? "border-red-300 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"}`}
              />
              {fieldErrors["Country"] && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors["Country"]}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors shadow-xs"
            >
              Standort speichern
            </button>
          </form>
        </div>

        {/* TABELLE: Bestehende Standorte */}
        <div className="lg:col-span-2 overflow-x-auto rounded-xl border border-slate-200">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">
              Registrierte Standorte
            </h3>
          </div>

          {facilities.length === 0 ? (
            <p className="p-6 text-sm text-slate-500 text-center">
              Noch keine Standorte in der Datenbank hinterlegt.
            </p>
          ) : (
            <table className="w-full border-collapse text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Standort-ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Land (Strommix)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {facilities.map((f) => (
                  <tr
                    key={f.facilityId}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-400 max-w-30 truncate">
                      {f.facilityId}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {f.facilityName}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 border border-blue-100">
                        📍 {f.country}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
