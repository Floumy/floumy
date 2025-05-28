import React, { useEffect, useState } from "react";
// javascript plugin that creates a sortable object from a dom object
// reactstrap components
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
  UncontrolledTooltip
} from "reactstrap";
// core components
import SimpleHeader from "components/Headers/SimpleHeader.js";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { listOKRs, getOkrStats } from "../../../services/okrs/okrs.service";
import Select2 from "react-select2-wrapper";
import {
  formatHyphenatedString,
  formatOKRsProgress,
  memberNameInitials,
  okrStatusColorClassName,
  textToColor
} from "../../../services/utils/utils";
import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";

function OKRs() {
  let location = useLocation();
  const { orgId, projectId } = useParams();
  const searchParams = new URLSearchParams(location.search);
  const timelineQueryFilter = searchParams.get("timeline") || "this-quarter";
  const navigate = useNavigate();
  const okrTemplate = {
    id: 0,
    reference: "",
    title: "",
    status: "",
    progress: 0,
    timeline: ""
  };
  const [okrs, setOKRs] = useState([okrTemplate]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);

  useEffect(() => {
    document.title = "Floumy | OKRs";

    async function fetchData() {
      setIsLoading(true);
      try {
        const okrs = await listOKRs(orgId, projectId, timelineQueryFilter);
        setOKRs(okrs
          .sort((a, b) => a.createdAt < b.createdAt ? 1 : -1));
      } catch (e) {
        console.error(e.message);
      } finally {
        setIsLoading(false);
      }
    }

    async function fetchStats() {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const statsData = await getOkrStats(orgId, projectId, timelineQueryFilter);
        setStats(statsData);
      } catch (e) {
        setStatsError('Could not load stats');
      } finally {
        setStatsLoading(false);
      }
    }

    fetchData();
    fetchStats();
  }, [orgId, projectId, timelineQueryFilter]);

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader
        headerButtons={[
          {
            name: "New Objective",
            id: "new-objective",
            shortcut: "o",
            action: () => {
              navigate(`/admin/orgs/${orgId}/projects/${projectId}/okrs/new`);
            }
          }
        ]}
      />
      <Container className="mt--6" fluid id="OKRs">
        {!statsLoading && !statsError && stats &&
        <Row className="my-4">
          <Col lg="4" sm="12">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col>
                    <h5 className="card-title text-uppercase text-muted mb-0">Total Objectives</h5>
                    <span className="h2 font-weight-bold mb-0">{stats.objectives.total}</span>
                  </Col>
                </Row>
                <p className="mt-3 mb-0 text-sm">
                  <span className="text-success">{stats.objectives.completed} completed</span>
                  <span className="text-nowrap ml-2">{stats.objectives.inProgress} in progress</span>
                </p>
              </CardBody>
            </Card>
          </Col>
          <Col lg="4" sm="12">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col>
                    <h5 className="card-title text-uppercase text-muted mb-0">Key Results</h5>
                    <span className="h2 font-weight-bold mb-0">{stats.keyResults.total}</span>
                  </Col>
                </Row>
                <p className="mt-3 mb-0 text-sm">
                  <span className="text-success">{stats.keyResults.completed} completed</span>
                  <span className="text-nowrap ml-2">{stats.keyResults.inProgress} in progress</span>
                </p>
              </CardBody>
            </Card>
          </Col>
          <Col lg="4" sm="12">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col>
                    <h5 className="card-title text-uppercase text-muted mb-0">
                      Average Progress
                    </h5>
                    <span className="h2 font-weight-bold mb-0">{stats.progress.current}%</span>
                  </Col>
                </Row>
                <div className="mt-3">
                  <Progress
                    value={stats.progress.current}
                    color="success"
                    style={{ height: '6px' }}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>}
        <Row>
          <div className="col">
            <Card>
              <CardHeader>
                <Row>
                  <Col xs={12} sm={8}>
                    <CardTitle tag="h2">Objectives</CardTitle>
                  </Col>
                  <Col xs={12} sm={4}>
                    <Select2
                      className="form-control"
                      defaultValue={"this-quarter"}
                      data={[
                        { id: "past", text: "Past" },
                        { id: "this-quarter", text: "This Quarter" },
                        { id: "next-quarter", text: "Next Quarter" },
                        { id: "later", text: "Later" }
                      ]}
                      options={{
                        placeholder: "Filter by timeline"
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
                    <div style={{ maxWidth: "600px" }} className="mx-auto font-italic">
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
                        <Link to={`/admin/orgs/${orgId}/projects/${projectId}/okrs/new`}
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
                      <th className={"sort"} scope="col" width={"5%"}>Reference</th>
                      <th className="sort" scope="col" width={"40%"}>
                        Objective
                      </th>
                      <th className="sort" scope="col" width={"30%"}>
                        Progress
                      </th>
                      <th className="sort" scope="col" width={"20%"}>
                        Status
                      </th>
                      <th className="sort" scope="col" width={"5%"}>
                        Assigned To
                      </th>
                    </tr>
                    </thead>
                    <tbody className="list">
                    {okrs.length > 0 ? okrs.map((okr) => (
                      <tr key={okr.id}>
                        {/*Display empty row with message if is template*/}
                        {okr.id === 0 &&
                          <td colSpan={5} className={"text-center"}>
                            <h3 className="text-center m-0">No objectives found for this timeline.</h3>
                          </td>
                        }
                        {okr.id !== 0 &&
                          <>
                            <td>
                              <Link to={`/admin/orgs/${orgId}/projects/${projectId}/okrs/detail/${okr.id}`}
                                    className={"okr-detail"}>
                                {okr.reference}
                              </Link>
                            </td>
                            <td className="title-cell">
                              <Link to={`/admin/orgs/${orgId}/projects/${projectId}/okrs/detail/${okr.id}`}
                                    className={"okr-detail"}>
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
                                  <UncontrolledTooltip target={"assigned-to-" + okr.id} placement="top">
                                    {okr.assignedTo.name}
                                  </UncontrolledTooltip>
                                  <span
                                    className="avatar avatar-xs rounded-circle"
                                    style={{ backgroundColor: textToColor(okr.assignedTo.name) }}
                                    id={"assigned-to-" + okr.id}>{memberNameInitials(okr.assignedTo.name)}</span>
                                </>}
                              {!okr.assignedTo && "-"}
                            </td>
                          </>
                        }
                      </tr>
                    )) :
                      <tr>
                        <td colSpan={5} className={"text-center"}>
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

export default OKRs;
