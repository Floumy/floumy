import React, { useEffect, useState } from 'react';
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Container,
  Progress,
  Row,
  Table,
  UncontrolledTooltip,
} from 'reactstrap';
import SimpleHeader from 'components/Headers/SimpleHeader.js';
import Select2 from 'react-select2-wrapper';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  formatHyphenatedString,
  formatOKRsProgress,
  memberNameInitials,
  okrStatusColorClassName,
  textToColor,
} from '../../../services/utils/utils';
import { listOrgOKRs } from '../../../services/okrs/okrs.service';

// Mock data
const mockStats = {
  totalObjectives: { count: 12, completed: 4, inProgress: 8 },
  keyResults: { count: 36, completed: 14, inProgress: 22 },
  averageProgress: 68,
  timeRemaining: { days: 42, progress: 65 },
};

const mockOKRs = [
  {
    id: 'okr-1',
    reference: 'O-2',
    title: 'Increase Market Share',
    description: 'Expand market presence in key regions',
    team: 'Marketing',
    progress: 0.75,
    status: 'In Progress',
    keyResults: [
      { id: 'kr-1', title: 'Launch in 3 new markets', progress: 80 },
      { id: 'kr-2', title: 'Increase customer retention to 85%', progress: 70 },
    ],
  },
  {
    id: 'okr-2',
    reference: 'O-1',
    title: 'Increase Market Share',
    description: 'Expand market presence in key regions',
    team: 'Marketing',
    progress: 0.75,
    status: 'In Progress',
    keyResults: [
      { id: 'kr-1', title: 'Launch in 3 new markets', progress: 80 },
      { id: 'kr-2', title: 'Increase customer retention to 85%', progress: 70 },
    ],
  },
  {
    id: 'okr-2',
    reference: 'O-3',
    title: 'Increase Market Share',
    description: 'Expand market presence in key regions',
    team: 'Marketing',
    progress: 0.75,
    status: 'In Progress',
    keyResults: [
      { id: 'kr-1', title: 'Launch in 3 new markets', progress: 80 },
      { id: 'kr-2', title: 'Increase customer retention to 85%', progress: 70 },
    ],
  },
];

function OrgOKRs() {
  let location = useLocation();
  const { orgId, projectId } = useParams();
  const searchParams = new URLSearchParams(location.search);
  const timelineQueryFilter = searchParams.get('timeline') || 'this-quarter';
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [okrs, setOKRs] = useState([]);

  useEffect(() => {
    document.title = 'Floumy | OKRs';

    async function fetchData() {
      setIsLoading(true);
      try {
        const okrs = await listOrgOKRs(orgId, timelineQueryFilter);
        setOKRs(okrs
          .sort((a, b) => a.createdAt < b.createdAt ? 1 : -1));
      } catch (e) {
        console.error(e.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [orgId, projectId, timelineQueryFilter]);

  return (
    <>
      <SimpleHeader
        headerButtons={[
          {
            name: 'New Objective',
            id: 'new-objective',
            shortcut: 'o',
            action: () => {/* Handle new objective */
            },
          },
        ]}
      />
      <Container className="mt--6" fluid>
        {/* Statistics Cards */}
        <Row className="my-4">
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col>
                    <h5 className="card-title text-uppercase text-muted mb-0">Total Objectives</h5>
                    <span className="h2 font-weight-bold mb-0">{mockStats.totalObjectives.count}</span>
                  </Col>
                </Row>
                <p className="mt-3 mb-0 text-sm">
                  <span className="text-success">{mockStats.totalObjectives.completed} completed</span>
                  <span className="text-nowrap ml-2">{mockStats.totalObjectives.inProgress} in progress</span>
                </p>
              </CardBody>
            </Card>
          </Col>
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col>
                    <h5 className="card-title text-uppercase text-muted mb-0">Key Results</h5>
                    <span className="h2 font-weight-bold mb-0">{mockStats.totalObjectives.count}</span>
                  </Col>
                </Row>
                <p className="mt-3 mb-0 text-sm">
                  <span className="text-success">{mockStats.totalObjectives.completed} completed</span>
                  <span className="text-nowrap ml-2">{mockStats.totalObjectives.inProgress} in progress</span>
                </p>
              </CardBody>
            </Card>
          </Col>
          {/* Average Progress Card */}
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col>
                    <h5 className="card-title text-uppercase text-muted mb-0">
                      Average Progress
                    </h5>
                    <span className="h2 font-weight-bold mb-0">68%</span>
                  </Col>
                  <Col className="col-auto">
            <span className="text-success h4">
              +5.2%
            </span>
                  </Col>
                </Row>
                <div className="mt-3">
                  <Progress
                    value={68}
                    color="success"
                    style={{ height: '6px' }}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col lg="3" sm="6">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col>
                    <h5 className="card-title text-uppercase text-muted mb-0">
                      Time Remaining
                    </h5>
                    <span className="h2 font-weight-bold mb-0">65%</span>
                  </Col>
                  <Col className="col-auto">
                  <span className="text-warning h4">
                    42 days
                  </span>
                  </Col>
                </Row>
                <div className="mt-3">
                  <Progress
                    value={65}
                    color="warning"
                    style={{ height: '6px' }}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          <div className="col">
            <Card>
              <CardHeader>
                <Row>
                  <Col xs={12} sm={8}>
                    <CardTitle tag="h2">Org Objectives</CardTitle>
                  </Col>
                  <Col xs={12} sm={4}>
                    <Select2
                      className="form-control"
                      defaultValue={'this-quarter'}
                      data={[
                        { id: 'past', text: 'Past' },
                        { id: 'this-quarter', text: 'This Quarter' },
                        { id: 'next-quarter', text: 'Next Quarter' },
                        { id: 'later', text: 'Later' },
                      ]}
                      options={{
                        placeholder: 'Filter by timeline',
                      }}
                      value={timelineQueryFilter}
                      onSelect={(e) => {
                        navigate(`?timeline=${e.target.value}`);
                      }}
                    >
                    </Select2>
                  </Col>
                </Row>
              </CardHeader>
              {isLoading && <LoadingSpinnerBox />}
              {!isLoading && okrs.length === 0 &&
                <div className="p-4">
                  <div>
                    <div style={{ maxWidth: '600px' }} className="mx-auto font-italic">
                      <h3>Objectives</h3>
                      <p>Objectives are your high-level goals that you want to achieve with your project. They
                        provide direction and purpose, helping your team stay focused on what matters most. Start by
                        defining your main objectives to give your project a clear path forward.
                        <br />
                      </p>
                      <br />
                      <h3>Key Results</h3>
                      <p>Key Results are specific, measurable outcomes that indicate progress towards your objectives.
                        They help you track your success and ensure you're on the right track. Think of them as
                        targets that show how close you are to achieving your goals. .
                        <br />
                        {/*TODO: Change the URL*/}
                        <Link to={`/admin/orgs/${orgId}/okrs/new`}
                              className="text-blue font-weight-bold">Create an Objective with
                          Key Results</Link></p>
                    </div>
                  </div>
                </div>}
              {!isLoading &&
                <div className="table-responsive">
                  <Table className="align-items-center table-flush no-select" onContextMenu={(e) => e.preventDefault()}>
                    <thead className="thead-light">
                    <tr>
                      <th className={'sort'} scope="col" width={'5%'}>Reference</th>
                      <th className="sort" scope="col" width={'40%'}>
                        Objective
                      </th>
                      <th className="sort" scope="col" width={'30%'}>
                        Progress
                      </th>
                      <th className="sort" scope="col" width={'20%'}>
                        Status
                      </th>
                      <th className="sort" scope="col" width={'5%'}>
                        Assigned To
                      </th>
                    </tr>
                    </thead>
                    <tbody className="list">
                    {okrs.length > 0 ? okrs.map((okr) => (
                        <tr key={okr.id}>
                          {okr.id === 0 &&
                            <td colSpan={5} className={'text-center'}>
                              <h3 className="text-center m-0">No objectives found for this timeline.</h3>
                            </td>
                          }
                          {okr.id !== 0 &&
                            <>
                              <td>
                                <Link to={`/orgs/${orgId}/okrs/detail/${okr.id}`}
                                      className={'okr-detail'}>
                                  {okr.reference}
                                </Link>
                              </td>
                              <td className="title-cell">
                                <Link to={`/orgs/${orgId}/okrs/detail/${okr.id}`}
                                      className={'okr-detail'}>
                                  {okr.title}
                                </Link>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <span className="mr-2">{formatOKRsProgress(okr.progress)}%</span>
                                  <div>
                                    <Progress max="100" value={formatOKRsProgress(okr.progress)} color="primary" />
                                  </div>
                                </div>
                              </td>
                              <td>
                                <Badge color="" className="badge-dot mr-4">
                                  <i className={okrStatusColorClassName(okr.status)} />
                                  <span className="status">{formatHyphenatedString(okr.status)}</span>
                                </Badge>
                              </td>
                              <td>
                                {okr.assignedTo && okr.assignedTo.name &&
                                  <>
                                    <UncontrolledTooltip target={'assigned-to-' + okr.id} placement="top">
                                      {okr.assignedTo.name}
                                    </UncontrolledTooltip>
                                    <span
                                      className="avatar avatar-xs rounded-circle"
                                      style={{ backgroundColor: textToColor(okr.assignedTo.name) }}
                                      id={'assigned-to-' + okr.id}>{memberNameInitials(okr.assignedTo.name)}</span>
                                  </>}
                                {!okr.assignedTo && '-'}
                              </td>
                            </>
                          }
                        </tr>
                      )) :
                      <tr>
                        <td colSpan={5} className={'text-center'}>
                          No objectives found.
                        </td>
                      </tr>}
                    </tbody>
                  </Table>
                </div>}
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
}

export default OrgOKRs;