import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import SimpleHeader from "../../../components/Headers/SimpleHeader";
import { Badge, Button, Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  formatDate,
  formatHyphenatedString,
  getIterationEndDate,
  getIterationStartDate,
  workItemStatusColorClassName
} from "../../../services/utils/utils";
import { completeIteration, getActiveIteration } from "../../../services/iterations/iterations.service";
import DevelopmentStats from "./DevelopmentStats";
import WorkItemsList from "../backlog/WorkItemsList";
import { getWorkItemsGroupedByStatus } from "../../../services/utils/workItemUtils";

function ActiveIteration() {
  const { orgId, projectId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [activeIteration, setActiveIteration] = useState(null);
  const [workItemsByStatus, setWorkItemsByStatus] = useState({});

  const setWorkItemsGroupedByStatus = useCallback((workItems) => {
    const sortedWorkItemsByStatus = getWorkItemsGroupedByStatus(workItems);
    setWorkItemsByStatus(sortedWorkItemsByStatus);
  }, []);

  useEffect(() => {
    document.title = "Floumy | Development";

    async function fetchData() {
      try {
        setIsLoading(true);
        const activeIteration = await getActiveIteration(orgId, projectId);
        setActiveIteration(activeIteration);
        if (activeIteration && activeIteration.workItems.length > 0) {
          setWorkItemsGroupedByStatus(activeIteration.workItems);
        }
        setIsLoading(false);
      } catch (e) {
        console.error(e.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [orgId, projectId, setWorkItemsGroupedByStatus]);

  function removeWorkItemsFromActiveIteration(workItems) {
    const newWorkItems = [];
    activeIteration.workItems.forEach(workItem => {
      if (!workItems.some(w => w.id === workItem.id)) {
        newWorkItems.push(workItem);
      }
    });
    activeIteration.workItems = newWorkItems;
    setActiveIteration({ ...activeIteration });
    setWorkItemsGroupedByStatus(activeIteration.workItems);
  }

  function handleChangeIteration(workItems, newIterationId) {
    if (activeIteration.id === newIterationId) return;
    removeWorkItemsFromActiveIteration(workItems);
  }

  function updateWorkItemsStatus(workItems, status) {
    const updatedWorkItems = activeIteration.workItems.map(workItem => {
      if (workItems.some(w => w.id === workItem.id)) {
        workItem.status = status;
        workItem.completedAt = null;
        if (status === "done" || status === "closed") {
          workItem.completedAt = new Date().toISOString();
        }
      }
      return workItem;
    });
    setWorkItemsGroupedByStatus(updatedWorkItems);
    setActiveIteration({ ...activeIteration, workItems: updatedWorkItems });
  }

  function updateWorkItemsPriority(workItems, priority) {
    const updatedWorkItems = [];
    activeIteration.workItems.forEach(workItem => {
      if (workItems.some(w => w.id === workItem.id)) {
        workItem.priority = priority;
      }
      updatedWorkItems.push(workItem);
    });

    setWorkItemsGroupedByStatus(updatedWorkItems);
    setActiveIteration({ ...activeIteration, workItems: updatedWorkItems });
  }

  function updateWorkItemAssignee(workItems, assignee) {
    const updatedWorkItems = [];
    for (const workItem of activeIteration.workItems) {
      if (workItems.some((wi) => (wi.id === workItem.id))) {
        workItem.assignedTo = assignee.id === null ? undefined : assignee;
      }
      updatedWorkItems.push(workItem);
    }
    setActiveIteration({ ...activeIteration, workItems: updatedWorkItems });
  }

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader headerButtons={[
        {
          name: "New Work Item",
          shortcut: "w",
          id: "new-work-item",
          action: () => {
            navigate(`/admin/orgs/${orgId}/projects/${projectId}/work-item/new`);
          }
        }
      ]} />
      <Container className="mt--6" fluid id="OKRs">
        {isLoading && <Card><CardHeader><h2>Active Sprint</h2></CardHeader><LoadingSpinnerBox /></Card>}
        {!isLoading && activeIteration && activeIteration.workItems && activeIteration.workItems.length > 0 &&
          <DevelopmentStats iteration={activeIteration} />}
        <Row>
          <Col>
            {!isLoading && !activeIteration && (
              <Card>
                <CardHeader>
                  <Row>
                    <Col sm={6}>
                      <h2 className="mb-0">Active Sprint</h2>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <div style={{ maxWidth: "600px" }} className="mx-auto font-italic">
                    <h3>Active Sprint</h3>
                    <p>The active Sprint is the current period where your team is actively working on tasks. They keep
                      you focused on immediate priorities and ensure steady progress. Review your active sprint
                      regularly to stay on track and adjust as needed for optimal performance.
                      <br />
                      <Link to={`/admin/orgs/${orgId}/projects/${projectId}/iterations`}
                            className="text-blue font-weight-bold">Manage the Active
                        Sprint</Link>
                    </p>
                  </div>
                </CardBody>
              </Card>
            )}
            {activeIteration && (
              <Card>
                <CardHeader>
                  <Row>
                    <Col xs={12} sm={10}>
                      <h3>
                          <a href={`/admin/orgs/${orgId}/projects/${projectId}/iterations/edit/${activeIteration.id}`}
                             >
                            <span className="text-muted">{formatDate(getIterationStartDate(activeIteration))} - {formatDate(getIterationEndDate(activeIteration))}</span> | {activeIteration.title}</a>
                      </h3>
                      <p className="text-muted mb-0">{activeIteration.goal}</p>
                    </Col>
                    <Col xs={12} sm={2} className="text-left text-lg-right pt-3 pb-3">
                      <Button color="primary" size="sm" type="button"
                              onClick={async () => {
                                await completeIteration(orgId, projectId, activeIteration.id);
                                navigate(`/admin/orgs/${orgId}/projects/${projectId}/iterations`);
                              }}>
                        Complete Sprint
                      </Button>
                    </Col>
                  </Row>
                </CardHeader>
                <div className="pt-3">
                  {Object.keys(workItemsByStatus).length === 0 && !isLoading && (
                    <div className="text-center m-3">
                      <h3 className="">No work items found in this sprint. Add them <Link
                        to={`/admin/orgs/${orgId}/projects/${projectId}/iterations`}
                        className="text-blue">here</Link>
                      </h3>
                    </div>
                  )}

                  {Object.keys(workItemsByStatus).map((status) => (
                    <div key={status} className="mb-5">
                      <Row className="pl-4 pt-2 pr-4 mb-1">
                        <Col>
                          <Badge color="" className="badge-dot mb-2">
                            <h4 className="mb-0"><i
                              className={workItemStatusColorClassName(status)} /> {formatHyphenatedString(status)}</h4>
                          </Badge>
                        </Col>
                      </Row>
                      <WorkItemsList workItems={workItemsByStatus[status]}
                                     showFeature={true}
                                     showAssignedTo={true}
                                     onChangeIteration={handleChangeIteration}
                                     onChangeStatus={updateWorkItemsStatus}
                                     onChangePriority={updateWorkItemsPriority}
                                     onChangeAssignee={updateWorkItemAssignee}
                                     headerClassName={"thead"} />
                    </div>
                  ))}
                </div>
                {isLoading && <LoadingSpinnerBox />}
              </Card>)}
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default ActiveIteration;
