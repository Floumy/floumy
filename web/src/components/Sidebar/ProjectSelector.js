import React from 'react';
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import { useProjects } from '../../contexts/ProjectsContext';
import { useNavigate } from 'react-router-dom';

function ProjectSelector({
                           currentProject,
                           projects,
                           orgId,
                           onNewProject,
                           showNewProject = true // Optional prop to hide "New Project" button in public view
                         }) {
  const { setCurrentProject } = useProjects();
  const navigate = useNavigate();

  function handleProjectClick(project) {
    setCurrentProject(project);
    navigate(`/admin/orgs/${orgId}/projects/${project.id}/dashboard`);
  }
  return (
    <UncontrolledDropdown group className="mb-4 text-left">
      <DropdownToggle caret
                      className="text-left overflow-hidden transparent background-none d-flex justify-content-between align-items-center"
                      style={{ borderColor: '#686868', backgroundColor: '#b3b0c6' }}>
        <span className="text-truncate" style={{ flexGrow: 1, marginRight: '8px' }}>
          {currentProject?.name}
        </span>
      </DropdownToggle>
      <DropdownMenu className="w-100 text-white mt-1 rounded-sm" style={{ backgroundColor: '#b3b0c6' }}>
        {projects
          .filter(project => project.id !== currentProject?.id)
          .map(project => (
            <DropdownItem
              key={project.id}
              onClick={() => handleProjectClick(project)}
              className="d-flex align-items-center"
              style={{
                backgroundColor: '#b3b0c6',
                '&:hover': {
                  backgroundColor: '#b3b0c6',
                },
              }}
              tag="button">
              <span className="text-truncate" style={{ flexGrow: 1 }}>
                {project.name}
              </span>
            </DropdownItem>
          ))}
        {showNewProject && projects.length > 1 && <DropdownItem divider className="" />}
        {showNewProject && (
          <DropdownItem
            className="text-xs"
            onClick={onNewProject}
            style={{
              backgroundColor: '#b3b0c6',
              '&:hover': {
                backgroundColor: '#b3b0c6',
              },
            }}>
            <span className="d-none d-md-inline">
              <i className="fas fa-plus text-xs mr-2" /> New Project
            </span>
          </DropdownItem>
        )}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
}

export default ProjectSelector;