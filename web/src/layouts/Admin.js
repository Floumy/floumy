import React, { useEffect, useState } from 'react';
// react library for routing
import { Route, Routes, useParams } from 'react-router-dom';
// core components
import Sidebar from 'components/Sidebar/Sidebar.js';

import routes from 'routes.js';
import AdminNavbar from '../components/Navbars/AdminNavbar';
import useLayoutHandler from './useLayoutHandler';
import useNavigationHotKey from './useNavigationHotKey';
import { getNavigationItems } from '../utils/sidebarNavigation';
import Footer from '../components/Footers/Footer';
import { BuildInPublicProvider } from '../contexts/BuidInPublicContext';
import { ProjectsProvider, useProjects } from '../contexts/ProjectsContext';
import { OrgProvider } from '../contexts/OrgContext';
import NotFound from '../views/pages/errors/NotFound';
import AiChatSlideIn from '../components/SlideIn/AiChatSlideIn';
import { FEATURES, useFeatureFlags } from '../hooks/useFeatureFlags';

function Admin() {
  const { location, mainContentRef, getRoutes } = useLayoutHandler('admin');
  const [sidenavOpen, setSidenavOpen] = useState(true);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 2000);
  const { orgId, projectId } = useParams();
  const { isFeatureEnabled } = useFeatureFlags();

  // Keep chat always open on larger screens and track screen size
  useEffect(() => {
    const handleResize = () => {
      const largeScreen = window.innerWidth >= 2000;
      setIsLargeScreen(largeScreen);

      if (largeScreen) {
        setAiChatOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function isNavigationReplace() {
    let replace = false;
    if (location.pathname.includes('/new')) {
      replace = true;
    }
    return replace;
  }

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

  useNavigationHotKey(
    'w',
    `/admin/orgs/${orgId}/projects/${projectId}/work-item/new`,
  );
  useNavigationHotKey(
    'i',
    `/admin/orgs/${orgId}/projects/${projectId}/roadmap/initiatives/new`,
    isNavigationReplace(),
  );
  useNavigationHotKey(
    'm',
    `/admin/orgs/${orgId}/projects/${projectId}/roadmap/milestones/new`,
    isNavigationReplace(),
  );
  useNavigationHotKey(
    's',
    `/admin/orgs/${orgId}/projects/${projectId}/cycles/new`,
    isNavigationReplace(),
  );
  useNavigationHotKey(
    'o',
    `/admin/orgs/${orgId}/projects/${projectId}/okrs/new`,
    isNavigationReplace(),
  );
  useNavigationHotKey(
    'r',
    `/admin/orgs/${orgId}/projects/${projectId}/requests/new`,
    isNavigationReplace(),
  );
  useNavigationHotKey(
    'n',
    `/admin/orgs/${orgId}/projects/${projectId}/issues/new`,
    false,
  );

  useNavigationHotKey('left', -1);
  useNavigationHotKey('right', 1);

  useEffect(() => {
    if (window.innerWidth < 1200) {
      document.body.classList.add('g-sidenav-hidden');
      document.body.classList.remove('g-sidenav-pinned');
      setSidenavOpen(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lastVisitedProjectId', projectId);
  }, [projectId]);

  return (
    <>
      <BuildInPublicProvider orgId={orgId} projectId={projectId}>
        <OrgProvider orgId={orgId}>
          <ProjectsProvider orgId={orgId} projectId={projectId}>
            <AdminNavigationHotkeys orgId={orgId} projectId={projectId} />
            <Sidebar
              toggleSidenav={toggleSidenav}
              logo={{
                outterLink: 'https://floumy.com',
                // innerLink: "/admin/okrs",
                imgSrc: require('assets/img/brand/logo.png'),
                imgAlt: 'Floumy Logo',
              }}
            />
            <div
              className="main-content"
              ref={mainContentRef}
              style={{
                marginRight:
                  isLargeScreen &&
                  isFeatureEnabled(FEATURES.AI_CHAT_ASSISTANT, orgId)
                    ? '600px'
                    : '0',
              }}
            >
              <AdminNavbar
                theme={'dark'}
                sidenavOpen={sidenavOpen}
                toggleSidenav={toggleSidenav}
                aiChatOpen={aiChatOpen}
                toggleAiChat={() => setAiChatOpen(!aiChatOpen)}
              />
              <Routes>
                {getRoutes(routes)}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Footer />
            </div>
            {isFeatureEnabled(FEATURES.AI_CHAT_ASSISTANT, orgId) && (
              <AiChatSlideIn
                isOpen={aiChatOpen}
                toggle={() => setAiChatOpen(!aiChatOpen)}
              />
            )}
            {sidenavOpen ? (
              <div
                className="backdrop d-xl-none"
                onClick={toggleSidenav}
                onKeyDown={toggleSidenav}
                role="button"
              />
            ) : null}
          </ProjectsProvider>
        </OrgProvider>
      </BuildInPublicProvider>
    </>
  );
}

function AdminNavigationHotkeys({ orgId, projectId }) {
  const { currentProject } = useProjects();
  const cyclesEnabled = currentProject?.cyclesEnabled ?? false;
  const codeEnabled = currentProject?.codeEnabled ?? false;
  const navItems = getNavigationItems(cyclesEnabled, codeEnabled);

  const basePath = `/admin/orgs/${orgId}/projects/${projectId}`;

  useNavigationHotKey(
    '1',
    `${basePath}/${navItems[0]?.route ?? 'okrs'}`,
    false,
    navItems.length >= 1,
  );
  useNavigationHotKey(
    '2',
    `${basePath}/${navItems[1]?.route ?? 'roadmap'}`,
    false,
    navItems.length >= 2,
  );
  useNavigationHotKey(
    '3',
    `${basePath}/${navItems[2]?.route ?? 'active-cycle'}`,
    false,
    navItems.length >= 3,
  );
  useNavigationHotKey(
    '4',
    `${basePath}/${navItems[3]?.route ?? 'cycles'}`,
    false,
    navItems.length >= 4,
  );
  useNavigationHotKey(
    '5',
    `${basePath}/${navItems[4]?.route ?? 'pages'}`,
    false,
    navItems.length >= 5,
  );
  useNavigationHotKey(
    '6',
    `${basePath}/${navItems[5]?.route ?? 'code'}`,
    false,
    navItems.length >= 6,
  );
  useNavigationHotKey(
    '7',
    `${basePath}/${navItems[6]?.route ?? 'issues'}`,
    false,
    navItems.length >= 7,
  );
  useNavigationHotKey(
    '8',
    `${basePath}/${navItems[7]?.route ?? 'requests'}`,
    false,
    navItems.length >= 8,
  );

  return null;
}

export default Admin;
