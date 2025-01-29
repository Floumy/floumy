import React, { useEffect, useState } from 'react';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Alert, Card, CardBody, CardHeader, CardTitle, Col, Container, Row, Table } from 'reactstrap';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import {
  getGithubRepos,
  getGithubUrl,
  getIsGithubConnected,
  getOpenPullRequests,
  updateProjectGithubRepo,
} from '../../../services/github/github.service';
import { useProjects } from '../../../contexts/ProjectsContext';
import Select2 from 'react-select2-wrapper';
import { toast } from 'react-toastify';
import { formatDate, workItemTypeIcon } from '../../../services/utils/utils';
import { Link } from 'react-router-dom';

function Code() {
  const { orgId, currentProject } = useProjects();

  const [isLoading, setIsLoading] = useState(false);
  const [isGithubConnected, setIsGithubConnected] = useState(true);

  const [callbackUrl, setCallbackUrl] = useState('');
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [repo, setRepo] = useState(null);
  const [prs, setPrs] = useState(null);

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
          try {
            const prs = await getOpenPullRequests(orgId, currentProject.id);
            setPrs(prs);
          } catch (error) {
            toast.error('Failed to fetch pull requests');
            setPrs(null);
          }
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
                    <CardTitle tag="h2" className="mb-3">Code {repo &&
                      <a className="btn-link text-blue" href={repo.url} target="_blank" rel="noreferrer">
                        | {repo.name}
                      </a>}
                    </CardTitle>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                {!isLoading && isGithubConnected && <Row>
                  <Col>
                  <Alert color="info" className="mb-4">
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
                {!isLoading && prs && (
                  <>
                    <Row className="mb-5">
                      <Col>
                        <h3>
                          <i className="fa fa-code-pull-request mr-2 text-success" />
                          Pull Requests Open For 1 Day
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
                              <td colSpan={3} className="text-center">No Pull Requests Open for 1 Day</td>
                            </tr>}
                            {prs.openForOneDay.map((pr, index) => (
                              <tr key={index}>
                                <td>{pr.title}</td>
                                <td>
                                  <Link to={`/admin/orgs/${orgId}/projects/${currentProject.id}/work-item/edit/${pr.workItem.id}`}
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
                          Pull Requests Open for 3 Days
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
                              <td colSpan={3} className="text-center">No Pull Requests Open for 3 Days</td>
                            </tr>}
                            {prs.openForThreeDays.map((pr, index) => (
                              <tr key={index}>
                                <td>
                                  <a href={pr.url} target="_blank" rel="noreferrer">
                                    {pr.title}
                                  </a>
                                </td>
                                <td>
                                  <Link to={`/admin/orgs/${orgId}/projects/${currentProject.id}/work-item/edit/${pr.workItem.id}`}
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
                          Stale Pull Requests (More than 3 Days)
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
                            {prs.stale.length === 0 && <tr>
                              <td colSpan={3} className="text-center">No Stale Pull Requests</td>
                            </tr>}
                            {prs.stale.map((pr, index) => (
                              <tr key={index}>
                                <td>{pr.title}</td>
                                <td>
                                  <Link to={`/admin/orgs/${orgId}/projects/${currentProject.id}/work-item/edit/${pr.workItem.id}`}
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
                              <td colSpan={2} className="text-center">No Pull Requests Closed in the past 7 days</td>
                            </tr>}
                            {prs.closedInThePastSevenDays.map((pr, index) => (
                              <tr key={index}>
                                <td>{pr.title}</td>
                                <td>
                                  <Link to={`/admin/orgs/${orgId}/projects/${currentProject.id}/work-item/edit/${pr.workItem.id}`}
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