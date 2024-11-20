import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import SimpleHeader from "../../../components/Headers/SimpleHeader";
import { Card, CardBody, CardHeader, CardTitle, Col, Container, Row } from "reactstrap";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";
import React, { useEffect, useState } from "react";
import Select2 from "react-select2-wrapper";
import WorkItemsList from "../backlog/WorkItemsList";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  listIterationsWithWorkItemsForTimeline,
  startIteration
} from "../../../services/iterations/iterations.service";
import { formatDate, getIterationEndDate, getIterationStartDate, sortByPriority } from "../../../services/utils/utils";
import { addWorkItem, listOpenWorkItems } from "../../../services/backlog/backlog.service";
import { useHotkeys } from "react-hotkeys-hook";
import WorkItemsListCard from "../backlog/WorkItemsListCard";

function Iterations() {
  const { orgId, productId } = useParams();
  let location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const timelineQueryFilter = searchParams.get("timeline");
  const [isLoadingIterations, setIsLoadingIterations] = useState(false);
  const [isLoadingWorkItems, setIsLoadingWorkItems] = useState(false);
  const [timelineFilterValue, setTimelineFilterValue] = useState(timelineQueryFilter || "this-quarter");
  const [iterations, setIterations] = useState([]);
  const [backlogWorkItems, setBacklogWorkItems] = useState([]);
  const [showWorkItems, setShowWorkItems] = useState({});
  const navigate = useNavigate();

  // on b hotkey press scroll to the features backlog section
  useHotkeys("b", () => {
    document.getElementById("work-items-backlog").scrollIntoView();
  });

  useEffect(() => {
    document.title = "Floumy | Sprints";

    async function fetchIterations() {
      setIsLoadingIterations(true);
      try {
        const iterations = await listIterationsWithWorkItemsForTimeline(orgId, productId, timelineFilterValue);
        setIterations(iterations);
        const showItems = {};
        iterations.forEach(iteration => {
          showItems[iteration.id] = true;
        });
        setShowWorkItems(showItems);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingIterations(false);
      }
    }

    fetchIterations();

  }, [orgId, productId, timelineFilterValue]);

  useEffect(() => {
    async function fetchBacklogWorkItems() {
      try {
        setIsLoadingWorkItems(true);
        const workItems = await listOpenWorkItems(orgId, productId);
        const sortedWorkItems = sortByPriority(workItems);
        setBacklogWorkItems(sortedWorkItems);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingWorkItems(false);
      }
    }

    fetchBacklogWorkItems();
  }, []);

  async function start(iterationId) {
    try {
      await startIteration(orgId, productId, iterationId);
      navigate("/admin/active-iteration");
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAddWorkItemWithIteration(workItem, iterationId) {
    workItem.iteration = iterationId;
    const savedWorkItem = await addWorkItem(orgId, productId, workItem);
    const workItems = iterations.find(iteration => iteration.id === iterationId).workItems;
    workItems.push(savedWorkItem);
    sortByPriority(workItems);
    setIterations([...iterations]);
  }

  async function handleAddWorkItemToBacklog(workItem) {
    const savedWorkItem = await addWorkItem(orgId, productId, workItem);
    backlogWorkItems.push(savedWorkItem);
    sortByPriority(backlogWorkItems);
    setBacklogWorkItems([...backlogWorkItems]);
  }

  function estimationTotal(workItems) {
    let total = 0;
    workItems.forEach(workItem => {
      if (workItem.estimation) {
        total += workItem.estimation;
      }
    });

    return total;
  }

  function moveWorkItemsToIteration(workItems, newIterationId) {
    const newIteration = iterations.find(iteration => iteration.id === newIterationId);
    if (!newIteration) {
      return;
    }

    workItems.forEach(workItem => {
      workItem.iteration = {
        id: newIteration.id
      };
      newIteration.workItems.push(workItem);
    });
    sortByPriority(newIteration.workItems);
    setIterations([...iterations]);
  }

  function removeWorkItemsFromBacklog(workItems) {
    const newBacklogWorkItems = [];
    backlogWorkItems.forEach(workItem => {
      if (!workItems.some(w => w.id === workItem.id)) {
        newBacklogWorkItems.push(workItem);
      }
    });
    setBacklogWorkItems(newBacklogWorkItems);
  }

  function moveWorkItemsFromBacklogToIteration(workItems, newIterationId) {
    if (newIterationId) {
      moveWorkItemsToIteration(workItems, newIterationId);
    }
    removeWorkItemsFromBacklog(workItems);
  }

  function moveWorkItemsToBacklog(workItems) {
    workItems.forEach(workItem => {
      workItem.iteration = null;
      backlogWorkItems.push(workItem);
    });
    setBacklogWorkItems([...backlogWorkItems]);
  }

  function removeWorkItemsFromIteration(workItems, oldIterationId) {
    const oldIteration = iterations.find(iteration => iteration.id === oldIterationId);
    if (!oldIteration) {
      return;
    }

    const newWorkItems = [];
    oldIteration.workItems.forEach(workItem => {
      workItem.iteration = null;
      if (!workItems.some(w => w.id === workItem.id)) {
        newWorkItems.push(workItem);
      }
    });
    oldIteration.workItems = newWorkItems;
    sortByPriority(oldIteration.workItems);
    setIterations([...iterations]);
  }

  function moveWorkItemsFromIterationToBacklog(workItems) {
    const oldIterationId = workItems[0].iteration.id;
    if (oldIterationId) {
      removeWorkItemsFromIteration(workItems, oldIterationId);
    }

    moveWorkItemsToBacklog(workItems);
  }

  function moveWorkItemsFromOldIterationToNewIteration(workItems, newIterationId) {
    const oldIterationId = workItems[0].iteration.id;
    if (oldIterationId) {
      removeWorkItemsFromIteration(workItems, oldIterationId);
    }

    moveWorkItemsToIteration(workItems, newIterationId);
  }

  function handleChangeWorkItemsIteration(workItems, newIterationId) {
    const backlogWorkItems = workItems.filter(workItem => !workItem.iteration);
    if (backlogWorkItems.length > 0) {
      return moveWorkItemsFromBacklogToIteration(backlogWorkItems, newIterationId);
    }

    if (newIterationId === null) {
      return moveWorkItemsFromIterationToBacklog(workItems);
    }

    // Add the work item to the new iteration
    moveWorkItemsFromOldIterationToNewIteration(workItems, newIterationId);
  }

  function updateWorkItemsStatusInIteration(workItems, status, iterationId) {
    const iteration = iterations.find(iteration => iteration.id === iterationId);
    const updatedWorkItems = [];
    for (const workItem of iteration.workItems) {
      if (workItems.some((wi) => (wi.id === workItem.id))) {
        workItem.status = status;
      }
      updatedWorkItems.push(workItem);
    }
    iteration.workItems = updatedWorkItems;
    setIterations([...iterations]);
  }

  function updateWorkItemsStatusInBacklog(workItems, status) {
    if (status === "done" || status === "closed") {
      return removeWorkItemsFromBacklog(workItems);
    }

    const updatedWorkItems = [];
    for (const workItem of backlogWorkItems) {
      if (workItems.some((wi) => (wi.id === workItem.id))) {
        workItem.status = status;
      }
      updatedWorkItems.push(workItem);
    }
    setBacklogWorkItems(updatedWorkItems);
  }

  function updateWorkItemsPriorityInIteration(workItems, priority, iterationId) {
    const iteration = iterations.find(iteration => iteration.id === iterationId);
    const updatedWorkItems = [];
    for (const workItem of iteration.workItems) {
      if (workItems.some((wi) => (wi.id === workItem.id))) {
        workItem.priority = priority;
      }
      updatedWorkItems.push(workItem);
    }
    iteration.workItems = updatedWorkItems;
    setIterations([...iterations]);
  }

  function updateWorkItemsPriorityInBacklog(workItems, priority) {
    const updatedWorkItems = [];
    for (const workItem of backlogWorkItems) {
      if (workItems.some((wi) => (wi.id === workItem.id))) {
        workItem.priority = priority;
      }
      updatedWorkItems.push(workItem);
    }
    sortByPriority(updatedWorkItems);
    setBacklogWorkItems([...updatedWorkItems]);
  }

  return (
    <>
      {isLoadingIterations && <InfiniteLoadingBar />}
      <SimpleHeader headerButtons={
        [
          {
            name: "New Sprint",
            shortcut: "s",
            id: "new-iteration",
            action: () => {
              navigate(`/admin/orgs/${orgId}/projects/${productId}/iterations/new`);
            }
          },
          {
            name: "New Work Item",
            shortcut: "w",
            id: "new-work-item",
            action: () => {
              navigate(`/admin/orgs/${orgId}/projects/${productId}/work-item/new`);
            }
          }
        ]
      } />
      <Container className="mt--6" fluid id="OKRs">
        <Row>
          <Col>
            <Card className="mb-5">
              <CardHeader>
                <Row>
                  <Col xs={12} sm={8}>
                    <CardTitle tag="h2">Sprints</CardTitle>
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
              <div className="p-4">
                {iterations.length === 0 && !isLoadingIterations && (
                  <div style={{ maxWidth: "600px" }} className="mx-auto font-italic">
                    <h3>Sprints</h3>
                    <p>Sprints are short, time-boxed periods during which your team works to complete specific
                      work items. They help you deliver incremental progress and adapt quickly to changes. Plan your
                      sprints to maintain a steady development pace and ensure continuous improvement.
                      <br />
                      <Link to={`/admin/orgs/${orgId}/projects/${productId}/iterations/new`}
                            className="text-blue font-weight-bold">Plan a Sprint</Link>
                    </p>
                    <h3>Work Items</h3>
                    <p>Work Items are the tasks and activities that need to be completed to develop your features.
                      They break down the work into manageable chunks, making it easier to track progress and stay
                      organized. Create work items to keep your team aligned and productive.
                      <br />
                      <Link to={`/admin/orgs/${orgId}/projects/${productId}/work-item/new`}
                            className="text-blue font-weight-bold">Create a Work
                        Item</Link>
                    </p>
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
                          <Link to={`/admin/orgs/${orgId}/projects/${productId}/iterations/edit/${iteration.id}`}
                                className="mr-2">
                            <span
                              className="text-muted">{formatDate(getIterationStartDate(iteration))} - {formatDate(getIterationEndDate(iteration))}</span> | {iteration.title}
                          </Link>
                          {iteration.status === "active" && <span className="badge badge-info">Active</span>}
                          {iteration.status === "completed" &&
                            <span className="badge badge-success">Completed</span>}
                          {iteration.status === "planned" &&
                            <button onClick={async () => {
                              await start(iteration.id);
                            }} className="btn btn-sm btn-outline-primary mr-0">Start Sprint
                            </button>}
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
                        <WorkItemsList
                          id={"completed-" + iteration.id}
                          showAssignedTo={true}
                          workItems={sortByPriority(iteration.workItems.filter(workItem => workItem.status === "done" || workItem.status === "closed"))}
                          headerClassName={"thead"}
                          onChangeIteration={handleChangeWorkItemsIteration}
                          onChangeStatus={(workItems, status) => {
                            updateWorkItemsStatusInIteration(workItems, status, iteration.id);
                          }}
                          onChangePriority={(workItems, priority) => {
                            updateWorkItemsPriorityInIteration(workItems, priority, iteration.id);
                          }}
                        />
                        <CardBody className="pt-2 pb-2 font-italic"><Row><Col className="text-sm">Unfinished Work
                          Items</Col></Row></CardBody>
                        <WorkItemsList
                          id={"unfinished-" + iteration.id}
                          showAssignedTo={true}
                          workItems={sortByPriority(iteration.workItems.filter(workItem => workItem.status !== "done" && workItem.status !== "closed"))}
                          headerClassName={"thead"}
                          onChangeIteration={handleChangeWorkItemsIteration}
                          onChangeStatus={(workItems, status) => {
                            updateWorkItemsStatusInIteration(workItems, status, iteration.id);
                          }}
                          onChangePriority={(workItems, priority) => {
                            updateWorkItemsPriorityInIteration(workItems, priority, iteration.id);
                          }}
                        />
                      </div>
                    }
                    {iteration.status !== "completed" &&
                      <div className="pt-2" hidden={!showWorkItems[iteration.id]}>
                        <WorkItemsList
                          id={iteration.id}
                          showAssignedTo={true}
                          workItems={sortByPriority(iteration.workItems)}
                          headerClassName={"thead"}
                          onAddNewWorkItem={async (workItem) => {
                            await handleAddWorkItemWithIteration(workItem, iteration.id);
                          }}
                          onChangeIteration={handleChangeWorkItemsIteration}
                          onChangeStatus={(workItems, status) => {
                            updateWorkItemsStatusInIteration(workItems, status, iteration.id);
                          }}
                          onChangePriority={(workItems, priority) => {
                            updateWorkItemsPriorityInIteration(workItems, priority, iteration.id);
                          }}
                        />
                      </div>
                    }
                  </div>
                ))}
              </div>
              {isLoadingIterations && <LoadingSpinnerBox />}
            </Card>
            <div id={"work-items-backlog"} />
            <WorkItemsListCard
              id={"backlog"}
              workItems={backlogWorkItems}
              title={"Work Items Backlog"}
              isLoading={isLoadingWorkItems}
              onAddWorkItem={handleAddWorkItemToBacklog}
              onChangeIteration={handleChangeWorkItemsIteration}
              onChangeStatus={(workItems, status) => {
                updateWorkItemsStatusInBacklog(workItems, status);
              }}
              onChangePriority={(workItems, priority) => {
                updateWorkItemsPriorityInBacklog(workItems, priority);
              }}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Iterations;
