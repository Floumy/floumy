import React, { useEffect, useState } from 'react';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Card, CardBody, CardHeader, CardTitle, Col, Container, Row } from 'reactstrap';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import { getGithubUrl, getIsGithubConnected, getRepos } from '../../../services/github/github';
import { useProjects } from '../../../contexts/ProjectsContext';
import Select2 from 'react-select2-wrapper';

function Code() {
  const { orgId, currentProject } = useProjects();

  const [isLoadingIntegration, setIsLoadingIntegration] = useState(false);
  const [isGithubConnected, setIsGithubConnected] = useState(true);

  const [callbackUrl, setCallbackUrl] = useState('');
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState('');

  useEffect(() => {
    if (!currentProject?.id || !orgId) return;

    setIsLoadingIntegration(true);

    getIsGithubConnected(orgId, currentProject.id)
      .then(response => {
        setIsGithubConnected(response.connected);
        
        if (!response.connected) {
          getGithubUrl(orgId, currentProject.id)
            .then(response => {
              setCallbackUrl(response);
            })
            .catch(() => {
              setCallbackUrl('');
            });
        }
        else {
          getRepos(orgId)
            .then(response => {
              setRepos(response);
            })
            .catch(() => {
              setRepos([]);
            });
        }

      })
      .catch(() => {
        setIsGithubConnected(false);
      })
      .finally(() => {
        setIsLoadingIntegration(false);
      });

    document.title = 'Floumy | Code';
  }, [currentProject?.id, orgId]);

  return (
    <>
      {isLoadingIntegration && <InfiniteLoadingBar />}
      <SimpleHeader />
      <Container className="mt--6" fluid id="OKRs">
        <Row>
          <Col>
            <Card className="mb-5">
              <CardHeader>
                <Row>
                  <Col md={12}>
                    <CardTitle tag="h2" className="mb-3">Code</CardTitle>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                {isLoadingIntegration &&
                  <Row>
                    <Col className="text-center">
                      <LoadingSpinnerBox />
                    </Col>
                  </Row>}
                {!isLoadingIntegration && !isGithubConnected &&
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
                {!isLoadingIntegration && repos.length > 0 &&
                  <Row>
                    <Col xl={4}>
                      <h4>Select a repository</h4>
                      <Select2
                        className="form-control"
                        value={selectedRepo}
                        defaultValue={repos.map(repo => repo.url)}
                        data={repos.map(repo => ({ id: repo.url, text: repo.full_name }))}
                        options={{
                          placeholder: 'Select a repository'
                        }}
                        onSelect={(e) => {
                          setSelectedRepo(e.target.value);
                        }}
                      ></Select2>
                      <button className="btn btn-primary my-3" type="button" onClick={() => {}}>Save</button>
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