import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const STORAGE_KEY = 'dose-sidebar-collapsed';

/** Layout route: adds the desktop (>=1024px) sidebar. Below that it renders the page untouched. */
const AppShell = () => {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    } catch {
      /* storage unavailable */
    }
  };

  return (
    <>
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <div className={collapsed ? 'lg:pl-[72px]' : 'lg:pl-60'}>
        <Outlet />
      </div>
    </>
  );
};

export default AppShell;
