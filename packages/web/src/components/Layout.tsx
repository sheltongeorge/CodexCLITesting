import { NavLink, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const navItems = [
  { to: '/workouts', label: 'Workouts' },
  { to: '/start-session', label: 'Start Session' },
  { to: '/history', label: 'History' }
];

const getNavClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive ? 'bg-slate-200 text-slate-900' : 'text-slate-200 hover:bg-slate-800 hover:text-white'
  }`;

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="text-lg font-semibold text-slate-100">Workout Tracker</div>
          <nav className="flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={getNavClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </div>
  );
}
