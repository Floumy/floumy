import React from 'react';
// nodejs library that concatenates classes
import classnames from 'classnames';
// nodejs library to set properties for components
// reactstrap components
import { Button, Collapse, Container, Nav, Navbar, NavItem } from 'reactstrap';
import CurrentUserNav from './CurrentUserNav';
import { FEATURES, useFeatureFlags } from '../../hooks/useFeatureFlags';
import { useOrg } from '../../contexts/OrgContext';

function AdminNavbar({ sidenavOpen, toggleSidenav, aiChatOpen, toggleAiChat }) {
  const { orgId } = useOrg();
  const { isFeatureEnabled } = useFeatureFlags();
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
              {isFeatureEnabled(FEATURES.AI_CHAT_ASSISTANT, orgId) && (
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
              )}
            </Nav>
            <CurrentUserNav />
          </Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default AdminNavbar;
