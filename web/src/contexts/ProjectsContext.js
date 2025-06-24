import React, { createContext, useContext, useEffect, useState } from 'react';
import { listProjects } from '../services/projects/projects.service';

const ProjectsContext = createContext({});

export function ProjectsProvider({ children, orgId, projectId }) {
  const [currentProject, setCurrentProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const projects = await listProjects(orgId);
        if (projects) {
          setProjects(projects);
          setCurrentProject(projects.find((p) => p.id === projectId) || null);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orgId) {
      fetchProjects();
    }
  }, [orgId, projectId]);

  const value = {
    orgId,
    currentProjectId: projectId,
    currentProject,
    projects,
    loading,
    setCurrentProject,
    setProjects,
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
}
