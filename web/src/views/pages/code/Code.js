import React, { useEffect, useState } from 'react';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Alert, Card, CardBody, CardHeader, CardTitle, Col, Container, Row, Table } from 'reactstrap';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import {
  getGithubRepos,
  getGithubUrl,
  getIsGithubConnected,
  getPullRequests,
  updateProjectGithubRepo,
} from '../../../services/github/github.service';
import { useProjects } from '../../../contexts/ProjectsContext';
import Select2 from 'react-select2-wrapper';
import { toast } from 'react-toastify';
import { formatDate, workItemTypeIcon } from '../../../services/utils/utils';
import { Link } from 'react-router-dom';
import UpdateWarning from '../components/UpdateWarning';

function Code() {
  const { orgId, currentProject } = useProjects();

  const [isLoading, setIsLoading] = useState(false);
  const [isGithubConnected, setIsGithubConnected] = useState(true);

  const [callbackUrl, setCallbackUrl] = useState('');
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [repo, setRepo] = useState(null);
  const [prs, setPrs] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updateWarning, setUpdateWarning] = useState(false);

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
            toast.error('Failed to connect to Github');
            setCallbackUrl('');
          }
        } else if (!repo?.id) {
          try {
            const repositories = await getGithubRepos(orgId);
            setRepos(repositories);
          } catch (error) {
            toast.error('Failed to fetch repositories');
            setRepos([]);
          }
        } else {
          setRepo(repo);
          try {
            const prs = await getPullRequests(orgId, currentProject.id);
            setPrs(prs);
          } catch (error) {
            toast.error('Failed to fetch pull requests');
            setPrs(null);
          }
        }
      } catch (error) {
        setIsGithubConnected(false);
        toast.error('Failed to check Github connection');
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
      setUpdateWarning(false);
      const prs = await getPullRequests(orgId, currentProject.id);
      setPrs(prs);
      setIsEditing(false);
      toast.success('Project repository updated');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const editRepo = async () => {
    setIsEditing(!isEditing);
    try {
      const repositories = await getGithubRepos(orgId);
      setRepos(repositories);
    } catch (error) {
      toast.error('Failed to fetch repositories');
      setRepos([]);
    }
  };

  const onRepoUpdateSave = async () => {
    try {
      if (isEditing) {
        setUpdateWarning(true);
        return;
      }

      const projectRepo = await updateProjectGithubRepo(orgId, currentProject.id, selectedRepo);
      setRepo(projectRepo);
      toast.success('Project repository updated');
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader />
      <Container className="mt--6" fluid id="OKRs">
        <UpdateWarning
          isOpen={updateWarning}
          toggle={() => setUpdateWarning(!updateWarning)}
          warningMessage={"It will take a few minutes for the pull requests on your repository to be processed."}
          entity={"project's repository"}
          onUpdate={async () => await handleRepoUpdate()} />
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
                      <i className="fa fa-edit mr-2" onClick={editRepo} />
                    </> : <>Code</>}
                    </CardTitle>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                {!isLoading && prs && !isEditing && <Row>
                  <Col>
                    <Alert className="mb-4 bg-lighter text-gray-dark border-0">
                      <i className="fa fa-info-circle mr-2" />
                      <span>Your pull requests get processed when the work item reference is in the title or branch name.</span>
                    </Alert>
                  </Col>
                </Row>}
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
                {!isLoading && ((!repo && repos.length > 0) || isEditing) &&
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
                      <button className="btn btn-primary my-3" type="button" onClick={onRepoUpdateSave} disabled={!selectedRepo}>Save</button>
                      {isEditing && <button className="btn btn-white my-3" type="button" onClick={() => setIsEditing(false)}>Cancel</button>}
                    </Col>
                  </Row>}
                {!isLoading && prs && !isEditing && (
                  <>
                    <Row className="mb-5">
                      <Col>
                        <h3>
                          <i className="fa fa-code-pull-request mr-2 text-success" />
                          Open For Less Than 1 Day
                        </h3>
                        <div className="table-responsive">
                          <Table className="align-items-center table-flush border-bottom no-select"
                                 style={{ minWidth: '700px' }}>
                            <thead className="thead">
                            <tr>
                              <th scope="col" width={'45%'}>Title</th>
                              <th scope="col" width={'45%'}>Work Item</th>
                              <th scope="col" width={'10%'}>Created at</th>
                            </tr>
                            </thead>
                            <tbody className="list">
                            {prs.openForOneDay.length === 0 && <tr>
                              <td colSpan={3} className="text-center">No Pull Requests</td>
                            </tr>}
                            {prs.openForOneDay.map((pr, index) => (
                              <tr key={index}>
                                <td>{pr.title}</td>
                                <td>
                                  <Link
                                    to={`/admin/orgs/${orgId}/projects/${currentProject.id}/work-item/edit/${pr.workItem.id}`}
                                    className="text-gray">
                                    {workItemTypeIcon(pr.workItem.type)}{pr.workItem.title}
                                  </Link>
                                </td>
                                <td>{pr.createdAt}</td>
                              </tr>
                            ))}
                            </tbody>
                          </Table>
                        </div>
                      </Col>
                    </Row>
                    <Row className="mb-5">
                      <Col>
                        <h3>
                          <i className="fa fa-code-pull-request mr-2 text-warning" />
                          Open For Less Than 3 Days
                        </h3>
                        <div className="table-responsive">
                          <Table className="align-items-center table-flush border-bottom no-select"
                                 style={{ minWidth: '700px' }}>
                            <thead className="thead">
                            <tr>
                              <th scope="col" width={'45%'}>Title</th>
                              <th scope="col" width={'45%'}>Work Item</th>
                              <th scope="col" width={'10%'}>Created at</th>
                            </tr>
                            </thead>
                            <tbody className="list">
                            {prs.openForThreeDays.length === 0 && <tr>
                              <td colSpan={3} className="text-center">No Pull Requests</td>
                            </tr>}
                            {prs.openForThreeDays.map((pr, index) => (
                              <tr key={index}>
                                <td>
                                  <a href={pr.url} target="_blank" rel="noreferrer">
                                    <span className="mr-2">{pr.title}</span>
                                    <i className="fa fa-external-link-alt mr-1" />
                                  </a>
                                </td>
                                <td>
                                  <Link
                                    to={`/admin/orgs/${orgId}/projects/${currentProject.id}/work-item/edit/${pr.workItem.id}`}
                                    className="text-gray">
                                    {workItemTypeIcon(pr.workItem.type)}{pr.workItem.title}
                                  </Link>
                                </td>
                                <td>{formatDate(pr.createdAt)}</td>
                              </tr>
                            ))}
                            </tbody>
                          </Table>
                        </div>
                      </Col>
                    </Row>
                    <Row className="mb-5">
                      <Col>
                        <h3 className>
                          <i className="fa fa-code-pull-request mr-2 text-danger" />
                          Open For More Than 3 Days
                        </h3>
                        <div className="table-responsive">
                          <Table className="align-items-center table-flush border-bottom no-select"
                                 style={{ minWidth: '700px' }}>
                            <thead className="thead">
                            <tr>
                              <th scope="col" width={'45%'}>Title</th>
                              <th scope="col" width={'45%'}>Work Item</th>
                              <th scope="col" width={'10%'}>Created at</th>
                            </tr>
                            </thead>
                            <tbody className="list">
                            {prs.openForMoreThanThreeDays.length === 0 && <tr>
                              <td colSpan={3} className="text-center">No Pull Requests</td>
                            </tr>}
                            {prs.openForMoreThanThreeDays.map((pr, index) => (
                              <tr key={index}>
                                <td>
                                  <a href={pr.url} target="_blank" rel="noreferrer">
                                    <span className="mr-2">{pr.title}</span>
                                    <i className="fa fa-external-link-alt mr-1" />
                                  </a>
                                </td>
                                <td>
                                  <Link
                                    to={`/admin/orgs/${orgId}/projects/${currentProject.id}/work-item/edit/${pr.workItem.id}`}
                                    className="text-gray">
                                    {workItemTypeIcon(pr.workItem.type)}{pr.workItem.title}
                                  </Link>
                                </td>
                                <td>{formatDate(pr.createdAt)}</td>
                              </tr>
                            ))}
                            </tbody>
                          </Table>
                        </div>
                      </Col>
                    </Row>
                    <Row className="mb-5">
                      <Col>
                        <h3 className="">
                          <i className="fa fa-code-pull-request mr-2 text-primary" />
                          Closed in the past 7 days
                        </h3>
                        <div className="table-responsive">
                          <Table className="align-items-center table-flush border-bottom no-select"
                                 style={{ minWidth: '700px' }}>
                            <thead className="thead">
                            <tr>
                              <th scope="col" width={'45%'}>Title</th>
                              <th scope="col" width={'45%'}>Work Item</th>
                              <th scope="col" width={'10%'}>Created at</th>
                            </tr>
                            </thead>
                            <tbody className="list">
                            {prs.closedInThePastSevenDays.length === 0 && <tr>
                              <td colSpan={3} className="text-center">No Pull Requests</td>
                            </tr>}
                            {prs.closedInThePastSevenDays.map((pr, index) => (
                              <tr key={index}>
                                <td>
                                  <a href={pr.url} target="_blank" rel="noreferrer">
                                    <span className="mr-2">{pr.title}</span>
                                    <i className="fa fa-external-link-alt mr-1" />
                                  </a>
                                </td>
                                <td>
                                  <Link
                                    to={`/admin/orgs/${orgId}/projects/${currentProject.id}/work-item/edit/${pr.workItem.id}`}
                                    className="text-gray">
                                    {workItemTypeIcon(pr.workItem.type)}{pr.workItem.title}
                                  </Link>
                                </td>
                                <td>{formatDate(pr.createdAt)}</td>
                              </tr>
                            ))}
                            </tbody>
                          </Table>
                        </div>
                      </Col>
                    </Row>
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Code;