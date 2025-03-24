import React, { useEffect, useState } from 'react';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import { getIsGithubConnected } from '../../../services/github/github.service';
import { useProjects } from '../../../contexts/ProjectsContext';
import { toast } from 'react-toastify';
import GitHub from './GitHub';

function Code() {
  const { orgId, currentProject } = useProjects();

  const [isLoading, setIsLoading] = useState(false);
  const [isGithubConnected, setIsGithubConnected] = useState(true);

  useEffect(() => {
    if (!currentProject?.id || !orgId) return;

    const fetchGithubData = async () => {
      setIsLoading(true);
      try {
        const { connected } = await getIsGithubConnected(orgId, currentProject.id);
        setIsGithubConnected(connected);
      } catch (error) {
        setIsGithubConnected(false);
        toast.error('Failed to check Github connection');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGithubData();
  }, [currentProject?.id, orgId]);

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      {isGithubConnected && <GitHub />}
    </>
  );
}

export default Code;