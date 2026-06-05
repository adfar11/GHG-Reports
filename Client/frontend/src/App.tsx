import { CarbonReportingPage } from "./pages/CarbonReportingPage";
import { MainLayout } from "./layouts/MainLayout";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { VehiclesPage } from "./pages/VehiclesPage";
import { FacilitiesPage } from "./pages/FacilitiesPage";
import { CategoriesPage } from "./pages/CategoriesPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Das MainLayout umschließt alle Unterseiten */}
        <Route path="/" element={<MainLayout />}>
          {/* Die Standard-Unterseite (Index-Route) */}
          <Route index element={<CarbonReportingPage />} />

          {/* Weitere Pfade für die Navigation */}
          <Route path="facilities" element={<FacilitiesPage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="categories" element={<CategoriesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
