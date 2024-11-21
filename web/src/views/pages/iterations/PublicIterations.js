import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import SimpleHeader from "../../../components/Headers/SimpleHeader";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";
import React, { useEffect, useState } from "react";
import Select2 from "react-select2-wrapper";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { listPublicIterationsWithWorkItemsForTimeline } from "../../../services/iterations/iterations.service";
import { formatDate, getIterationEndDate, getIterationStartDate, sortByPriority } from "../../../services/utils/utils";
import PublicWorkItemsList from "../backlog/PublicWorkItemsList";
import PublicShareButtons from "../../../components/PublicShareButtons/PublicShareButtons";

function PublicIterations() {
  let location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const timelineQueryFilter = searchParams.get("timeline");
  const [isLoadingIterations, setIsLoadingIterations] = useState(false);
  const [timelineFilterValue, setTimelineFilterValue] = useState(timelineQueryFilter || "this-quarter");
  const [iterations, setIterations] = useState([]);
  const [showWorkItems, setShowWorkItems] = useState({});
  const navigate = useNavigate();
  const { orgId, projectId } = useParams();

  useEffect(() => {
    document.title = "Floumy | Sprints";

    async function fetchIterations() {
      setIsLoadingIterations(true);
      try {
        const iterations = await listPublicIterationsWithWorkItemsForTimeline(orgId, projectId, timelineFilterValue);
        setIterations(iterations);
        // Show all work items by default
        const displayWorkItems = {};
        iterations.forEach(iteration => {
          displayWorkItems[iteration.id] = true;
        });
        setShowWorkItems(displayWorkItems);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingIterations(false);
      }
    }

    fetchIterations();

  }, [orgId, projectId, timelineFilterValue]);

  function estimationTotal(workItems) {
    let total = 0;
    workItems.forEach(workItem => {
      if (workItem.estimation) {
        total += workItem.estimation;
      }
    });

    return total;
  }

  return (
    <>
      {isLoadingIterations && <InfiniteLoadingBar />}
      <SimpleHeader />
      <Container className="mt--6" fluid id="OKRs">
        <Row>
          <Col>
            <Card className="mb-5">
              <CardHeader>
                <Row>
                  <Col xs={12} sm={8}>
                    <h2>Sprints</h2>
                    <PublicShareButtons title={"Sprints"} />
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
                      value={timelineFilterValue}
                      onSelect={(e) => {
                        setTimelineFilterValue(e.params.data.id);
                        navigate(`?timeline=${e.params.data.id}`);
                      }}
                    >
                    </Select2>
                  </Col>
                </Row>
              </CardHeader>
              <div className="pt-3 pb-2">
                {iterations.length === 0 && !isLoadingIterations && (
                  <div className="text-center">
                    <h3>No sprints found for this timeline.</h3>
                  </div>
                )}
                {iterations.length > 0 && !isLoadingIterations && iterations.map((iteration) => (
                  <div key={iteration.id} className="mb-5">
                    <Row className="pl-4 pt-2 pr-4">
                      <Col>
                        <h3 className="mb-0">
                          <button onClick={() => {
                            const displayWorkItems = showWorkItems;
                            displayWorkItems[iteration.id] = !displayWorkItems[iteration.id];
                            setShowWorkItems({ ...displayWorkItems });
                          }}
                                  className="btn btn-sm btn-outline-light shadow-none shadow-none--hover pt-1 pb-0 pl-2 pr-2">
                            {!showWorkItems[iteration.id] && <i className="ni ni-bold-right" />}
                            {showWorkItems[iteration.id] && <i className="ni ni-bold-down" />}
                          </button>
                          <Link to={`/public/orgs/${orgId}/projects/${projectId}/iterations/detail/${iteration.id}`}
                                className="mr-2">
                            <span
                              className="text-muted">{formatDate(getIterationStartDate(iteration))} - {formatDate(getIterationEndDate(iteration))}</span> | {iteration.title}
                          </Link>
                          {iteration.status === "active" && <span className="badge badge-info">Active</span>}
                          {iteration.status === "completed" &&
                            <span className="badge badge-success">Completed</span>}
                          {iteration.status === "planned" &&
                            <span className="badge badge-primary text-white">Planned</span>}
                        </h3>
                      </Col>
                    </Row>
                    <Row className="pl-4 pr-4">
                      <Col>
                        <span className="text-muted text-sm p-0 m-0">Work Items Count: {iteration.workItems.length}, Estimated Effort: {estimationTotal(iteration.workItems)}</span>
                      </Col>
                    </Row>
                    {iteration.goal && <Row className="pl-4 pr-4">
                      <Col>
                        <div className="text-muted mb-0 text-sm">Goal: {iteration.goal}</div>
                      </Col>
                    </Row>}
                    {iteration.status === "completed" &&
                      <div hidden={!showWorkItems[iteration.id]}>
                        <CardBody className="pb-2 pt-2 font-italic"><Row><Col className="text-sm">Completed Work
                          Items</Col></Row></CardBody>
                        <PublicWorkItemsList
                          orgId={orgId}
                          id={"completed-" + iteration.id}
                          workItems={sortByPriority(iteration.workItems.filter(workItem => workItem.status === "done" || workItem.status === "closed"))}
                          headerClassName={"thead"}
                        />
                        <CardBody className="pt-2 pb-2 font-italic"><Row><Col className="text-sm">Unfinished Work
                          Items</Col></Row></CardBody>
                        <PublicWorkItemsList
                          orgId={orgId}
                          id={"unfinished-" + iteration.id}
                          workItems={sortByPriority(iteration.workItems.filter(workItem => workItem.status !== "done" && workItem.status !== "closed"))}
                          headerClassName={"thead"}
                        />
                      </div>
                    }
                    {iteration.status !== "completed" &&
                      <div className="pt-2" hidden={!showWorkItems[iteration.id]}>
                        <PublicWorkItemsList
                          orgId={orgId}
                          id={iteration.id}
                          showAssignedTo={true}
                          workItems={sortByPriority(iteration.workItems)}
                          headerClassName={"thead"}
                        />
                      </div>
                    }
                  </div>
                ))}
              </div>
              {isLoadingIterations && <LoadingSpinnerBox />}
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default PublicIterations;
