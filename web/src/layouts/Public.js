/*!

=========================================================
* Argon Dashboard PRO React - v1.2.4
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-pro-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { useEffect } from "react";
// react library for routing
import { Navigate, Route, Routes } from "react-router-dom";
// core components
import { publicRoutes } from "routes.js";
import useLayoutHandler from "./useLayoutHandler";
import useNavigationHotKey from "./useNavigationHotKey";
import PublicSidebar from "../components/Sidebar/PublicSidebar";
import { getBuildInPublicSettings } from "../services/bip/build-in-public.service";
import { getPublicOrg } from "../services/org/orgs.service";
import PublicNavbar from "../components/Navbars/PublicNavbar";
import Footer from "../components/Footers/Footer";

function PublicLayout() {
  const { mainContentRef, location, getRoutes } = useLayoutHandler("public");
  const [sidenavOpen, setSidenavOpen] = React.useState(true);
  const urlSegments = window.location.pathname.split("/");
  const orgId = urlSegments[3];
  const productId = urlSegments[5];
  const [org, setOrg] = React.useState();

  const [buildInPublicSettings, setBuildInPublicSettings] = React.useState({
    isObjectivesPagePublic: false,
    isRoadmapPagePublic: false,
    isIterationsPagePublic: false,
    isActiveIterationsPagePublic: false,
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

  useNavigationHotKey("r", `/public/orgs/${orgId}/projects/${productId}/feature-requests/new`, isNavigationReplace(), org?.paymentPlan === "premium");
  useNavigationHotKey("f", `/public/orgs/${orgId}/projects/${productId}/feature-requests`, false, org?.paymentPlan === "premium");
  useNavigationHotKey("left", -1);
  useNavigationHotKey("right", 1);

  useEffect(() => {
    getPublicOrg(orgId)
      .then((org) => {
        setOrg(org);
      })
      .catch((e) => {
        console.error(e.message);
        window.location.href = "/auth/sign-in";
      });
    getBuildInPublicSettings(orgId, productId)
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
  }, [orgId, productId]);

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

  if (!org) {
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
        org={org}
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
