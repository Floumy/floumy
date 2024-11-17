import React, { useEffect, useState } from "react";
// javascript plugin that creates a sortable object from a dom object
// reactstrap components
import {
  Badge,
  Card,
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
import { Link, useLocation, useNavigate } from "react-router-dom";
import { listOKRs } from "../../../services/okrs/okrs.service";
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

  useEffect(() => {
    document.title = "Floumy | OKRs";

    async function fetchData() {
      setIsLoading(true);
      try {
        const okrs = await listOKRs(timelineQueryFilter);
        setOKRs(okrs
          .sort((a, b) => a.createdAt < b.createdAt ? 1 : -1));
      } catch (e) {
        console.error(e.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [timelineQueryFilter]);

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
              navigate("/admin/okrs/new");
            }
          }
        ]}
      />
      <Container className="mt--6" fluid id="OKRs">
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
                        <Link to={"/admin/okrs/new"} className="text-blue font-weight-bold">Create an Objective with
                          Key Results</Link></p>
                    </div>
                  </div>
                </div>}
              {!isLoading && okrs.length > 0 &&
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
                    {okrs.map((okr) => (
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
                              <Link to={`/admin/okrs/detail/${okr.id}`} className={"okr-detail"}>
                                {okr.reference}
                              </Link>
                            </td>
                            <td className="title-cell">
                              <Link to={`/admin/okrs/detail/${okr.id}`} className={"okr-detail"}>
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
                                    id={"assigned-to-" + okr.id}>{memberNameInitials(okr.assignedTo.name)}
                </span>
                                </>}
                              {!okr.assignedTo && "-"}
                            </td>
                          </>
                        }
                      </tr>
                    ))}
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
