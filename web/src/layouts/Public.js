
import React, { useEffect } from "react";
// react library for routing
import { Navigate, Route, Routes } from "react-router-dom";
// core components
import { publicRoutes } from "routes.js";
import useLayoutHandler from "./useLayoutHandler";
import useNavigationHotKey from "./useNavigationHotKey";
import PublicSidebar from "../components/Sidebar/PublicSidebar";
import { getBuildInPublicSettings } from "../services/bip/build-in-public.service";
import PublicNavbar from "../components/Navbars/PublicNavbar";
import Footer from "../components/Footers/Footer";
import { getPublicProject } from '../services/projects/projects.service';

function PublicLayout() {
  const { mainContentRef, location, getRoutes } = useLayoutHandler("public");
  const [sidenavOpen, setSidenavOpen] = React.useState(true);
  const urlSegments = window.location.pathname.split("/");
  const orgId = urlSegments[3];
  const projectId = urlSegments[5];
  const [project, setProject] = React.useState();

  const [buildInPublicSettings, setBuildInPublicSettings] = React.useState({
    isObjectivesPagePublic: false,
    isRoadmapPagePublic: false,
    isSprintsPagePublic: false,
    isActiveSprintsPagePublic: false,
    isFeedPagePublic: false,
    isIssuesPagePublic: false,
    isFeatureRequestsPagePublic: false
  });

  function isNavigationReplace() {
    let replace = false;
    if (location.pathname.includes("/new")) {
      replace = true;
    }
    return replace;
  }

  useNavigationHotKey("r", `/public/orgs/${orgId}/projects/${projectId}/feature-requests/new`, isNavigationReplace());
  useNavigationHotKey("f", `/public/orgs/${orgId}/projects/${projectId}/feature-requests`, false);
  useNavigationHotKey("left", -1);
  useNavigationHotKey("right", 1);

  useEffect(() => {
    getPublicProject(orgId, projectId)
      .then((project) => {
        setProject(project);
      })
      .catch((e) => {
        console.error(e.message);
        window.location.href = "/auth/sign-in";
      });
    getBuildInPublicSettings(orgId, projectId)
      .then((buildInPublicSettings) => {
        if (buildInPublicSettings.isBuildInPublicEnabled) {
          setBuildInPublicSettings(buildInPublicSettings);
        } else {
          window.location.href = "/auth/sign-in";
        }
      })
      .catch((e) => {
        console.error(e.message);
        window.location.href = "/auth/sign-in";
      });
  }, [orgId, projectId]);

  useEffect(() => {
    if (window.innerWidth < 1200) {
      document.body.classList.add("g-sidenav-hidden");
      document.body.classList.remove("g-sidenav-pinned");
      setSidenavOpen(false);
    }
  }, []);

  // toggles collapse between mini sidenav and normal
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

  if (!project) {
    return <div className="main-content" ref={mainContentRef}></div>;
  }

  return (
    <>
      <PublicNavbar
        theme={"dark"}
        toggleSidenav={toggleSidenav}
        sidenavOpen={sidenavOpen}
      />
      <PublicSidebar
        orgId={orgId}
        project={project}
        toggleSidenav={toggleSidenav}
        sidenavOpen={sidenavOpen}
        buildingInPublicSettings={buildInPublicSettings}
        logo={{
          outterLink: "https://floumy.com",
          imgSrc: require("assets/img/brand/logo.png"),
          imgAlt: "Floumy Logo"
        }}
      />
      <div className="main-content" ref={mainContentRef}>
        <Routes>
          {getRoutes(publicRoutes)}
          <Route
            path="*"
            element={<Navigate to="/auth/sign-in" replace />}
          />
        </Routes>
        <Footer />
      </div>
      {sidenavOpen ? (
        <div className="backdrop d-xl-none" onClick={toggleSidenav} onKeyDown={toggleSidenav} role="button" />
      ) : null}
    </>
  );
}

export default PublicLayout;
