import React from 'react';
// nodejs library that concatenates classes
import classnames from 'classnames';
// nodejs library to set properties for components
// reactstrap components
import { Collapse, Container, Nav, Navbar, NavItem } from 'reactstrap';
import CurrentUserNav from './CurrentUserNav';

function PublicNavbar({ sidenavOpen, toggleSidenav }) {
  return (
    <>
      <Navbar
        className={classnames(
          'navbar-top navbar-expand border-bottom navbar-light',
        )}
      >
        <Container fluid>
          <Collapse navbar isOpen={true}>
            <Nav className="align-items-center ml-md-auto" navbar>
              <NavItem className="d-xl-none">
                <div
                  className={classnames('pr-3 sidenav-toggler', {
                    active: sidenavOpen,
                  })}
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
