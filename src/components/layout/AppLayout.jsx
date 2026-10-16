import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export const AppLayout = () => {
  return (
    <div className="app-shell">
      <Header />
      <main className="main-content container">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
