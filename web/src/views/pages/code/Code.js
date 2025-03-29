import React, { useEffect, useState } from 'react';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import { getIsGithubConnected } from '../../../services/github/github.service';
import { useProjects } from '../../../contexts/ProjectsContext';
import { toast } from 'react-toastify';
import { getIsGitLabConnected } from '../../../services/gitlab/gitlab.service';
import RepositorySelector from './RepositorySelector';
import { useNavigate } from 'react-router-dom';

function Code() {
  const { orgId, currentProject } = useProjects();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentProject?.id || !orgId) return;

    const fetchGithubData = async () => {
      setIsLoading(true);
      try {
        const { connected: githubConnected } = await getIsGithubConnected(orgId, currentProject.id);
        // Redirect to GitHub if connected
        if (githubConnected) {
          navigate(`/admin/orgs/${orgId}/projects/${currentProject.id}/code/github`);
          return;
        }
        const { connected: gitlabConnected } = await getIsGitLabConnected(orgId, currentProject.id);
        // Redirect to GitLab if connected
        if (gitlabConnected) {
          navigate(`/admin/orgs/${orgId}/projects/${currentProject.id}/code/gitlab`);
          return;
        }
      } catch (error) {
        toast.error('Failed to check code connections');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGithubData();
  }, [currentProject?.id, orgId]);

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      {!isLoading && <RepositorySelector />}
    </>
  );
}

export default Code;