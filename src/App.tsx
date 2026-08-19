import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Shell } from './components/Shell';
import { FaqPage } from './pages/FaqPage';
import { HomePage } from './pages/HomePage';
import { RsvpPage } from './pages/RsvpPage';
import { SchedulePage } from './pages/SchedulePage';
import { VenuePage } from './pages/VenuePage';
import { WeddingPage } from './pages/WeddingPage';

const AdminPage = lazy(() =>
  import('./pages/AdminPage').then((module) => ({ default: module.AdminPage })),
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<HomePage />} />
          <Route path="wedding" element={<WeddingPage />} />
          <Route path="venue" element={<VenuePage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="rsvp" element={<RsvpPage />} />
          <Route
            path="admin"
            element={
              <Suspense fallback={<p className="section">Loading admin area…</p>}>
                <AdminPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
