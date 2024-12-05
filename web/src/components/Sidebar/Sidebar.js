import React from 'react';
// react library for routing
import { Link, NavLink as NavLinkRRD } from 'react-router-dom';
// nodejs library that concatenates classes
// nodejs library to set properties for components
// react library that creates nice scrollbar on windows devices
import PerfectScrollbar from 'react-perfect-scrollbar';
// reactstrap components
import {
  Badge,
  Col,
  Collapse, Nav,
  Navbar,
  NavbarBrand,
  NavItem,
  NavLink,
  Row,
  UncontrolledTooltip,
} from 'reactstrap';
import ShortcutIcon from '../Shortcuts/ShortcutIcon';
import { useBuildInPublic } from '../../contexts/BuidInPublicContext';
import { useProjects } from '../../contexts/ProjectsContext';
import NewProjectModal from './NewProjectModal';
import ProjectSelector from './ProjectSelector';

function Sidebar({ toggleSidenav, logo, rtlActive }) {
  const [newProjectModal, setNewProjectModal] = React.useState(false);
  const { settings: buildInPublicSettings } = useBuildInPublic();
  const isBuildInPublicEnabled = buildInPublicSettings.isBuildInPublicEnabled;
  const { currentProject, projects, orgId, loading } = useProjects();
  const { settings: bipSettings } = useBuildInPublic();

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
    toggleSidenav();
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
        {orgId && currentProject && (
          <>
            <div className="navbar-inner mb-2">
              <Collapse navbar isOpen={true}>
                <ProjectSelector
                  currentProject={currentProject}
                  projects={projects}
                  orgId={orgId}
                  onNewProject={toggleNewProjectModal}
                  showNewProject={true}
                />
                {isBuildInPublicEnabled &&
                  <a href={`/public/orgs/${orgId}/projects/${currentProject.id}/feed`} target="_blank"
                     className="nav-link text-green text-lg p-0 pb-4 no-visited no-active" rel="noreferrer">
                    <span className="nav-link-text">Build In Public<i className="fa fa-external-link px-2" /> </span>
                  </a>
                }
                <div className="mb-3">
                  <h6 className="navbar-heading p-0 text-muted">
                    <span className="docs-normal" style={{ whiteSpace: 'nowrap' }}>Feedback</span>
                  </h6>
                  <Nav navbar>
                    <NavItem>
                      <Row style={{ maxWidth: '100%', height: '47px' }}>
                        <Col xs={7}>
                          <NavLink
                            to={`/admin/orgs/${orgId}/projects/${currentProject.id}/issues`}
                            onClick={closeSidenav}
                            tag={NavLinkRRD}
                          >
                            <i className="fa fa-exclamation-triangle" />
                            <span className="nav-link-text">Issues</span>
                          </NavLink>
                        </Col>
                        <Col xs={3} style={{ padding: '0.675rem 1.5rem' }} className="text-right">
                          <div className={bipSettings.isIssuesPagePublic ? '' : 'd-none'}>
                            <UncontrolledTooltip target="feed-nav-item" placement="top">
                              This page is public and can be accessed by anyone.
                            </UncontrolledTooltip>
                            <Badge id="feed-nav-item"
                                   color="success" pill={true}
                                   style={{ cursor: 'default' }}>
                              PUBLIC
                            </Badge>
                          </div>
                        </Col>
                        <Col xs={2} className="text-right pr-2 pt-2">
                        </Col>
                      </Row>
                    </NavItem>
                    <NavItem>
                      <Row style={{ maxWidth: '100%', height: '47px' }}>
                        <Col xs={7}>
                          <NavLink
                            to={`/admin/orgs/${orgId}/projects/${currentProject.id}/feature-requests`}
                            onClick={closeSidenav}
                            tag={NavLinkRRD}
                          >

                            <i className="fa fa-pen-to-square" />
                            <span className="nav-link-text">Feature Requests</span>
                          </NavLink>
                        </Col>
                          <Col xs={3} style={{ padding: '0.675rem 1.5rem' }} className="text-right">
                            <div className={bipSettings.isFeatureRequestsPagePublic ? '' : 'd-none'}>
                              <UncontrolledTooltip target="feed-nav-item" placement="top">
                                This page is public and can be accessed by anyone.
                              </UncontrolledTooltip>
                              <Badge id="feed-nav-item"
                                     color="success" pill={true}
                                     style={{ cursor: 'default' }}>
                                PUBLIC
                              </Badge>
                            </div>
                          </Col><Col xs={2} className="text-right pr-2 pt-2">
                        </Col>
                      </Row>
                    </NavItem>
                  </Nav>
                </div>
                <h6 className="navbar-heading p-0 text-muted">
                  <span className="docs-normal" style={{ whiteSpace: 'nowrap' }}>Project</span>
                </h6>
                <Nav navbar>
                  <NavItem>
                    <Row style={{ maxWidth: '100%', height: '47px' }}>
                      <Col xs={7}>
                        <NavLink
                          to={`/admin/orgs/${orgId}/projects/${currentProject.id}/feed`}
                          onClick={closeSidenav}
                          tag={NavLinkRRD}
                        >

                          <i className="fa fa-newspaper" />
                          <span className="nav-link-text">Feed</span>
                        </NavLink>
                      </Col>
                      <Col xs={3} style={{ padding: '0.675rem 1.5rem' }} className="text-right">
                          <div className={bipSettings.isFeedPagePublic ? '' : 'd-none'}>
                            <UncontrolledTooltip target="feed-nav-item" placement="top">
                              This page is public and can be accessed by anyone.
                            </UncontrolledTooltip>
                            <Badge id="feed-nav-item"
                                   color="success" pill={true}
                                   style={{ cursor: 'default' }}>
                              PUBLIC
                            </Badge>
                          </div>
                        </Col>
                      <Col xs={2} className="text-right pr-2 pt-2">
                        <ShortcutIcon shortcutKey={1} />
                      </Col>
                    </Row>
                  </NavItem>
                  <NavItem>
                    <Row style={{ maxWidth: '100%', height: '47px' }}>
                      <Col xs={7}>
                        <NavLink
                          to={`/admin/orgs/${orgId}/projects/${currentProject.id}/okrs`}
                          onClick={closeSidenav}
                          tag={NavLinkRRD}
                        >

                          <i className="fa fa-bullseye" />
                          <span className="nav-link-text">Objectives</span>
                        </NavLink>
                      </Col>
                      <Col xs={3} style={{ padding: '0.675rem 1.5rem' }} className="text-right">
                          <div className={bipSettings.isObjectivesPagePublic ? '' : 'd-none'}>
                            <UncontrolledTooltip target="objectives-nav-item" placement="top">
                              This page is public and can be accessed by anyone.
                            </UncontrolledTooltip>
                            <Badge id="objectives-nav-item"
                                   color="success" pill={true}
                                   style={{ cursor: 'default' }}>
                              PUBLIC
                            </Badge>
                          </div>
                        </Col>
                      <Col xs={2} className="text-right pr-2 pt-2">
                        <ShortcutIcon shortcutKey={2} />
                      </Col>
                    </Row>
                  </NavItem>
                  <NavItem>
                    <Row style={{ maxWidth: '100%', height: '47px' }}>
                      <Col xs={7}>
                        <NavLink
                          to={`/admin/orgs/${orgId}/projects/${currentProject.id}/roadmap`}
                          onClick={closeSidenav}
                          tag={NavLinkRRD}
                        >

                          <i className="fa fa-road" />
                          <span className="nav-link-text">Initiatives Roadmap</span>
                        </NavLink>
                      </Col>
                      <Col xs={3} style={{ padding: '0.675rem 1.5rem' }} className="text-right">
                          <div className={bipSettings.isRoadmapPagePublic ? '' : 'd-none'}>
                            <UncontrolledTooltip target="roadmap-nav-item" placement="top">
                              This page is public and can be accessed by anyone.
                            </UncontrolledTooltip>
                            <Badge id="roadmap-nav-item"
                                   color="success" pill={true}
                                   style={{ cursor: 'default' }}>
                              PUBLIC
                            </Badge>
                          </div>
                        </Col>
                      <Col xs={2} className="text-right pr-2 pt-2">
                        <ShortcutIcon shortcutKey={3} />
                      </Col>
                    </Row>
                  </NavItem>
                  <NavItem>
                    <Row style={{ maxWidth: '100%', height: '47px' }}>
                      <Col xs={7}>
                        <NavLink
                          to={`/admin/orgs/${orgId}/projects/${currentProject.id}/iterations`}
                          onClick={closeSidenav}
                          tag={NavLinkRRD}
                        >

                          <i className="fa fa-refresh" />
                          <span className="nav-link-text">Sprints</span>
                        </NavLink>
                      </Col>
                      <Col xs={3} style={{ padding: '0.675rem 1.5rem' }} className="text-right">
                          <div className={bipSettings.isIterationsPagePublic ? '' : 'd-none'}>
                            <UncontrolledTooltip target="sprints-nav-item" placement="top">
                              This page is public and can be accessed by anyone.
                            </UncontrolledTooltip>
                            <Badge id="sprints-nav-item"
                                   color="success" pill={true}
                                   style={{ cursor: 'default' }}>
                              PUBLIC
                            </Badge>
                          </div>
                        </Col>
                      <Col xs={2} className="text-right pr-2 pt-2">
                        <ShortcutIcon shortcutKey={4} />
                      </Col>
                    </Row>
                  </NavItem>
                  <NavItem>
                    <Row style={{ maxWidth: '100%', height: '47px' }}>
                      <Col xs={7}>
                        <NavLink
                          to={`/admin/orgs/${orgId}/projects/${currentProject.id}/active-iteration`}
                          onClick={closeSidenav}
                          tag={NavLinkRRD}
                        >

                          <i className="fa fa-rocket" />
                          <span className="nav-link-text">Active Sprint</span>
                        </NavLink>
                      </Col>
                      <Col xs={3} style={{ padding: '0.675rem 1.5rem' }} className="text-right">
                          <div className={bipSettings.isActiveIterationsPagePublic ? '' : 'd-none'}>
                            <UncontrolledTooltip target="sprints-nav-item" placement="top" popperClassName="p-2">
                              This page is public and can be accessed by anyone.
                            </UncontrolledTooltip>
                            <Badge id="sprints-nav-item"
                                   color="success" pill={true}
                                   style={{ cursor: 'default' }}>
                              PUBLIC
                            </Badge>
                          </div>
                        </Col>
                      <Col xs={2} className="text-right pr-2 pt-2">
                        <ShortcutIcon shortcutKey={5} />
                      </Col>
                    </Row>
                  </NavItem>
                  <NavItem>
                    <Row style={{ maxWidth: '100%' }}>
                      <Col xs={10}>
                        <NavLink
                          to={`/admin/orgs/${orgId}/projects/${currentProject.id}/work-items`}
                          onClick={closeSidenav}
                          tag={NavLinkRRD}
                        >

                          <i className="fa fa-tasks" />
                          <span className="nav-link-text">All Work Items</span>
                        </NavLink>
                      </Col>
                      <Col xs={2} className="text-right pr-2 pt-2">
                        <ShortcutIcon shortcutKey={6} />
                      </Col>
                    </Row>
                  </NavItem>
                  <NavItem>
                    <Row style={{ maxWidth: '100%' }}>
                      <Col xs={10}>
                        <NavLink
                          to={`/admin/orgs/${orgId}/projects/${currentProject.id}/features`}
                          onClick={closeSidenav}
                          tag={NavLinkRRD}
                        >
                          <i className="fa fa-list-alt" />
                          <span className="nav-link-text">All Initiatives</span>
                        </NavLink>
                      </Col>
                      <Col xs={2} className="text-right pr-2 pt-2">
                        <ShortcutIcon shortcutKey={7} />
                      </Col>
                    </Row>
                  </NavItem>
                </Nav>
              </Collapse>
            </div>
            <div className="navbar-inner">
              <Collapse navbar isOpen={true}>
                <h6 className="navbar-heading p-0 text-muted">
                  <span className="docs-normal" style={{ whiteSpace: 'nowrap' }}>Settings</span>
                </h6>
                <Nav className="mb-md-3" navbar>
                  <NavItem>
                    <NavLink
                      to={`/admin/orgs/${orgId}/projects/${currentProject.id}/build-in-public`}
                      onClick={closeSidenav}
                      tag={NavLinkRRD}
                    >
                      <i className="fa fa-eye" />
                      <span className="nav-link-text">Build In Public</span>
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      to={`/admin/orgs/${orgId}/projects/${currentProject.id}/members`}
                      onClick={closeSidenav}
                      tag={NavLinkRRD}
                    >
                      <i className="fa fa-users" />
                      <span className="nav-link-text">Members</span>
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      to={`/admin/orgs/${orgId}/projects/${currentProject.id}/project`}
                      onClick={closeSidenav}
                      tag={NavLinkRRD}
                    >
                      <i className="fa fa-atom" />
                      <span className="nav-link-text">Project</span>
                    </NavLink>
                  </NavItem>
                </Nav>
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

export default Sidebar;
