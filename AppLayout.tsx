import { Outlet } from 'react-router-dom';
import { Sidebar, BottomNav, TopBar } from './Navigation';

export function AppLayout() {
  return (
    <div className="min-h-screen surface-muted flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 pb-20 lg:pb-0">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
