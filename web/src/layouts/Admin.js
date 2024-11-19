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
import React, { useEffect, useLayoutEffect, useState } from "react";
// react library for routing
import { Navigate, Route, Routes } from "react-router-dom";
// core components
import Sidebar from "components/Sidebar/Sidebar.js";

import routes from "routes.js";
import AdminNavbar from "../components/Navbars/AdminNavbar";
import useLayoutHandler from "./useLayoutHandler";
import useNavigationHotKey from "./useNavigationHotKey";
import { Offline, Online } from "react-detect-offline";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import Footer from "../components/Footers/Footer";
import { setCurrentOrg } from "../services/org/orgs.service";
import { BuildInPublicProvider } from "../contexts/BuidInPublicContext";

function Admin() {
  const { location, mainContentRef, getRoutes } = useLayoutHandler("admin");
  const [sidenavOpen, setSidenavOpen] = useState(true);
  const currentOrg = JSON.parse(localStorage.getItem("currentOrg"));
  const orgId = currentOrg ? currentOrg.id : "";
  const productId = currentOrg ? currentOrg.products[0].id : "";

  function isNavigationReplace() {
    let replace = false;
    if (location.pathname.includes("/new")) {
      replace = true;
    }
    return replace;
  }

  useNavigationHotKey("1", `/admin/orgs/${orgId}/products/${productId}/feed`);
  useNavigationHotKey("2", `/admin/orgs/${orgId}/products/${productId}/okrs`);
  useNavigationHotKey("3", `/admin/orgs/${orgId}/products/${productId}/roadmap`);
  useNavigationHotKey("4", `/admin/orgs/${orgId}/products/${productId}/iterations`);
  useNavigationHotKey("5", `/admin/orgs/${orgId}/products/${productId}/active-iteration`);
  useNavigationHotKey("6", `/admin/orgs/${orgId}/products/${productId}/work-items`);
  useNavigationHotKey("7", `/admin/orgs/${orgId}/products/${productId}/features`);
  useNavigationHotKey("w", `/admin/orgs/${orgId}/products/${productId}/work-item/new`, isNavigationReplace());
  useNavigationHotKey("i", `/admin/orgs/${orgId}/products/${productId}/roadmap/features/new`, isNavigationReplace());
  useNavigationHotKey("m", `/admin/orgs/${orgId}/products/${productId}/roadmap/milestones/new`, isNavigationReplace());
  useNavigationHotKey("s", `/admin/orgs/${orgId}/products/${productId}/iterations/new`, isNavigationReplace());
  useNavigationHotKey("o", `/admin/orgs/${orgId}/products/${productId}/okrs/new`, isNavigationReplace());
  useNavigationHotKey("r", `/admin/orgs/${orgId}/products/${productId}/feature-requests/new`, isNavigationReplace(), currentOrg?.paymentPlan === "premium");
  useNavigationHotKey("n", `/admin/orgs/${orgId}/products/${productId}/issues/new`, false, currentOrg?.paymentPlan === "premium");

  useNavigationHotKey("left", -1);
  useNavigationHotKey("right", 1);

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
  const getNavbarTheme = () => {
    return location.pathname.indexOf("admin/alternative-dashboard") === -1
      ? "dark"
      : "light";
  };

  useEffect(() => {
    if (window.innerWidth < 1200) {
      document.body.classList.add("g-sidenav-hidden");
      document.body.classList.remove("g-sidenav-pinned");
      setSidenavOpen(false);
    }
  }, []);

  useEffect(() => {
    // Calculate the interval time in milliseconds (6 hours = 6 * 60 * 60 * 1000 ms)
    const intervalTime = 6 * 60 * 60 * 1000;

    // Set up the interval
    const intervalId = setInterval(setCurrentOrg, intervalTime);

    // Run the function immediately on mount
    setCurrentOrg();

    // Clear the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  function getCurrentUser() {
    const currentUser = localStorage.getItem("currentUser");

    let currentUserData = {};

    try {
      currentUserData = JSON.parse(currentUser);
    } catch (e) {
      console.error(e);
      return null;
    }

    return currentUserData;
  }

  useLayoutEffect(() => {
    const timer = setTimeout(() => {
      if (window.isUserHelpReady === true &&
        window.UserHelpSetName !== undefined &&
        window.UserHelpSetEmail !== undefined) {
        const currentUserData = getCurrentUser();
        if (currentUserData !== null) {
          window.UserHelpSetName(currentUserData.name);
          window.UserHelpSetEmail(currentUserData.email);
        }
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const helpButtonStyle = {
    backgroundColor: "rgb(0, 0, 0)",
    color: "rgb(255, 255, 255)",
    display: "flex",
    alignItems: "center",
    transform: "rotate(-90deg) translateX(calc(124px))",
    visibility: "visible"
  };

  return (
    <>
      <BuildInPublicProvider orgId={orgId} productId={productId}>
        <Sidebar
          routes={routes}
          toggleSidenav={toggleSidenav}
          sidenavOpen={sidenavOpen}
          logo={{
            outterLink: "https://floumy.com",
            // innerLink: "/admin/okrs",
            imgSrc: require("assets/img/brand/logo.png"),
            imgAlt: "Floumy Logo"
          }}
        />
        <div className="main-content" ref={mainContentRef}>
          <AdminNavbar
            theme={getNavbarTheme()}
            toggleSidenav={toggleSidenav}
            sidenavOpen={sidenavOpen}
          />
          <Online>
            <Routes>
              {getRoutes(routes)}
              <Route
                path="*"
                element={<Navigate to="/admin/dashboard" replace />}
              />
            </Routes>
          </Online>
          <Offline>
            <div className="offline">
              <div className="container">
                <Modal
                  className="modal-dialog-centered"
                  contentClassName="bg-white border-0 rounded"
                  isOpen={true}
                  centered={true}
                  fade={false}
                >
                  <ModalHeader className="bg-warning text-white border-0 d-flex justify-content-center">
                    <h2 className="font-weight-bold text-white">You are offline</h2>
                  </ModalHeader>
                  <ModalBody className="p-4 text-center bg-warning">
                    <p className="mb-4 text-white">
                      You are currently offline. Please check your internet connection and try again.
                    </p>
                    <Button color="white" onClick={() => window.location.reload()}>
                      Retry
                    </Button>
                  </ModalBody>
                </Modal>
              </div>
            </div>
          </Offline>
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
      </BuildInPublicProvider>
    </>
  );
}

export default Admin;
