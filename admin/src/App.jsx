import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./layouts/AdminLayout";
import ModuleList from "./pages/admin/ModuleList";
import ModuleEditor from "./pages/admin/ModuleEditor";
import LevelManager from "./pages/admin/LevelManager";
import LevelEditor from "./pages/admin/LevelEditor";
import Dashboard from "./pages/admin/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLogin />} />

        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/modules" element={<ModuleList />} />
          <Route path="/modules/new" element={<ModuleEditor />} />
          <Route path="/modules/:id/edit" element={<ModuleEditor />} />
          <Route path="/modules/:moduleId/levels" element={<LevelManager />} />
          <Route path="/modules/:moduleId/levels/new" element={<LevelEditor />} />
          <Route path="/modules/:moduleId/levels/:levelId/edit" element={<LevelEditor />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
