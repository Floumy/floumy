import { Modal } from 'reactstrap';
import React from 'react';
import { useProjects } from '../../contexts/ProjectsContext';
import { createProject } from '../../services/projects/projects.service';
import { useNavigate } from 'react-router-dom';

export default function NewProjectModal({ newProjectModal, toggleNewProjectModal }) {
  const [projectName, setProjectName] = React.useState("");
  const { orgId, setCurrentProject } = useProjects();
  const navigate = useNavigate();

  const handleCreateProject = async (projectName) => {
    try {
      const project = await createProject(orgId, projectName);
      setCurrentProject(project);
      navigate(`/admin/orgs/${orgId}/projects/${project.id}/dashboard`);
      toggleNewProjectModal();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Modal
      isOpen={newProjectModal}
      toggle={toggleNewProjectModal}
      className="modal-dialog-centered"
      fade={false}
    >
      <div className="modal-header">
        <h5 className="modal-title">Create New Project</h5>
        <button
          aria-label="Close"
          className="close"
          onClick={toggleNewProjectModal}
          type="button"
        >
          <span aria-hidden={true}>×</span>
        </button>
      </div>
      <div className="modal-body">
        <form>
          <div className="form-group">
            <label>Project Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter project name"
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
        </form>
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={toggleNewProjectModal}
        >
          Close
        </button>
        <button type="button" className="btn btn-primary" onClick={() => handleCreateProject(projectName)}>
          Create Project
        </button>
      </div>
    </Modal>
  );
}