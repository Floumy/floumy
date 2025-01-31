import React, { useEffect, useState } from 'react';
// react library for routing
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
// core components
import Sidebar from 'components/Sidebar/Sidebar.js';

import routes from 'routes.js';
import AdminNavbar from '../components/Navbars/AdminNavbar';
import useLayoutHandler from './useLayoutHandler';
import useNavigationHotKey from './useNavigationHotKey';
import Footer from '../components/Footers/Footer';
import { BuildInPublicProvider } from '../contexts/BuidInPublicContext';
import { ProjectsProvider } from '../contexts/ProjectsContext';

function Admin() {
  const { location, mainContentRef, getRoutes } = useLayoutHandler('admin');
  const [sidenavOpen, setSidenavOpen] = useState(true);
  const { orgId, projectId } = useParams();

  function isNavigationReplace() {
    let replace = false;
    if (location.pathname.includes('/new')) {
      replace = true;
    }
    return replace;
  }

  const toggleSidenav = () => {
    if (document.body.classList.contains("g-sidenav-pinned")) {
      document.body.classList.remove("g-sidenav-pinned");
      document.body.classList.add("g-sidenav-hidden");
    } else {
      document.body.classList.add("g-sidenav-pinned");
      document.body.classList.remove("g-sidenav-hidden");
    }
    setSidenavOpen(!sidenavOpen);
  };

  useNavigationHotKey('1', `/admin/orgs/${orgId}/projects/${projectId}/feed`);
  useNavigationHotKey('2', `/admin/orgs/${orgId}/projects/${projectId}/okrs`);
  useNavigationHotKey('3', `/admin/orgs/${orgId}/projects/${projectId}/roadmap`);
  useNavigationHotKey('4', `/admin/orgs/${orgId}/projects/${projectId}/sprints`);
  useNavigationHotKey('5', `/admin/orgs/${orgId}/projects/${projectId}/active-sprint`);
  useNavigationHotKey('6', `/admin/orgs/${orgId}/projects/${projectId}/work-items`);
  useNavigationHotKey('7', `/admin/orgs/${orgId}/projects/${projectId}/features`);
  useNavigationHotKey('8', `/admin/orgs/${orgId}/projects/${projectId}/code`);
  useNavigationHotKey('w', `/admin/orgs/${orgId}/projects/${projectId}/work-item/new`, isNavigationReplace());
  useNavigationHotKey('i', `/admin/orgs/${orgId}/projects/${projectId}/roadmap/features/new`, isNavigationReplace());
  useNavigationHotKey('m', `/admin/orgs/${orgId}/projects/${projectId}/roadmap/milestones/new`, isNavigationReplace());
  useNavigationHotKey('s', `/admin/orgs/${orgId}/projects/${projectId}/sprints/new`, isNavigationReplace());
  useNavigationHotKey('o', `/admin/orgs/${orgId}/projects/${projectId}/okrs/new`, isNavigationReplace());
  useNavigationHotKey('r', `/admin/orgs/${orgId}/projects/${projectId}/feature-requests/new`, isNavigationReplace());
  useNavigationHotKey('n', `/admin/orgs/${orgId}/projects/${projectId}/issues/new`, false);

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
    <>
      <BuildInPublicProvider orgId={orgId} projectId={projectId}>
        <ProjectsProvider orgId={orgId} projectId={projectId}>
          <Sidebar
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
              <Route
                path="*"
                element={<Navigate to="/admin/dashboard" replace />}
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
        </ProjectsProvider>
      </BuildInPublicProvider>
    </>
  );
}

export default Admin;
