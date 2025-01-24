import React, { useEffect, useState } from 'react';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Badge, Card, CardBody, CardHeader, CardTitle, Col, Container, Row } from 'reactstrap';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import {
  getGithubUrl,
  getIsGithubConnected,
  getGithubRepos,
  updateProjectGithubRepo,
} from '../../../services/github/github.service';
import { useProjects } from '../../../contexts/ProjectsContext';
import Select2 from 'react-select2-wrapper';
import { toast } from 'react-toastify';

function Code() {
  const { orgId, currentProject } = useProjects();

  const [isLoading, setIsLoading] = useState(false);
  const [isGithubConnected, setIsGithubConnected] = useState(false);

  const [callbackUrl, setCallbackUrl] = useState('');
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [repo, setRepo] = useState(null);

  useEffect(() => {
    if (!currentProject?.id || !orgId) return;

    const fetchGithubData = async () => {
      setIsLoading(true);
      try {
        const { connected, repo } = await getIsGithubConnected(orgId, currentProject.id);
        setIsGithubConnected(connected);

        if (!connected) {
          try {
            const url = await getGithubUrl(orgId, currentProject.id);
            setCallbackUrl(url);
          } catch (error) {
            console.error('Failed to get Github URL:', error);
            setCallbackUrl('');
          }
        } else if (!repo?.id) {
          try {
            const repositories = await getGithubRepos(orgId);
            setRepos(repositories);
          } catch (error) {
            console.error('Failed to fetch repositories:', error);
            setRepos([]);
          }
        } else {
          setRepo(repo);
        }
      } catch (error) {
        console.error('Failed to check Github connection:', error);
        setIsGithubConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGithubData();
  }, [currentProject?.id, orgId]);

  const handleRepoUpdate = async () => {
    try {
      const projectRepo = await updateProjectGithubRepo(orgId, currentProject.id, selectedRepo);
      setRepo(projectRepo);
      toast.success('Project repo updated');
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader />
      <Container className="mt--6" fluid id="OKRs">
        <Row>
          <Col>
            <Card className="mb-5">
              <CardHeader>
                <Row>
                  <Col md={12}>
                    <CardTitle tag="h2" className="mb-3">Code  {repo &&
                       <a className="btn-link text-blue" href={repo.url} target="_blank" rel="noreferrer">
                          | {repo.name}
                      </a>}
                    </CardTitle>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                {isLoading &&
                  <Row>
                    <Col className="text-center">
                      <LoadingSpinnerBox />
                    </Col>
                  </Row>}
                {!isLoading && !isGithubConnected &&
                  <Row>
                    <Col>
                      <div>
                        <button className="btn btn-primary" type="button" onClick={() => {
                          window.location.href = callbackUrl;
                        }}>
                          Connect GitHub
                        </button>
                      </div>
                    </Col>
                  </Row>}
                {!isLoading && !repo && repos.length > 0 &&
                  <Row>
                    <Col xl={4}>
                      <h4>Select a repository</h4>
                      <Select2
                        className="form-control"
                        value={selectedRepo}
                        data={repos.map(repo => ({ id: repo.id, text: repo.full_name }))}
                        options={{
                          placeholder: 'Select a repository',
                        }}
                        onSelect={(e) => {
                          setSelectedRepo(e.target.value);
                        }}
                      ></Select2>
                      <button className="btn btn-primary my-3" type="button" onClick={handleRepoUpdate}>Save</button>
                    </Col>
                  </Row>}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Code;