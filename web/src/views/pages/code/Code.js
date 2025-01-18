import React, { useEffect, useState } from 'react';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Card, CardBody, CardHeader, CardTitle, Col, Container, Row } from 'reactstrap';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import { getGithubUrl, getIsGithubConnected } from '../../../services/github/github';
import { useProjects } from '../../../contexts/ProjectsContext';

function Code() {
  const { orgId, currentProject } = useProjects();

  const [isLoadingIntegration, setIsLoadingIntegration] = useState(false);
  const [isGithubConnected, setIsGithubConnected] = useState(true);

  const [callbackUrl, setCallbackUrl] = useState('');

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
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Code;