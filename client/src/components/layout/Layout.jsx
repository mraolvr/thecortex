import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-[#1C1C1C]">
      <Sidebar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
} 