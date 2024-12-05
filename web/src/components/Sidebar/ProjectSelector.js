import React from 'react';
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
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
    <UncontrolledDropdown group className="mb-4 text-left">
      <DropdownToggle caret
                      className="text-left overflow-hidden transparent background-none d-flex justify-content-between align-items-center"
                      style={{ borderColor: '#686868', backgroundColor: '#b3b0c6' }}>
        <span className="text-truncate" style={{ flexGrow: 1, marginRight: '8px' }}>
          {currentProject?.name}
        </span>
      </DropdownToggle>
      <DropdownMenu className="w-100 text-white mt-1 py-0 rounded-sm"
                    style={{ backgroundColor: '#b3b0c6', maxHeight: '300px', overflowY: 'auto' }}>
        {projects
          .map(project => (
            <DropdownItem
              key={project.id}
              onClick={() => handleProjectClick(project)}
              className="d-flex align-items-center py-2"
              style={{
                backgroundColor: '#b3b0c6',
                '&:hover': {
                  backgroundColor: '#b3b0c6',
                },
                borderBottom: '1px solid #939393',
              }}
              tag="button">
              <span className="text-truncate" style={{ flexGrow: 1 }}>
                {project.name}
              </span>
            </DropdownItem>
          ))}
        {showNewProject && (
          <DropdownItem
            className="text-xs py-3 font-italic"
            onClick={onNewProject}
            style={{
              backgroundColor: '#b3b0c6',
              '&:hover': {
                backgroundColor: '#b3b0c6',
              },
            }}>
            <span className="d-md-inline">
              <i className="fas fa-plus text-xs mr-2" /> New Project
            </span>
          </DropdownItem>
        )}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
}

export default ProjectSelector;