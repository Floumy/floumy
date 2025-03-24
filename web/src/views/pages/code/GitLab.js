import React, { useEffect, useState } from 'react';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Container } from 'reactstrap';
import { useProjects } from '../../../contexts/ProjectsContext';
import { toast } from 'react-toastify';
import { getIsGitLabConnected } from '../../../services/gitlab/gitlab.service';

function GitLab() {
  const { orgId, currentProject } = useProjects();

  const [isLoading, setIsLoading] = useState(false);
  const [isGitLabConnected, setIsGitLabConnected] = useState(true);

  useEffect(() => {
    if (!currentProject?.id || !orgId) return;

    const fetchGitLabData = async () => {
      setIsLoading(true);
      try {
        const { connected, repo } = await getIsGitLabConnected(orgId, currentProject.id);
        setIsGitLabConnected(connected);
      } catch (error) {
        setIsGitLabConnected(false);
        toast.error('Failed to check GitLab connection');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGitLabData();
  }, [currentProject?.id, orgId]);
  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader />
      <Container className="mt--6" fluid id="OKRs">
        {isGitLabConnected && <>
          GiLab is connected
        </>}
      </Container>
    </>
  );
}

export default GitLab;