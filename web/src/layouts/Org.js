import React, { useEffect, useState } from 'react';
// react library for routing
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
// core components
import routes from 'routes.js';
import AdminNavbar from '../components/Navbars/AdminNavbar';
import useLayoutHandler from './useLayoutHandler';
import useNavigationHotKey from './useNavigationHotKey';
import Footer from '../components/Footers/Footer';
import { OrgProvider } from '../contexts/OrgContext';
import OrgSidebar from '../components/Sidebar/OrgSidebar';

function OrgLayout() {
  const { mainContentRef, getRoutes } = useLayoutHandler('org');
  const [sidenavOpen, setSidenavOpen] = useState(true);
  const { orgId } = useParams();


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

  const helpButtonStyle = {
    backgroundColor: 'rgb(0, 0, 0)',
    color: 'rgb(255, 255, 255)',
    display: 'flex',
    alignItems: 'center',
    transform: 'rotate(-90deg) translateX(calc(124px))',
    visibility: 'visible',
  };

  return (
    <OrgProvider orgId={orgId}>
      <OrgSidebar
        toggleSidenav={toggleSidenav}
        logo={{
          outterLink: 'https://floumy.com',
          // innerLink: "/admin/okrs",
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
          {getRoutes(routes)}
          {/*TODO: Redirect to not found page here*/}
          <Route
            path="*"
            element={<Navigate to={`/orgs/${orgId}/projects`} replace />}
          />
        </Routes>
        <Footer />
      </div>
      {sidenavOpen ? (
        <div className="backdrop d-xl-none" onClick={toggleSidenav} onKeyDown={toggleSidenav} role="button" />
      ) : null}
      <button id="userHelpButton" className="userHelpButtonMiddleRight" data-drawer-trigger="true"
              aria-controls="drawer-name" aria-expanded="false"
              style={helpButtonStyle}>Report
        a problem
      </button>
    </OrgProvider>
  );
}

export default OrgLayout;
