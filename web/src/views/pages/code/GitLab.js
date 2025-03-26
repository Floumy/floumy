import React from 'react';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Card, CardBody, CardHeader, CardTitle, Col, Container, Row, UncontrolledTooltip } from 'reactstrap';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import UpdateWarning from '../components/UpdateWarning';

function GitLab({repo}) {

  const [isLoading, setIsLoading] = React.useState(false);
  const [disconnectWarning, setDisconnectWarning] = React.useState(false);

  const handleRepoDisconnect = async () => {}
  const editRepo = async () => {}

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader />
      <Container className="mt--6" fluid id="OKRs">
        <UpdateWarning
          isOpen={disconnectWarning}
          toggle={() => setDisconnectWarning(!disconnectWarning)}
          warningMessage={"Are you sure you want to disconnect from GitHub?"}
          entity={"connection to GitHub"}
          onUpdate={async () => await handleRepoDisconnect()} />
        <Row>
          <Col>
            <Card className="mb-5">
              <CardHeader>
                <Row>
                  <Col md={12}>
                    <CardTitle tag="h2" className="mb-3"> {repo ? <>
                      Pull Requests {" "}
                      <a className="btn-link text-blue mr-2" href={repo.url} target="_blank" rel="noreferrer">
                        | {repo.name}
                      </a>
                      <i className="fa fa-edit mr-2" style={{ cursor: 'pointer' }} onClick={editRepo} />
                      <UncontrolledTooltip target="disconnect-from-github" placement="top">
                        Disconnect from GitHub
                      </UncontrolledTooltip>
                      <i className="fa fa-xmark mr-2" style={{ cursor: 'pointer' }} id="disconnect-from-github" onClick={() => setDisconnectWarning(true)} />
                    </> : <span className="mr-2">Code</span>}
                    </CardTitle>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>

              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default GitLab;