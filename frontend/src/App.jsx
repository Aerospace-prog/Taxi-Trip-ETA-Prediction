import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth, RequireAdmin } from './components/RouteGuards';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/dispatcher/DashboardPage';
import NewPredictionPage from './pages/dispatcher/NewPredictionPage';
import PredictionResultPage from './pages/dispatcher/PredictionResultPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import PredictionHistoryPage from './pages/admin/PredictionHistoryPage';
import RetrainModelPage from './pages/admin/RetrainModelPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Dispatcher Routes */}
          <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/predict" element={<NewPredictionPage />} />
            <Route path="/result" element={<PredictionResultPage />} />
            <Route path="/history" element={<PredictionHistoryPage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<RequireAdmin><AppLayout /></RequireAdmin>}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/predict" element={<NewPredictionPage />} />
            <Route path="/admin/result" element={<PredictionResultPage />} />
            <Route path="/admin/history" element={<PredictionHistoryPage />} />
            <Route path="/admin/retrain" element={<RetrainModelPage />} />
          </Route>

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
