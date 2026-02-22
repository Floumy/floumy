import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Row,
} from 'reactstrap';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  formatDate,
  formatHyphenatedString,
  getSprintEndDate,
  getSprintStartDate,
  workItemStatusColorClassName,
} from '../../../services/utils/utils';
import {
  completeCycle,
  getActiveCycle,
} from '../../../services/cycles/cycles.service';
import DevelopmentStats from './DevelopmentStats';
import WorkItemsList from '../backlog/WorkItemsList';
import { getWorkItemsGroupedByStatus } from '../../../services/utils/workItemUtils';

function ActiveSprint() {
  const { orgId, projectId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [activeCycle, setActiveSprint] = useState(null);
  const [workItemsByStatus, setWorkItemsByStatus] = useState({});

  const setWorkItemsGroupedByStatus = useCallback((workItems) => {
    const sortedWorkItemsByStatus = getWorkItemsGroupedByStatus(workItems);
    setWorkItemsByStatus(sortedWorkItemsByStatus);
  }, []);

  useEffect(() => {
    document.title = 'Floumy | Development';

    async function fetchData() {
      try {
        setIsLoading(true);
        const activeCycle = await getActiveCycle(orgId, projectId);
        setActiveSprint(activeCycle);
        if (activeCycle && activeCycle.workItems.length > 0) {
          setWorkItemsGroupedByStatus(activeCycle.workItems);
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

  function removeWorkItemsFromActiveSprint(workItems) {
    const newWorkItems = [];
    activeCycle.workItems.forEach((workItem) => {
      if (!workItems.some((w) => w.id === workItem.id)) {
        newWorkItems.push(workItem);
      }
    });
    activeCycle.workItems = newWorkItems;
    setActiveSprint({ ...activeCycle });
    setWorkItemsGroupedByStatus(activeCycle.workItems);
  }

  function handleChangeSprint(workItems, newSprintId) {
    if (activeCycle.id === newSprintId) return;
    removeWorkItemsFromActiveSprint(workItems);
  }

  function updateWorkItemsStatus(workItems, status) {
    const updatedWorkItems = activeCycle.workItems.map((workItem) => {
      if (workItems.some((w) => w.id === workItem.id)) {
        workItem.status = status;
        workItem.completedAt = null;
        if (status === 'done' || status === 'closed') {
          workItem.completedAt = new Date().toISOString();
        }
      }
      return workItem;
    });
    setWorkItemsGroupedByStatus(updatedWorkItems);
    setActiveSprint({ ...activeCycle, workItems: updatedWorkItems });
  }

  function updateWorkItemsPriority(workItems, priority) {
    const updatedWorkItems = [];
    activeCycle.workItems.forEach((workItem) => {
      if (workItems.some((w) => w.id === workItem.id)) {
        workItem.priority = priority;
      }
      updatedWorkItems.push(workItem);
    });

    setWorkItemsGroupedByStatus(updatedWorkItems);
    setActiveSprint({ ...activeCycle, workItems: updatedWorkItems });
  }

  function updateWorkItemAssignee(workItems, assignee) {
    const updatedWorkItems = [];
    for (const workItem of activeCycle.workItems) {
      if (workItems.some((wi) => wi.id === workItem.id)) {
        workItem.assignedTo = assignee.id === null ? undefined : assignee;
      }
      updatedWorkItems.push(workItem);
    }
    setActiveSprint({ ...activeCycle, workItems: updatedWorkItems });
  }

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader
        headerButtons={[
          {
            name: 'New Work Item',
            shortcut: 'w',
            id: 'new-work-item',
            action: () => {
              navigate(
                `/admin/orgs/${orgId}/projects/${projectId}/work-item/new`,
              );
            },
          },
        ]}
      />
      <Container className="mt--6" fluid id="OKRs">
        {isLoading && (
          <Card>
            <CardHeader>
              <h2>Active Sprint</h2>
            </CardHeader>
            <LoadingSpinnerBox />
          </Card>
        )}
        {!isLoading &&
          activeCycle &&
          activeCycle.workItems &&
          activeCycle.workItems.length > 0 && (
            <DevelopmentStats sprint={activeCycle} />
          )}
        <Row>
          <Col>
            {!isLoading && !activeCycle && (
              <Card>
                <CardHeader>
                  <Row>
                    <Col sm={6}>
                      <h2 className="mb-0">Active Sprint</h2>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <div className="p-5 text-center">
                    <div className="mx-auto" style={{ maxWidth: '680px' }}>
                      <h3 className="mb-3">No active sprint</h3>
                      <p className="text-muted">
                        Start a sprint to begin tracking work in the current
                        cycle and keep your team focused on the highest
                        priorities.
                      </p>
                      <div className="my-4">
                        <Link
                          to={`/admin/orgs/${orgId}/projects/${projectId}/sprints/new`}
                          className="btn btn-primary"
                        >
                          Plan a Sprint
                        </Link>
                      </div>
                      <Row className="mt-4 text-left">
                        <Col md="6" className="mb-3">
                          <Card>
                            <CardBody>
                              <h5 className="mb-2">What is a Sprint?</h5>
                              <p className="mb-0 text-sm text-muted">
                                A short, time-boxed period to deliver
                                prioritized work and maintain momentum.
                              </p>
                            </CardBody>
                          </Card>
                        </Col>
                        <Col md="6" className="mb-3">
                          <Card>
                            <CardBody>
                              <h5 className="mb-2">
                                What is an Active Sprint?
                              </h5>
                              <p className="mb-0 text-sm text-muted">
                                The currently running sprint where your team
                                executes planned work and tracks daily progress.
                              </p>
                            </CardBody>
                          </Card>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
            {activeCycle && (
              <Card>
                <CardHeader>
                  <Row>
                    <Col xs={12} sm={10}>
                      <h3>
                        <a
                          href={`/admin/orgs/${orgId}/projects/${projectId}/sprints/edit/${activeCycle.id}`}
                        >
                          <span className="text-muted">
                            {formatDate(getSprintStartDate(activeCycle))} -{' '}
                            {formatDate(getSprintEndDate(activeCycle))}
                          </span>{' '}
                          | {activeCycle.title}
                        </a>
                      </h3>
                      <p className="text-muted mb-0">{activeCycle.goal}</p>
                    </Col>
                    <Col
                      xs={12}
                      sm={2}
                      className="text-left text-lg-right pt-3 pb-3"
                    >
                      <Button
                        color="primary"
                        size="sm"
                        type="button"
                        onClick={async () => {
                          await completeCycle(orgId, projectId, activeCycle.id);
                          navigate(
                            `/admin/orgs/${orgId}/projects/${projectId}/cycles`,
                          );
                        }}
                      >
                        Complete Cycle
                      </Button>
                    </Col>
                  </Row>
                </CardHeader>
                <div className="pt-3">
                  {Object.keys(workItemsByStatus).length === 0 &&
                    !isLoading && (
                      <div className="text-center m-3">
                        <h3 className="">
                          No work items found in this sprint. Add them{' '}
                          <Link
                            to={`/admin/orgs/${orgId}/projects/${projectId}/sprints`}
                            className="text-blue"
                          >
                            here
                          </Link>
                        </h3>
                      </div>
                    )}

                  {Object.keys(workItemsByStatus).map((status) => (
                    <div key={status} className="mb-5">
                      <Row className="pl-4 pt-2 pr-4 mb-1">
                        <Col>
                          <Badge color="" className="badge-dot mb-2">
                            <h4 className="mb-0">
                              <i
                                className={workItemStatusColorClassName(status)}
                              />{' '}
                              {formatHyphenatedString(status)}
                            </h4>
                          </Badge>
                        </Col>
                      </Row>
                      <WorkItemsList
                        workItems={workItemsByStatus[status]}
                        showInitiative={true}
                        showAssignedTo={true}
                        showStatus={false}
                        onChangeSprint={handleChangeSprint}
                        onChangeStatus={updateWorkItemsStatus}
                        onChangePriority={updateWorkItemsPriority}
                        onChangeAssignee={updateWorkItemAssignee}
                        onDelete={removeWorkItemsFromActiveSprint}
                        headerClassName={'thead'}
                      />
                    </div>
                  ))}
                </div>
                {isLoading && <LoadingSpinnerBox />}
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default ActiveSprint;
