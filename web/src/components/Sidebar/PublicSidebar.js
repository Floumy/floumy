import React from 'react';
// react library for routing
import { Link, NavLink as NavLinkRRD } from 'react-router-dom';
// nodejs library that concatenates classes
// nodejs library to set properties for components
// react library that creates nice scrollbar on windows devices
import PerfectScrollbar from 'react-perfect-scrollbar';
// reactstrap components
import {
  Col,
  Collapse,
  Nav,
  Navbar,
  NavbarBrand,
  NavItem,
  NavLink,
  Row,
} from 'reactstrap';

function PublicSidebar({
  toggleSidenav,
  sidenavOpen,
  logo,
  rtlActive,
  orgId,
  project,
  buildingInPublicSettings,
}) {
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

  function isFeedbackEnabled() {
    return (
      buildingInPublicSettings.isIssuesPagePublic ||
      buildingInPublicSettings.isFeatureRequestsPagePublic
    );
  }

  function isProjectEnabled() {
    return (
      buildingInPublicSettings.isFeedPagePublic ||
      buildingInPublicSettings.isObjectivesPagePublic ||
      buildingInPublicSettings.isRoadmapPagePublic ||
      buildingInPublicSettings.isSprintsPagePublic ||
      buildingInPublicSettings.isActiveSprintsPagePublic
    );
  }

  const scrollBarInner = (
    <div className="scrollbar-inner">
      <div className="sidenav-header d-flex align-items-center text-white">
        {logo ? (
          <NavbarBrand {...navbarBrandProps}>
            <img
              alt={logo.imgAlt}
              className="navbar-brand-img"
              style={{ borderRadius: '5px' }}
              src={logo.imgSrc}
            />
            <span style={{ marginLeft: '15px' }} className="text-white text-sm">
              Floumy
            </span>
          </NavbarBrand>
        ) : null}
      </div>
      <div className="navbar-inner mb-2">
        <Collapse navbar isOpen={true}>
          {project.name && (
            <h5 className="navbar-project-name text-light text-xl pb-3 text-break">
              {project.name}
            </h5>
          )}
          <div className="mb-3">
            {isFeedbackEnabled() && (
              <h6 className="navbar-heading p-0 text-muted">
                <span className="docs-normal" style={{ whiteSpace: 'nowrap' }}>
                  Feedback
                </span>
              </h6>
            )}
            <Nav navbar>
              {buildingInPublicSettings.isIssuesPagePublic && (
                <NavItem className="d-none d-md-block">
                  <NavLink
                    to={`/public/orgs/${orgId}/projects/${project.id}/issues`}
                    onClick={closeSidenav}
                    tag={NavLinkRRD}
                  >
                    <i className="fa fa-exclamation-triangle" />
                    <span className="nav-link-text">Issues</span>
                  </NavLink>
                </NavItem>
              )}
              {buildingInPublicSettings.isFeatureRequestsPagePublic && (
                <NavItem>
                  <Row style={{ maxWidth: '100%' }}>
                    <Col xs={7}>
                      <NavLink
                        to={`/public/orgs/${orgId}/projects/${project.id}/feature-requests`}
                        onClick={closeSidenav}
                        tag={NavLinkRRD}
                      >
                        <i className="fa fa-pen-to-square" />
                        <span className="nav-link-text">Feature Requests</span>
                      </NavLink>
                    </Col>
                    {sidenavOpen && (
                      <Col
                        xs={3}
                        style={{ padding: '0.675rem 1.5rem' }}
                        className="text-right"
                      ></Col>
                    )}
                    {sidenavOpen && (
                      <Col xs={2} className="text-right pr-2 pt-2"></Col>
                    )}
                  </Row>
                </NavItem>
              )}
            </Nav>
          </div>
          {isProjectEnabled() && (
            <h6 className="navbar-heading p-0 text-muted">
              <span className="docs-normal" style={{ whiteSpace: 'nowrap' }}>
                Project
              </span>
            </h6>
          )}
          <Nav className="mb-md-3" navbar>
            {buildingInPublicSettings.isFeedPagePublic && (
              <NavItem>
                <NavLink
                  to={`/public/orgs/${orgId}/projects/${project.id}/feed`}
                  onClick={closeSidenav}
                  tag={NavLinkRRD}
                >
                  <i className="fa fa-newspaper" />
                  <span className="nav-link-text">Feed</span>
                </NavLink>
              </NavItem>
            )}
            {buildingInPublicSettings.isObjectivesPagePublic && (
              <NavItem>
                <NavLink
                  to={`/public/orgs/${orgId}/projects/${project.id}/objectives`}
                  onClick={closeSidenav}
                  tag={NavLinkRRD}
                >
                  <i className="fa fa-bullseye" />
                  <span className="nav-link-text">Objectives</span>
                </NavLink>
              </NavItem>
            )}
            {buildingInPublicSettings.isRoadmapPagePublic && (
              <NavItem>
                <NavLink
                  to={`/public/orgs/${orgId}/projects/${project.id}/roadmap`}
                  onClick={closeSidenav}
                  tag={NavLinkRRD}
                >
                  <i className="fa fa-road" />
                  <span className="nav-link-text">Initiatives Roadmap</span>
                </NavLink>
              </NavItem>
            )}
            {buildingInPublicSettings.isSprintsPagePublic && (
              <NavItem>
                <NavLink
                  to={`/public/orgs/${orgId}/projects/${project.id}/sprints`}
                  onClick={closeSidenav}
                  tag={NavLinkRRD}
                >
                  <i className="fa fa-refresh" />
                  <span className="nav-link-text">Sprints</span>
                </NavLink>
              </NavItem>
            )}
            {buildingInPublicSettings.isActiveSprintsPagePublic && (
              <NavItem>
                <NavLink
                  to={`/public/orgs/${orgId}/projects/${project.id}/active-sprint`}
                  onClick={closeSidenav}
                  tag={NavLinkRRD}
                >
                  <i className="fa fa-rocket" />
                  <span className="nav-link-text">Active Sprint</span>
                </NavLink>
              </NavItem>
            )}
          </Nav>
        </Collapse>
      </div>
    </div>
  );
  return (
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
  );
}

export default PublicSidebar;
