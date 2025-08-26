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
import { useProjects } from '../../contexts/ProjectsContext';
import NewProjectModal from './NewProjectModal';
import ProjectSelector from './ProjectSelector';
import { useOrg } from '../../contexts/OrgContext';

function Sidebar({ toggleSidenav, logo, rtlActive }) {
  const [newProjectModal, setNewProjectModal] = React.useState(false);
  const {
    currentProject,
    projects,
    orgId,
    loading: loadingProjects,
  } = useProjects();
  const { currentOrg, loadingOrg } = useOrg();

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
        {!loadingProjects && !loadingOrg && logo ? (
          <NavbarBrand {...navbarBrandProps}>
            <img
              alt={logo.imgAlt}
              className="navbar-brand-img"
              src={logo.imgSrc}
              style={{ borderRadius: '5px' }}
            />
            <span style={{ marginLeft: '15px' }} className="text-white text-sm">
              Floumy
            </span>
          </NavbarBrand>
        ) : null}
      </div>
      {currentOrg && currentProject && (
        <>
          <div className="navbar-inner mb-2">
            {currentOrg.name && (
              <h5 className="navbar-project-name text-light text-xl pb-0 mb-0 text-break">
                <Link to={`/orgs/${orgId}/objectives`} className="p-0">
                  <span className="text-muted" style={{ whiteSpace: 'nowrap' }}>
                    {currentOrg.name}
                  </span>
                </Link>
              </h5>
            )}
            <Collapse navbar isOpen={true}>
              <ProjectSelector
                currentProject={currentProject}
                projects={projects}
                orgId={orgId}
                onNewProject={toggleNewProjectModal}
                showNewProject={true}
              />
              <Nav navbar>
                <NavItem>
                  <Row style={{ maxWidth: '100%', height: '47px' }}>
                    <Col xs={12}>
                      <NavLink
                        to={`/admin/orgs/${orgId}/projects/${currentProject.id}/okrs`}
                        onClick={closeSidenav}
                        tag={NavLinkRRD}
                      >
                        <i className="fa fa-bullseye" />
                        <span className="nav-link-text">OKRs</span>
                      </NavLink>
                    </Col>
                  </Row>
                </NavItem>
                <NavItem>
                  <Row style={{ maxWidth: '100%', height: '47px' }}>
                    <Col xs={12}>
                      <NavLink
                        to={`/admin/orgs/${orgId}/projects/${currentProject.id}/roadmap`}
                        onClick={closeSidenav}
                        tag={NavLinkRRD}
                      >
                        <i className="fa fa-road" />
                        <span className="nav-link-text">Roadmap</span>
                      </NavLink>
                    </Col>
                  </Row>
                </NavItem>
                <NavItem>
                  <Row style={{ maxWidth: '100%', height: '47px' }}>
                    <Col xs={12}>
                      <NavLink
                        to={`/admin/orgs/${orgId}/projects/${currentProject.id}/active-sprint`}
                        onClick={closeSidenav}
                        tag={NavLinkRRD}
                      >
                        <i className="fa fa-rocket" />
                        <span className="nav-link-text">Delivery</span>
                      </NavLink>
                    </Col>
                  </Row>
                </NavItem>
                <NavItem>
                  <Row style={{ maxWidth: '100%', height: '47px' }}>
                    <Col xs={12}>
                      <NavLink
                        to={`/admin/orgs/${orgId}/projects/${currentProject.id}/sprints`}
                        onClick={closeSidenav}
                        tag={NavLinkRRD}
                      >
                        <i className="fa fa-refresh" />
                        <span className="nav-link-text">Backlog</span>
                      </NavLink>
                    </Col>
                  </Row>
                </NavItem>
              </Nav>
            </Collapse>
          </div>
        </>
      )}
    </div>
  );
  return (
    <>
      <NewProjectModal
        isOpen={newProjectModal}
        toggleModal={toggleNewProjectModal}
      />
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

export default Sidebar;
