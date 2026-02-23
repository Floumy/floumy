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
import { listOpenWorkItems } from '../../../services/backlog/backlog.service';
import { useProjects } from '../../../contexts/ProjectsContext';
import DevelopmentStats from './DevelopmentStats';
import WorkItemsList from '../backlog/WorkItemsList';
import { getWorkItemsGroupedByStatus } from '../../../services/utils/workItemUtils';

function ActiveSprint() {
  const { orgId, projectId } = useParams();
  const { currentProject } = useProjects();
  const cyclesEnabled = currentProject?.cyclesEnabled ?? false;
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [activeCycle, setActiveSprint] = useState(null);
  const [activeWorkItems, setActiveWorkItems] = useState([]);
  const [workItemsByStatus, setWorkItemsByStatus] = useState({});

  const setWorkItemsGroupedByStatus = useCallback((workItems) => {
    const sortedWorkItemsByStatus = getWorkItemsGroupedByStatus(workItems);
    setWorkItemsByStatus(sortedWorkItemsByStatus);
  }, []);

  useEffect(() => {
    document.title = cyclesEnabled
      ? 'Floumy | Development'
      : 'Floumy | Active Work';

    async function fetchData() {
      try {
        setIsLoading(true);
        if (cyclesEnabled) {
          const activeCycle = await getActiveCycle(orgId, projectId);
          setActiveSprint(activeCycle);
          if (activeCycle && activeCycle.workItems.length > 0) {
            setWorkItemsGroupedByStatus(activeCycle.workItems);
          }
        } else {
          const workItems = await listOpenWorkItems(orgId, projectId);
          setActiveWorkItems(workItems);
          setWorkItemsGroupedByStatus(workItems);
        }
        setIsLoading(false);
      } catch (e) {
        console.error(e.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [orgId, projectId, cyclesEnabled, setWorkItemsGroupedByStatus]);

  const currentWorkItems = cyclesEnabled
    ? (activeCycle?.workItems ?? [])
    : activeWorkItems;

  function removeWorkItemsFromActiveSprint(workItemsToRemove) {
    if (cyclesEnabled) {
      const newWorkItems = activeCycle.workItems.filter(
        (wi) => !workItemsToRemove.some((w) => w.id === wi.id),
      );
      activeCycle.workItems = newWorkItems;
      setActiveSprint({ ...activeCycle });
      setWorkItemsGroupedByStatus(newWorkItems);
    } else {
      const newWorkItems = activeWorkItems.filter(
        (wi) => !workItemsToRemove.some((w) => w.id === wi.id),
      );
      setActiveWorkItems(newWorkItems);
      setWorkItemsGroupedByStatus(newWorkItems);
    }
  }

  function handleChangeSprint(workItemsToMove, newSprintId) {
    if (cyclesEnabled && activeCycle?.id === newSprintId) return;
    removeWorkItemsFromActiveSprint(workItemsToMove);
  }

  function updateWorkItemsStatus(workItemsToUpdate, status) {
    const source = cyclesEnabled ? activeCycle.workItems : activeWorkItems;
    const updatedWorkItems = source.map((workItem) => {
      if (workItemsToUpdate.some((w) => w.id === workItem.id)) {
        workItem.status = status;
        workItem.completedAt = null;
        if (status === 'done' || status === 'closed') {
          workItem.completedAt = new Date().toISOString();
        }
      }
      return workItem;
    });
    setWorkItemsGroupedByStatus(updatedWorkItems);
    if (cyclesEnabled) {
      setActiveSprint({ ...activeCycle, workItems: updatedWorkItems });
    } else {
      setActiveWorkItems(updatedWorkItems);
    }
  }

  function updateWorkItemsPriority(workItemsToUpdate, priority) {
    const source = cyclesEnabled ? activeCycle.workItems : activeWorkItems;
    const updatedWorkItems = source.map((workItem) => {
      if (workItemsToUpdate.some((w) => w.id === workItem.id)) {
        workItem.priority = priority;
      }
      return workItem;
    });
    setWorkItemsGroupedByStatus(updatedWorkItems);
    if (cyclesEnabled) {
      setActiveSprint({ ...activeCycle, workItems: updatedWorkItems });
    } else {
      setActiveWorkItems(updatedWorkItems);
    }
  }

  function updateWorkItemAssignee(workItemsToUpdate, assignee) {
    const source = cyclesEnabled ? activeCycle.workItems : activeWorkItems;
    const updatedWorkItems = source.map((workItem) => {
      if (workItemsToUpdate.some((wi) => wi.id === workItem.id)) {
        workItem.assignedTo = assignee.id === null ? undefined : assignee;
      }
      return workItem;
    });
    if (cyclesEnabled) {
      setActiveSprint({ ...activeCycle, workItems: updatedWorkItems });
    } else {
      setActiveWorkItems(updatedWorkItems);
    }
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
              <h2>{cyclesEnabled ? 'Active Sprint' : 'Active Work'}</h2>
            </CardHeader>
            <LoadingSpinnerBox />
          </Card>
        )}
        {!isLoading &&
          cyclesEnabled &&
          activeCycle &&
          activeCycle.workItems &&
          activeCycle.workItems.length > 0 && (
            <DevelopmentStats sprint={activeCycle} />
          )}
        <Row>
          <Col>
            {!isLoading &&
              ((cyclesEnabled && !activeCycle) ||
                (!cyclesEnabled && activeWorkItems.length === 0)) && (
                <Card>
                  <CardHeader>
                    <Row>
                      <Col sm={6}>
                        <h2 className="mb-0">
                          {cyclesEnabled ? 'Active Sprint' : 'Active Work'}
                        </h2>
                      </Col>
                    </Row>
                  </CardHeader>
                  <CardBody>
                    <div className="p-5 text-center">
                      <div className="mx-auto" style={{ maxWidth: '680px' }}>
                        {cyclesEnabled ? (
                          <>
                            <h3 className="mb-3">No active sprint</h3>
                            <p className="text-muted">
                              Start a sprint to begin tracking work in the
                              current cycle and keep your team focused on the
                              highest priorities.
                            </p>
                            <div className="my-4">
                              <Link
                                to={`/admin/orgs/${orgId}/projects/${projectId}/cycles/new`}
                                className="btn btn-primary"
                              >
                                Plan a Cycle
                              </Link>
                            </div>
                            <Row className="mt-4 text-left">
                              <Col md="6" className="mb-3">
                                <Card>
                                  <CardBody>
                                    <h5 className="mb-2">What is a Cycle?</h5>
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
                                      What is an Active Cycle?
                                    </h5>
                                    <p className="mb-0 text-sm text-muted">
                                      The currently running cycle where your
                                      team executes planned work and tracks
                                      daily progress.
                                    </p>
                                  </CardBody>
                                </Card>
                              </Col>
                            </Row>
                          </>
                        ) : (
                          <>
                            <h3 className="mb-3">No open work items</h3>
                            <p className="text-muted">
                              Create work items to track your team&apos;s
                              progress.
                            </p>
                            <div className="my-4">
                              <Link
                                to={`/admin/orgs/${orgId}/projects/${projectId}/work-item/new`}
                                className="btn btn-primary"
                              >
                                New Work Item
                              </Link>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}
            {((cyclesEnabled && activeCycle) ||
              (!cyclesEnabled && currentWorkItems.length > 0)) && (
              <Card>
                <CardHeader>
                  <Row>
                    <Col xs={12} sm={cyclesEnabled ? 10 : 12}>
                      {cyclesEnabled ? (
                        <>
                          <h3>
                            <a
                              href={`/admin/orgs/${orgId}/projects/${projectId}/cycles/edit/${activeCycle.id}`}
                            >
                              <span className="text-muted">
                                {formatDate(getSprintStartDate(activeCycle))} -{' '}
                                {formatDate(getSprintEndDate(activeCycle))}
                              </span>{' '}
                              | {activeCycle.title}
                            </a>
                          </h3>
                          <p className="text-muted mb-0">{activeCycle.goal}</p>
                        </>
                      ) : (
                        <h3 className="mb-0">Active Work</h3>
                      )}
                    </Col>
                    {cyclesEnabled && (
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
                            await completeCycle(
                              orgId,
                              projectId,
                              activeCycle.id,
                            );
                            navigate(
                              `/admin/orgs/${orgId}/projects/${projectId}/cycles`,
                            );
                          }}
                        >
                          Complete Cycle
                        </Button>
                      </Col>
                    )}
                  </Row>
                </CardHeader>
                <div className="pt-3">
                  {Object.keys(workItemsByStatus).length === 0 &&
                    !isLoading && (
                      <div className="text-center m-3">
                        <h3 className="">
                          {cyclesEnabled
                            ? `No work items found in this cycle. Add them `
                            : 'No open work items. Create one '}
                          <Link
                            to={
                              cyclesEnabled
                                ? `/admin/orgs/${orgId}/projects/${projectId}/cycles`
                                : `/admin/orgs/${orgId}/projects/${projectId}/work-item/new`
                            }
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
                        onChangeSprint={
                          cyclesEnabled ? handleChangeSprint : undefined
                        }
                        onChangeCycle={
                          cyclesEnabled ? handleChangeSprint : undefined
                        }
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
