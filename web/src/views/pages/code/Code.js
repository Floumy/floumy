import React, { useEffect, useState } from 'react';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import { getIsGithubConnected } from '../../../services/github/github.service';
import { useProjects } from '../../../contexts/ProjectsContext';
import { toast } from 'react-toastify';
import GitHub from './GitHub';
import { getIsGitLabConnected } from '../../../services/gitlab/gitlab.service';
import GitLab from './GitLab';
import RepositorySelector from './RepositorySelector';

function Code() {
  const { orgId, currentProject } = useProjects();

  const [isLoading, setIsLoading] = useState(false);
  const [isGithubConnected, setIsGithubConnected] = useState(false);
  const [isGitlabConnected, setIsGitlabConnected] = useState(false);

  useEffect(() => {
    if (!currentProject?.id || !orgId) return;

    const fetchGithubData = async () => {
      setIsLoading(true);
      try {
        const { connected: githubConnected } = await getIsGithubConnected(orgId, currentProject.id);
        setIsGithubConnected(githubConnected);
        const { connected: gitlabConnected } = await getIsGitLabConnected(orgId, currentProject.id);
        setIsGitlabConnected(gitlabConnected);
      } catch (error) {
        setIsGithubConnected(false);
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
      {isGithubConnected && !isGitlabConnected && <GitHub />}
      {!isGithubConnected && isGitlabConnected && <GitLab />}
      {!isGithubConnected && !isGitlabConnected && <RepositorySelector />}
    </>
  );
}

export default Code;