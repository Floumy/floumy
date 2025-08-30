import React from 'react';
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from 'reactstrap';
import { useProjects } from '../../contexts/ProjectsContext';
import { useNavigate } from 'react-router-dom';

function ProjectSelector({
  currentProject,
  projects,
  orgId,
  onNewProject,
  showNewProject = true, // Optional prop to hide "New Project" button in public view
}) {
  const { setCurrentProject } = useProjects();
  const navigate = useNavigate();

  function handleProjectClick(project) {
    setCurrentProject(project);
    navigate(`/admin/orgs/${orgId}/projects/${project.id}/dashboard`);
  }

  return (
    <UncontrolledDropdown group className="mb-4 text-left w-100">
      <DropdownToggle
        caret
        className="btn btn-outline-light w-100 d-flex justify-content-between align-items-center shadow-none py-2 px-3 text-left"
      >
        <span className="text-truncate mr-2" style={{ flexGrow: 1 }}>
          {currentProject?.name}
        </span>
      </DropdownToggle>
      <DropdownMenu
        className="w-100 mt-1 rounded-sm sidebar-project-menu"
        style={{
          maxHeight: '420px',
          overflowY: 'auto',
        }}
      >
        {projects.map((project) => (
          <DropdownItem
            key={project.id}
            onClick={() => handleProjectClick(project)}
            className="d-flex align-items-center py-2 text-light py-3 border-bottom border-light"
            tag="button"
            title={project.name}
          >
            <span className="text-truncate" style={{ flexGrow: 1 }}>
              {project.name}
            </span>
            {currentProject?.id === project.id && (
              <i
                className="fa fa-check text-success"
                aria-hidden="true"
                style={{ margin: '0' }}
              />
            )}
          </DropdownItem>
        ))}
        {showNewProject && (
          <>
            <div className="dropdown-divider" />
            <DropdownItem
              className="py-3 text-light"
              onClick={onNewProject}
              tag="button"
            >
              <i className="fas fa-plus mr-2" /> New Project
            </DropdownItem>
          </>
        )}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
}

export default ProjectSelector;
