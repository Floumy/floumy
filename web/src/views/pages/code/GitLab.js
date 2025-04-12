import React, { useEffect } from 'react';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Alert, Card, CardBody, CardHeader, CardTitle, Col, Container, Row, UncontrolledTooltip } from 'reactstrap';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import { useNavigate, useParams } from 'react-router-dom';
import {
  disconnectProject,
  getIsGitLabConnected,
  listMergeRequests,
  listProjects,
  setProject,
  setToken,
} from '../../../services/gitlab/gitlab.service';
import Select2 from 'react-select2-wrapper';
import PRs from '../../../components/Code/PRs';
import { toast } from 'react-toastify';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import DeleteWarning from '../components/DeleteWarning';

function GitLab() {
  const { orgId, projectId } = useParams();
  const [isLoading, setIsLoading] = React.useState(false);
  const [disconnectWarning, setDisconnectWarning] = React.useState(false);
  const [accessToken, setAccessToken] = React.useState('');
  const [isGitLabConnected, setIsGitLabConnected] = React.useState(false);
  const [gitlabProject, setGitlabProject] = React.useState(null);
  const [mergeRequests, setMergeRequests] = React.useState(null);
  const [projects, setProjects] = React.useState([]);
  const [gitlabProjectId, setGitlabProjectId] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const navigate = useNavigate();

  const saveToken = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await setToken(orgId, projectId, accessToken);
      setIsGitLabConnected(true);

      const gitLabProjects = await listProjects(orgId, projectId);
      setProjects(gitLabProjects);
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      toast.error('Failed to save token');
    }
  };

  const saveGitlabProject = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setIsEditing(false);
    try {
      await setProject(orgId, projectId, gitlabProjectId);
      setIsGitLabConnected(true);
      const mergeRequests = await listMergeRequests(orgId, projectId);
      setMergeRequests(mergeRequests);

      const { connected: isConnected, gitlabProject } = await getIsGitLabConnected(orgId, projectId);
      setIsGitLabConnected(isConnected);
      setGitlabProject(gitlabProject);

      setProjects([]);
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      toast.error('Failed to save project');
    }
  };

  useEffect(() => {
    async function fetchIsConnected() {
      setIsLoading(true);
      try {
        const { connected: isConnected, gitlabProject } = await getIsGitLabConnected(orgId, projectId);
        setIsGitLabConnected(isConnected);
        setGitlabProject(gitlabProject);

        if (isConnected && gitlabProject?.id) {
          const mergeRequests = await listMergeRequests(orgId, projectId);
          setMergeRequests(mergeRequests);
        }

        if (isConnected && !gitlabProject?.id) {
          const projects = await listProjects(orgId, projectId);
          setProjects(projects);
        }

      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchIsConnected();
  }, [orgId, projectId]);

  const handleGitlabProjectDisconnect = async () => {
    try {
      await disconnectProject(orgId, projectId);
      navigate(`/admin/orgs/${orgId}/projects/${projectId}/code`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const editGitlabProject = async () => {
    try {
      setIsLoading(true);
      const projects = await listProjects(orgId, projectId);
      const { gitlabProject } = await getIsGitLabConnected(orgId, projectId);
      setProjects(projects);
      setGitlabProjectId(gitlabProject.id);
      setIsEditing(true);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEditGitlabProject = async () => {
    setProjects([]);
    setIsEditing(false);
  };

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader />
      <Container className="mt--6" fluid id="OKRs">
        <DeleteWarning
          isOpen={disconnectWarning}
          toggle={() => setDisconnectWarning(!disconnectWarning)}
          warningMessage={'Are you sure you want to disconnect from GitLab?'}
          entity={'connection to GitLab'}
          onDelete={async () => await handleGitlabProjectDisconnect()} />
        <Row>
          <Col>
            <Card className="mb-5">
              <CardHeader>
                <Row>
                  <Col md={12}>
                    <CardTitle tag="h2" className="mb-3"> {mergeRequests && gitlabProject ? <>
                      Merge Requests {' '}
                      <a className="btn-link text-blue mr-2" href={gitlabProject.url} target="_blank" rel="noreferrer">
                        | {gitlabProject.name}
                      </a>
                      <i className="fa fa-edit mr-2" style={{ cursor: 'pointer' }} onClick={editGitlabProject} />
                      <UncontrolledTooltip target="disconnect-from-github" placement="top">
                        Disconnect from GitLab
                      </UncontrolledTooltip>
                      <i className="fa fa-xmark mr-2" style={{ cursor: 'pointer' }} id="disconnect-from-github"
                         onClick={() => setDisconnectWarning(true)} />
                    </> : <span className="mr-2">GitLab Integration</span>}
                    </CardTitle>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                {isLoading && <LoadingSpinnerBox />}
                {!isLoading && !isGitLabConnected &&
                  <form onSubmit={saveToken}>
                    <div className="form-group">
                      <Alert variant="warning" color="warning" className="mb-3">
                        <i className="fa fa-exclamation-triangle mr-2" />
                        <span>The access token must have the <b>API</b> scope and <b>Maintainer</b> role.</span>
                      </Alert>
                      <label htmlFor="access-token">Access Token</label>
                      <input className="form-control" id="access-token" type="password" value={accessToken}
                             onChange={(e) => setAccessToken(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary">Save</button>
                  </form>
                }
                {((!isLoading && isGitLabConnected && projects.length > 0) || isEditing) && (
                  <div className="mt-3">
                    <form onSubmit={saveGitlabProject}>
                      <div className="form-group">
                        <Select2
                          className="form-control"
                          data={projects.map(project => ({ id: project.id, text: project.name }))}
                          options={{
                            placeholder: 'Select a project',
                          }}
                          value={gitlabProjectId}
                          onSelect={(e) => {
                            setGitlabProjectId(e.target.value);
                          }}
                        ></Select2>
                      </div>
                      <button type="submit" className="btn btn-primary">Save</button>
                      <button type="button" className="btn btn-secondary" onClick={cancelEditGitlabProject}>
                        Cancel
                      </button>
                    </form>
                  </div>
                )}
                {!isLoading && isGitLabConnected && mergeRequests && !isEditing &&
                  <PRs entity="merge requests" prs={mergeRequests} orgId={orgId} projectId={projectId} />}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default GitLab;