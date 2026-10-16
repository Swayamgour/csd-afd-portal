import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

export function PublicLayout({ children }) {
  return (
    <>
      <Header />
      <main id="main" tabIndex={-1}>
        {children || <Outlet />}
      </main>
      <Footer />
    </>
  );
}

export default PublicLayout;
