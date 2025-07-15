import React, { useEffect, useState } from 'react';
// react library for routing
import { Route, Routes } from 'react-router-dom';
// core components
import { userRoutes } from 'routes.js';
import AdminNavbar from '../components/Navbars/AdminNavbar';
import useLayoutHandler from './useLayoutHandler';
import useNavigationHotKey from './useNavigationHotKey';
import Footer from '../components/Footers/Footer';
import NotFound from '../views/pages/errors/NotFound';
import UserSidebar from '../components/Sidebar/UserSidebar';

function UserLayout() {
  const { mainContentRef, getRoutes } = useLayoutHandler('user');
  const [sidenavOpen, setSidenavOpen] = useState(true);

  const toggleSidenav = () => {
    if (document.body.classList.contains('g-sidenav-pinned')) {
      document.body.classList.remove('g-sidenav-pinned');
      document.body.classList.add('g-sidenav-hidden');
    } else {
      document.body.classList.add('g-sidenav-pinned');
      document.body.classList.remove('g-sidenav-hidden');
    }
    setSidenavOpen(!sidenavOpen);
  };

  useNavigationHotKey('left', -1);
  useNavigationHotKey('right', 1);

  useEffect(() => {
    if (window.innerWidth < 1200) {
      document.body.classList.add('g-sidenav-hidden');
      document.body.classList.remove('g-sidenav-pinned');
      setSidenavOpen(false);
    }
  }, []);

  return (
    <>
      <UserSidebar
        toggleSidenav={toggleSidenav}
        logo={{
          outterLink: 'https://floumy.com',
          imgSrc: require('assets/img/brand/logo.png'),
          imgAlt: 'Floumy Logo',
        }}
      />
      <div className="main-content" ref={mainContentRef}>
        <AdminNavbar
          theme={'dark'}
          sidenavOpen={sidenavOpen}
          toggleSidenav={toggleSidenav}
        />
        <Routes>
          {getRoutes(userRoutes)}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
      {sidenavOpen ? (
        <div
          className="backdrop d-xl-none"
          onClick={toggleSidenav}
          onKeyDown={toggleSidenav}
          role="button"
        />
      ) : null}
    </>
  );
}

export default UserLayout;
