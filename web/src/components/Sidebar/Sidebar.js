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
  Collapse,
  Nav,
  Navbar,
  NavbarBrand,
  NavItem,
  NavLink,
  Row,
  UncontrolledTooltip,
} from 'reactstrap';
import { useBuildInPublic } from '../../contexts/BuidInPublicContext';
import { useProjects } from '../../contexts/ProjectsContext';
import NewProjectModal from './NewProjectModal';
import ProjectSelector from './ProjectSelector';
import { useOrg } from '../../contexts/OrgContext';
import { KeyShortcut, ShortcutsModal } from '../Shortcuts';

function Sidebar({ toggleSidenav, logo, rtlActive }) {
  const [newProjectModal, setNewProjectModal] = React.useState(false);
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);
  const toggleShortcutsModal = () => setShortcutsOpen((s) => !s);
  const {
    currentProject,
    projects,
    orgId,
    loading: loadingProjects,
  } = useProjects();
  const { settings: bipSettings } = useBuildInPublic();
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

  const shortcutsItems = [
    { description: 'Go to OKRs', keys: ['1'], id: 'okrs' },
    { description: 'Go to Roadmap', keys: ['2'], id: 'roadmap' },
    { description: 'Go to Active Sprint', keys: ['3'], id: 'active-sprint' },
    { description: 'Go to Sprints', keys: ['4'], id: 'sprints' },
    { description: 'Go to Pages', keys: ['5'], id: 'pages' },
    { description: 'Go to Code', keys: ['6'], id: 'code' },
    { description: 'Go to Issues', keys: ['7'], id: 'issues' },
    {
      description: 'Go to Feature Requests',
      keys: ['8'],
      id: 'feature-requests',
    },
    {
      description: 'Create a Work Item',
      keys: ['w'],
      id: 'create-work-item',
    },
    {
      description: 'Create an Initiative',
      keys: ['i'],
      id: 'create-initiative',
    },
    {
      description: 'Create an OKR',
      keys: ['o'],
      id: 'create-initiative',
    },
    {
      description: 'Create a Sprint',
      keys: ['s'],
      id: 'create-initiative',
    },
    {
      description: 'Create a Roadmap Milestone',
      keys: ['m'],
      id: 'create-initiative',
    },
  ];

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
          <div className="navbar-inner">
            {currentOrg.name && (
              <h5 className="navbar-project-name text-light text-xl pb-0 text-break">
                <Link
                  to={`/orgs/${orgId}/objectives`}
                  className="p-0 d-inline-flex align-items-center text-decoration-none"
                  onClick={closeSidenav}
                >
                  <i
                    className="fa fa-arrow-left text-muted mr-2"
                    aria-hidden="true"
                  ></i>
                  <span className="text-white" style={{ whiteSpace: 'nowrap' }}>
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
              <h6 className="navbar-heading p-0 text-muted">
                <span className="docs-normal" style={{ whiteSpace: 'nowrap' }}>
                  Project
                </span>
              </h6>
              <Nav navbar className="mb-3">
                <NavItem>
                  <Row style={{ maxWidth: '100%', height: '47px' }}>
                    <Col xs={7}>
                      <NavLink
                        to={`/admin/orgs/${orgId}/projects/${currentProject.id}/okrs`}
                        onClick={closeSidenav}
                        tag={NavLinkRRD}
                      >
                        <i className="fa fa-bullseye" />
                        <span className="nav-link-text">OKRs</span>
                      </NavLink>
                    </Col>
                    <Col
                      xs={3}
                      style={{ padding: '0.675rem 1.5rem' }}
                      className="text-left"
                    >
                      <div
                        className={
                          bipSettings.isObjectivesPagePublic ? '' : 'd-none'
                        }
                      >
                        <Link
                          to={`/public/orgs/${orgId}/projects/${currentProject.id}/objectives`}
                          target="_blank"
                          role="button"
                        >
                          <UncontrolledTooltip
                            target="objectives-nav-item"
                            placement="top"
                          >
                            This page is public and can be accessed by anyone.
                          </UncontrolledTooltip>
                          <Badge
                            id="objectives-nav-item"
                            color="success"
                            pill={true}
                          >
                            PUBLIC
                          </Badge>
                        </Link>
                      </div>
                    </Col>
                    <Col xs={2} className="text-right pr-2 pt-2">
                      <span
                        id="shortcut-okrs"
                        role="button"
                        onClick={toggleShortcutsModal}
                      >
                        <KeyShortcut keys={['1']} />
                      </span>
                      <UncontrolledTooltip
                        target="shortcut-okrs"
                        placement="top"
                      >
                        Press 1 to go to OKRs. Click to see all shortcuts.
                      </UncontrolledTooltip>
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
                        <span className="nav-link-text">Roadmap</span>
                      </NavLink>
                    </Col>
                    <Col
                      xs={3}
                      style={{ padding: '0.675rem 1.5rem' }}
                      className="text-left"
                    >
                      <div
                        className={
                          bipSettings.isRoadmapPagePublic ? '' : 'd-none'
                        }
                      >
                        <Link
                          to={`/public/orgs/${orgId}/projects/${currentProject.id}/roadmap`}
                          target="_blank"
                          role="button"
                        >
                          <UncontrolledTooltip
                            target="roadmap-nav-item"
                            placement="top"
                          >
                            This page is public and can be accessed by anyone.
                          </UncontrolledTooltip>
                          <Badge
                            id="roadmap-nav-item"
                            color="success"
                            pill={true}
                          >
                            PUBLIC
                          </Badge>
                        </Link>
                      </div>
                    </Col>
                    <Col xs={2} className="text-right pr-2 pt-2">
                      <span
                        id="shortcut-roadmap"
                        role="button"
                        onClick={toggleShortcutsModal}
                      >
                        <KeyShortcut keys={['2']} />
                      </span>
                      <UncontrolledTooltip
                        target="shortcut-roadmap"
                        placement="top"
                      >
                        Press 2 to go to Roadmap. Click to see all shortcuts.
                      </UncontrolledTooltip>
                    </Col>
                  </Row>
                </NavItem>
                <NavItem>
                  <Row style={{ maxWidth: '100%', height: '47px' }}>
                    <Col xs={7}>
                      <NavLink
                        to={`/admin/orgs/${orgId}/projects/${currentProject.id}/active-sprint`}
                        onClick={closeSidenav}
                        tag={NavLinkRRD}
                      >
                        <i className="fa fa-rocket" />
                        <span className="nav-link-text">Active Sprint</span>
                      </NavLink>
                    </Col>
                    <Col
                      xs={3}
                      style={{ padding: '0.675rem 1.5rem' }}
                      className="text-left"
                    >
                      <div
                        className={
                          bipSettings.isActiveSprintsPagePublic ? '' : 'd-none'
                        }
                      >
                        <Link
                          to={`/public/orgs/${orgId}/projects/${currentProject.id}/active-sprint`}
                          target="_blank"
                          role="button"
                        >
                          <UncontrolledTooltip
                            target="sprints-nav-item"
                            placement="top"
                            popperClassName="p-2"
                          >
                            This page is public and can be accessed by anyone.
                          </UncontrolledTooltip>
                          <Badge
                            id="sprints-nav-item"
                            color="success"
                            pill={true}
                          >
                            PUBLIC
                          </Badge>
                        </Link>
                      </div>
                    </Col>
                    <Col xs={2} className="text-right pr-2 pt-2">
                      <span
                        id="shortcut-active-sprint"
                        role="button"
                        onClick={toggleShortcutsModal}
                      >
                        <KeyShortcut keys={['3']} />
                      </span>
                      <UncontrolledTooltip
                        target="shortcut-active-sprint"
                        placement="top"
                      >
                        Press 3 to go to Active Sprint. Click to see all
                        shortcuts.
                      </UncontrolledTooltip>
                    </Col>
                  </Row>
                </NavItem>
                <NavItem>
                  <Row style={{ maxWidth: '100%', height: '47px' }}>
                    <Col xs={7}>
                      <NavLink
                        to={`/admin/orgs/${orgId}/projects/${currentProject.id}/sprints`}
                        onClick={closeSidenav}
                        tag={NavLinkRRD}
                      >
                        <i className="fa fa-refresh" />
                        <span className="nav-link-text">Sprints</span>
                      </NavLink>
                    </Col>
                    <Col
                      xs={3}
                      style={{ padding: '0.675rem 1.5rem' }}
                      className="text-left"
                    >
                      <div
                        className={
                          bipSettings.isSprintsPagePublic ? '' : 'd-none'
                        }
                      >
                        <Link
                          to={`/public/orgs/${orgId}/projects/${currentProject.id}/sprints`}
                          target="_blank"
                          role="button"
                        >
                          <UncontrolledTooltip
                            target="sprints-nav-item"
                            placement="top"
                          >
                            This page is public and can be accessed by anyone.
                          </UncontrolledTooltip>
                          <Badge
                            id="sprints-nav-item"
                            color="success"
                            pill={true}
                          >
                            PUBLIC
                          </Badge>
                        </Link>
                      </div>
                    </Col>
                    <Col xs={2} className="text-right pr-2 pt-2">
                      <span
                        id="shortcut-sprints"
                        role="button"
                        onClick={toggleShortcutsModal}
                      >
                        <KeyShortcut keys={['4']} />
                      </span>
                      <UncontrolledTooltip
                        target="shortcut-sprints"
                        placement="top"
                      >
                        Press 4 to go to Sprints. Click to see all shortcuts.
                      </UncontrolledTooltip>
                    </Col>
                  </Row>
                </NavItem>
                {/*<NavItem>*/}
                {/*  <Row style={{ maxWidth: '100%' }}>*/}
                {/*    <Col xs={10}>*/}
                {/*      <NavLink*/}
                {/*        to={`/admin/orgs/${orgId}/projects/${currentProject.id}/work-items`}*/}
                {/*        onClick={closeSidenav}*/}
                {/*        tag={NavLinkRRD}*/}
                {/*      >*/}
                {/*        <i className="fa fa-tasks" />*/}
                {/*        <span className="nav-link-text">All Work Items</span>*/}
                {/*      </NavLink>*/}
                {/*    </Col>*/}
                {/*    <Col xs={2} className="text-right pr-2 pt-2">*/}
                {/*      <ShortcutIcon shortcutKey={6} />*/}
                {/*    </Col>*/}
                {/*  </Row>*/}
                {/*</NavItem>*/}
                {/*<NavItem>*/}
                {/*  <Row style={{ maxWidth: '100%' }}>*/}
                {/*    <Col xs={10}>*/}
                {/*      <NavLink*/}
                {/*        to={`/admin/orgs/${orgId}/projects/${currentProject.id}/initiatives`}*/}
                {/*        onClick={closeSidenav}*/}
                {/*        tag={NavLinkRRD}*/}
                {/*      >*/}
                {/*        <i className="fa fa-list-alt" />*/}
                {/*        <span className="nav-link-text">All Initiatives</span>*/}
                {/*      </NavLink>*/}
                {/*    </Col>*/}
                {/*    <Col xs={2} className="text-right pr-2 pt-2">*/}
                {/*      <ShortcutIcon shortcutKey={7} />*/}
                {/*    </Col>*/}
                {/*  </Row>*/}
                {/*</NavItem>*/}
                <NavItem>
                  <Row style={{ maxWidth: '100%', height: '47px' }}>
                    <Col xs={7}>
                      <NavLink
                        to={`/admin/orgs/${orgId}/projects/${currentProject.id}/pages`}
                        onClick={closeSidenav}
                        tag={NavLinkRRD}
                      >
                        <i className="fa fa-file" />
                        <span className="nav-link-text">Pages</span>
                      </NavLink>
                    </Col>
                    <Col
                      xs={3}
                      style={{ padding: '0.675rem 1.5rem' }}
                      className="text-left"
                    >
                      <div>
                        <Badge color="warning" pill={true}>
                          BETA
                        </Badge>
                      </div>
                    </Col>
                    <Col xs={2} className="text-right pr-2 pt-2">
                      <span
                        id="shortcut-pages"
                        role="button"
                        onClick={toggleShortcutsModal}
                      >
                        <KeyShortcut keys={['5']} />
                      </span>
                      <UncontrolledTooltip
                        target="shortcut-pages"
                        placement="top"
                      >
                        Press 5 to go to Pages. Click to see all shortcuts.
                      </UncontrolledTooltip>
                    </Col>
                  </Row>
                </NavItem>
                <NavItem>
                  <Row style={{ maxWidth: '100%', height: '47px' }}>
                    <Col xs={10}>
                      <NavLink
                        to={`/admin/orgs/${orgId}/projects/${currentProject.id}/code`}
                        onClick={closeSidenav}
                        tag={NavLinkRRD}
                      >
                        <i className="fa fa-code-pull-request" />
                        <span className="nav-link-text">Code</span>
                      </NavLink>
                    </Col>
                    <Col xs={2} className="text-right pr-2 pt-2">
                      <span
                        id="shortcut-code"
                        role="button"
                        onClick={toggleShortcutsModal}
                      >
                        <KeyShortcut keys={['6']} />
                      </span>
                      <UncontrolledTooltip
                        target="shortcut-code"
                        placement="top"
                      >
                        Press 6 to go to Code. Click to see all shortcuts.
                      </UncontrolledTooltip>
                    </Col>
                  </Row>
                </NavItem>
              </Nav>
              <div className="mb-3">
                <h6 className="navbar-heading p-0 text-muted">
                  <span
                    className="docs-normal"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Feedback
                  </span>
                </h6>
                <Nav navbar className="mb-3">
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
                      <Col
                        xs={3}
                        style={{ padding: '0.675rem 1.5rem' }}
                        className="text-left"
                      >
                        <div
                          className={
                            bipSettings.isIssuesPagePublic ? '' : 'd-none'
                          }
                        >
                          <UncontrolledTooltip
                            target="feed-nav-item"
                            placement="top"
                          >
                            This page is public and can be accessed by anyone.
                          </UncontrolledTooltip>
                          <Link
                            to={`/public/orgs/${orgId}/projects/${currentProject.id}/issues`}
                            target="_blank"
                            role="button"
                          >
                            <Badge
                              id="feed-nav-item"
                              color="success"
                              pill={true}
                            >
                              PUBLIC
                            </Badge>
                          </Link>
                        </div>
                      </Col>
                      <Col xs={2} className="text-right pr-2 pt-2">
                        <span
                          id="shortcut-issues"
                          role="button"
                          onClick={toggleShortcutsModal}
                        >
                          <KeyShortcut keys={['7']} />
                        </span>
                        <UncontrolledTooltip
                          target="shortcut-issues"
                          placement="top"
                        >
                          Press 7 to go to Issues. Click to see all shortcuts.
                        </UncontrolledTooltip>
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
                          <span className="nav-link-text">
                            Feature Requests
                          </span>
                        </NavLink>
                      </Col>
                      <Col
                        xs={3}
                        style={{ padding: '0.675rem 1.5rem' }}
                        className="text-left"
                      >
                        <div
                          className={
                            bipSettings.isFeatureRequestsPagePublic
                              ? ''
                              : 'd-none'
                          }
                        >
                          <UncontrolledTooltip
                            target="feed-nav-item"
                            placement="top"
                          >
                            This page is public and can be accessed by anyone.
                          </UncontrolledTooltip>
                          <Link
                            to={`/public/orgs/${orgId}/projects/${currentProject.id}/feature-requests`}
                            target="_blank"
                            role="button"
                          >
                            <Badge
                              id="feed-nav-item"
                              color="success"
                              pill={true}
                            >
                              PUBLIC
                            </Badge>
                          </Link>
                        </div>
                      </Col>
                      <Col xs={2} className="text-right pr-2 pt-2">
                        <span
                          id="shortcut-feature-requests"
                          role="button"
                          onClick={toggleShortcutsModal}
                        >
                          <KeyShortcut keys={['8']} />
                        </span>
                        <UncontrolledTooltip
                          target="shortcut-feature-requests"
                          placement="top"
                        >
                          Press 8 to go to Feature Requests. Click to see all
                          shortcuts.
                        </UncontrolledTooltip>
                      </Col>
                    </Row>
                  </NavItem>
                </Nav>
                <h6 className="navbar-heading p-0 text-muted">
                  <span
                    className="docs-normal"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Admin
                  </span>
                </h6>
                <Nav navbar className="mb-3">
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
                      to={`/admin/orgs/${orgId}/projects/${currentProject.id}/feed`}
                      onClick={closeSidenav}
                      tag={NavLinkRRD}
                    >
                      <i className="fa fa-newspaper" />
                      <span className="nav-link-text">Audit Log</span>
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      to={`/admin/orgs/${orgId}/projects/${currentProject.id}/project`}
                      onClick={closeSidenav}
                      tag={NavLinkRRD}
                    >
                      <i className="fa fa-atom" />
                      <span className="nav-link-text">Project Settings</span>
                    </NavLink>
                  </NavItem>
                </Nav>
                <Nav navbar className="mb-3">
                  <NavItem>
                    <Row style={{ maxWidth: '100%', height: '47px' }}>
                      <Col xs={12}>
                        <NavLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleShortcutsModal();
                          }}
                        >
                          <i className="fa fa-keyboard" />
                          <span className="nav-link-text">Shortcuts</span>
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
  );
  return (
    <>
      <NewProjectModal
        isOpen={newProjectModal}
        toggleModal={toggleNewProjectModal}
      />
      <ShortcutsModal
        isOpen={shortcutsOpen}
        onClose={toggleShortcutsModal}
        items={shortcutsItems}
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
