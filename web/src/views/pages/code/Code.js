import React, { useEffect, useState } from 'react';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Card, CardBody, CardHeader, CardTitle, Col, Container, Row } from 'reactstrap';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import { getGithubUrl } from '../../../services/github/github';
import { useProjects } from '../../../contexts/ProjectsContext';

function Code() {
  const { orgId, currentProject } = useProjects();
  const [isLoadingIntegration, setIsLoadingIntegration] = useState(false);

  const [callbackUrl, setCallbackUrl] = useState("");

  useEffect(() => {
    document.title = "Floumy | Code";
    getGithubUrl(orgId, currentProject.id).then(response => {
      setCallbackUrl(response);
    });
  }, [currentProject.id, orgId]);

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
                {!isLoadingIntegration &&
                  <Row>
                    <Col>
                      <div>
                        <button className="btn btn-success" type="button" onClick={() => {
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