import React from 'react';
// nodejs library that concatenates classes
import classnames from 'classnames';
// nodejs library to set properties for components
// reactstrap components
import { Button, Collapse, Container, Nav, Navbar, NavItem } from 'reactstrap';
import CurrentUserNav from './CurrentUserNav';

function AdminNavbar({ sidenavOpen, toggleSidenav, aiChatOpen, toggleAiChat }) {
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
              <NavItem>
                <Button
                  className="btn-icon-only rounded-circle"
                  style={{
                    color: '#8a2be2',
                    fontSize: '14px',
                    display: window.innerWidth > 2000 ? 'none' : 'block',
                  }}
                  onClick={toggleAiChat}
                  title="AI Assistant"
                >
                  <i className="fas fa-magic-wand-sparkles" />
                </Button>
              </NavItem>
            </Nav>
            <CurrentUserNav />
          </Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default AdminNavbar;
