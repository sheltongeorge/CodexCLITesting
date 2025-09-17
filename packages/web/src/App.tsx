import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HistoryPage } from './pages/HistoryPage';
import { StartSessionPage } from './pages/StartSessionPage';
import { WorkoutsPage } from './pages/WorkoutsPage';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/workouts" replace />} />
        <Route path="/workouts" element={<WorkoutsPage />} />
        <Route path="/start-session" element={<StartSessionPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/workouts" replace />} />
    </Routes>
  );
}

export default App;
