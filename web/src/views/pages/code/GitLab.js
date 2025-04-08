import React, { useEffect } from 'react';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Card, CardBody, CardHeader, CardTitle, Col, Container, Row, UncontrolledTooltip } from 'reactstrap';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import UpdateWarning from '../components/UpdateWarning';
import { useParams } from 'react-router-dom';
import { getIsGitLabConnected, listMergeRequests } from '../../../services/gitlab/gitlab.service';

function GitLab({repo}) {
  const { orgId, projectId } = useParams();
  const [isLoading, setIsLoading] = React.useState(false);
  const [disconnectWarning, setDisconnectWarning] = React.useState(false);
  const [accessToken, setAccessToken] = React.useState('');
  const [isGitLabConnected, setIsGitLabConnected] = React.useState(false);
  const [mergeRequests, setMergeRequests] = React.useState({
    openForOneDay: [],
    openForThreeDays: [],
    openForMoreThanThreeDays: [],
    closedInThePastSevenDays: [],
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(accessToken);
  }

  useEffect(() => {
    async function fetchIsConnected() {
      setIsLoading(true);
      try {
        const { connected: isConnected, repo } = await getIsGitLabConnected(orgId, projectId);
        setIsGitLabConnected(isConnected);

        if (isConnected && repo) {
          const mergeRequests = await listMergeRequests(orgId, projectId);
          setMergeRequests(mergeRequests);
        }

      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchIsConnected();
  }, [orgId, projectId]);

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
                {!isLoading && !isGitLabConnected &&
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="access-token">Access Token</label>
                    <input className="form-control" id="access-token" type="password" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} />
                  </div>
                  <button type="submit" className="btn btn-primary">Save</button>
                </form>
                }
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default GitLab;