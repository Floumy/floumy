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
import React from "react";
// nodejs library that concatenates classes
import classnames from "classnames";
// nodejs library to set properties for components
// reactstrap components
import { Collapse, Container, Nav, Navbar, NavItem } from "reactstrap";
import CurrentUserNav from "./CurrentUserNav";

function PublicNavbar({ theme, sidenavOpen, toggleSidenav }) {
  return (
    <>
      <Navbar
        className={classnames(
          "navbar-top navbar-expand border-bottom",
          { "navbar-dark bg-gray": theme === "dark" },
          { "navbar-light bg-secondary": theme === "light" }
        )}
      >
        <Container fluid>
          <Collapse navbar isOpen={true}>

            <Nav className="align-items-center ml-md-auto" navbar>
              <NavItem className="d-xl-none">
                <div
                  className={classnames(
                    "pr-3 sidenav-toggler",
                    { active: sidenavOpen },
                    { "sidenav-toggler-dark": theme === "dark" }
                  )}
                  onClick={toggleSidenav}
                  role="button"
                  onKeyDown={toggleSidenav}
                >
                  <div className="sidenav-toggler-inner">
                    <i className="sidenav-toggler-line" />
                    <i className="sidenav-toggler-line" />
                    <i className="sidenav-toggler-line" />
                  </div>
                </div>
              </NavItem>
            </Nav>
            <CurrentUserNav />
          </Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default PublicNavbar;
