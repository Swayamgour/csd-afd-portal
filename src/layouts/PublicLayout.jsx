import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Loader from '../components/common/Loader.jsx';


export function PublicLayout({ children }) {
  return (
    <>
      <Header />
      <main id="main" tabIndex={-1}>
        <Suspense
          fallback={
            <Loader variant="page" label="Loading page" />
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
