import React from 'react';
// react library for routing
import { Link, NavLink as NavLinkRRD } from 'react-router-dom';
// nodejs library that concatenates classes
// nodejs library to set properties for components
// react library that creates nice scrollbar on windows devices
import PerfectScrollbar from 'react-perfect-scrollbar';
// reactstrap components
import { Col, Collapse, Nav, Navbar, NavbarBrand, NavItem, NavLink, Row } from 'reactstrap';
import NewProjectModal from './NewProjectModal';
import { useOrg } from '../../contexts/OrgContext';

function OrgSidebar({ toggleSidenav, logo, rtlActive }) {
  const [newProjectModal, setNewProjectModal] = React.useState(false);
  const { loading, orgId, currentOrg } = useOrg();

  // makes the sidenav normal on hover (actually when mouse enters on it)
  const onMouseEnterSidenav = () => {
    if (!document.body.classList.contains('g-sidenav-pinned')) {
      document.body.classList.add('g-sidenav-show');
    }
  };
  // makes the sidenav mini on hover (actually when mouse leaves from it)
  const onMouseLeaveSidenav = () => {
    if (!document.body.classList.contains('g-sidenav-pinned')) {
      document.body.classList.remove('g-sidenav-show');
    }
  };

  // this is used on mobile devices, when a user navigates
  // the sidebar will autoclose
  const closeSidenav = () => {
    if (window.innerWidth < 1200) {
      toggleSidenav();
    }
  };

  let navbarBrandProps;
  if (logo && logo.innerLink) {
    navbarBrandProps = {
      to: logo.innerLink,
      tag: Link,
    };
  } else if (logo && logo.outterLink) {
    navbarBrandProps = {
      href: logo.outterLink,
      target: '_blank',
    };
  }

  const toggleNewProjectModal = () => {
    setNewProjectModal(!newProjectModal);
  };

  const scrollBarInner = (
      <div className="scrollbar-inner">
        <div className="sidenav-header d-flex align-items-center text-white">
          {!loading && logo ? (
            <NavbarBrand {...navbarBrandProps}>
              <img
                alt={logo.imgAlt}
                className="navbar-brand-img"
                src={logo.imgSrc}
                style={{ borderRadius: '5px' }}
              />
              <span style={{ marginLeft: '15px' }} className="text-white text-sm">Floumy</span>
            </NavbarBrand>
          ) : null}
        </div>
        {orgId && currentOrg && (
          <>
            <div className="navbar-inner mb-2">
              <h2 className="py-2">
                <Link to={`/orgs/${orgId}`}>
                      <span className="text-muted" style={{ whiteSpace: 'nowrap' }}>
                        Org Dashboard
                      </span>
                </Link>
              </h2>
              <Collapse navbar isOpen={true}>
                <div className="mb-3">
                  <Nav navbar>
                    <NavItem>
                      <Row style={{ maxWidth: '100%', height: '47px' }}>
                        <Col xs={12}>
                          <NavLink
                            to={`/orgs/${orgId}/projects`}
                            onClick={closeSidenav}
                            tag={NavLinkRRD}
                          >
                            <i className="fa fa-briefcase" />
                            <span className="nav-link-text">Projects</span>
                          </NavLink>
                        </Col>
                      </Row>
                      <Row style={{ maxWidth: '100%', height: '47px' }}>
                        <Col xs={12}>
                          <NavLink
                            to={`/orgs/${orgId}/members`}
                            onClick={closeSidenav}
                            tag={NavLinkRRD}
                          >
                            <i className="fa fa-users" />
                            <span className="nav-link-text">Members</span>
                          </NavLink>
                        </Col>
                      </Row>
                    </NavItem>
                  </Nav>
                </div>
              </Collapse>
            </div>
          </>
        )}
      </div>
    )
  ;

  return (
    <>
      <NewProjectModal isOpen={newProjectModal} toggleModal={toggleNewProjectModal} />
      <Navbar
        className={
          'sidenav navbar-vertical navbar-expand-xs navbar-dark bg-dark ' +
          (rtlActive ? '' : 'fixed-left')
        }
        onMouseEnter={onMouseEnterSidenav}
        onMouseLeave={onMouseLeaveSidenav}
      >
        {navigator.platform.indexOf('Win') > -1 ? (
          <PerfectScrollbar>{scrollBarInner}</PerfectScrollbar>
        ) : (
          scrollBarInner
        )}
      </Navbar>
    </>
  );
}

export default OrgSidebar;
