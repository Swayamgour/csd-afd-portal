import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { LoadingState } from '../components/common/States.jsx';

export function PublicLayout({ children }) {
  return (
    <>
      <Header />
      <main id="main" tabIndex={-1}>
        <Suspense
          fallback={
            <div className="portal-content-loader-container" style={{ minHeight: '60vh' }}>
              <LoadingState text="Loading page..." />
            </div>
          }
        >
          {children || <Outlet />}
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

export default PublicLayout;
