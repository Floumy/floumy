import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Container,
  Row,
} from 'reactstrap';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import React, { useEffect, useState } from 'react';
import Select2 from 'react-select2-wrapper';
import WorkItemsList from '../backlog/WorkItemsList';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  listCyclesWithWorkItemsForTimeline,
  startCycle,
} from '../../../services/cycles/cycles.service';
import {
  formatDate,
  formatTimeline,
  getCycleEndDate,
  getCycleStartDate,
  sortByPriority,
} from '../../../services/utils/utils';
import {
  addWorkItem,
  listOpenWorkItems,
} from '../../../services/backlog/backlog.service';
import { useHotkeys } from 'react-hotkeys-hook';
import WorkItemsListCard from '../backlog/WorkItemsListCard';

function Cycles() {
  const { orgId, projectId } = useParams();
  let location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const timelineQueryFilter = searchParams.get('timeline');
  const [isLoadingCycles, setIsLoadingCycles] = useState(false);
  const [isLoadingWorkItems, setIsLoadingWorkItems] = useState(false);
  const [timelineFilterValue, setTimelineFilterValue] = useState(
    timelineQueryFilter || 'this-quarter',
  );
  const [cycles, setCycles] = useState([]);
  const [backlogWorkItems, setBacklogWorkItems] = useState([]);
  const [showWorkItems, setShowWorkItems] = useState({});
  const navigate = useNavigate();

  // on b hotkey press scroll to the initiatives backlog section
  useHotkeys('b', () => {
    document.getElementById('work-items-backlog').scrollIntoView();
  });

  useEffect(() => {
    document.title = 'Floumy | Cycles';

    async function fetchCycles() {
      setIsLoadingCycles(true);
      try {
        const cycles = await listCyclesWithWorkItemsForTimeline(
          orgId,
          projectId,
          timelineFilterValue,
        );
        setCycles(cycles);
        const showItems = {};
        cycles.forEach((cycle) => {
          showItems[cycle.id] = true;
        });
        setShowWorkItems(showItems);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingCycles(false);
      }
    }

    fetchCycles();
  }, [orgId, projectId, timelineFilterValue]);

  useEffect(() => {
    async function fetchBacklogWorkItems() {
      try {
        setIsLoadingWorkItems(true);
        const workItems = await listOpenWorkItems(orgId, projectId);
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

  async function start(orgId, projectId, cycleId) {
    try {
      await startCycle(orgId, projectId, cycleId);
      navigate(`/admin/orgs/${orgId}/projects/${projectId}/active-cycle`);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAddWorkItemToBacklog(workItem) {
    const savedWorkItem = await addWorkItem(orgId, projectId, workItem);
    backlogWorkItems.push(savedWorkItem);
    sortByPriority(backlogWorkItems);
    setBacklogWorkItems([...backlogWorkItems]);
  }

  function estimationTotal(workItems) {
    let total = 0;
    workItems.forEach((workItem) => {
      if (workItem.estimation) {
        total += workItem.estimation;
      }
    });

    return total;
  }

  function moveWorkItemsToCycle(workItems, newCycleId) {
    const newCycle = cycles.find((cycle) => cycle.id === newCycleId);
    if (!newCycle) {
      return;
    }

    workItems.forEach((workItem) => {
      workItem.cycle = {
        id: newCycle.id,
      };
      newCycle.workItems.push(workItem);
    });
    sortByPriority(newCycle.workItems);
    setCycles([...cycles]);
  }

  function removeWorkItemsFromBacklog(workItems) {
    const newBacklogWorkItems = [];
    backlogWorkItems.forEach((workItem) => {
      if (!workItems.some((w) => w.id === workItem.id)) {
        newBacklogWorkItems.push(workItem);
      }
    });
    setBacklogWorkItems(newBacklogWorkItems);
  }

  function moveWorkItemsFromBacklogToCycle(workItems, newCycleId) {
    if (newCycleId) {
      moveWorkItemsToCycle(workItems, newCycleId);
    }
    removeWorkItemsFromBacklog(workItems);
  }

  function moveWorkItemsToBacklog(workItems) {
    workItems.forEach((workItem) => {
      workItem.cycle = null;
      backlogWorkItems.push(workItem);
    });
    setBacklogWorkItems([...backlogWorkItems]);
  }

  function removeWorkItemsFromCycle(workItems, oldCycleId) {
    const oldCycle = cycles.find((cycle) => cycle.id === oldCycleId);
    if (!oldCycle) {
      return;
    }

    const newWorkItems = [];
    oldCycle.workItems.forEach((workItem) => {
      workItem.cycle = null;
      if (!workItems.some((w) => w.id === workItem.id)) {
        newWorkItems.push(workItem);
      }
    });
    oldCycle.workItems = newWorkItems;
    sortByPriority(oldCycle.workItems);
    setCycles([...cycles]);
  }

  function moveWorkItemsFromCycleToBacklog(workItems) {
    const oldCycleId = workItems[0].cycle.id;
    if (oldCycleId) {
      removeWorkItemsFromCycle(workItems, oldCycleId);
    }

    moveWorkItemsToBacklog(workItems);
  }

  function moveWorkItemsFromOldCycleToNewCycle(workItems, newCycleId) {
    const oldCycleId = workItems[0].cycle.id;
    if (oldCycleId) {
      removeWorkItemsFromCycle(workItems, oldCycleId);
    }

    moveWorkItemsToCycle(workItems, newCycleId);
  }

  function handleChangeWorkItemsCycle(workItems, newCycleId) {
    const backlogWorkItems = workItems.filter((workItem) => !workItem.cycle);
    if (backlogWorkItems.length > 0) {
      return moveWorkItemsFromBacklogToCycle(backlogWorkItems, newCycleId);
    }

    if (newCycleId === null) {
      return moveWorkItemsFromCycleToBacklog(workItems);
    }

    // Add the work item to the new cycle
    moveWorkItemsFromOldCycleToNewCycle(workItems, newCycleId);
  }

  function updateWorkItemsStatusInCycle(workItems, status, cycleId) {
    const cycle = cycles.find((c) => c.id === cycleId);
    const updatedWorkItems = [];
    for (const workItem of cycle.workItems) {
      if (workItems.some((wi) => wi.id === workItem.id)) {
        workItem.status = status;
      }
      updatedWorkItems.push(workItem);
    }
    cycle.workItems = updatedWorkItems;
    setCycles([...cycles]);
  }

  function updateWorkItemsStatusInBacklog(workItems, status) {
    if (status === 'done' || status === 'closed') {
      return removeWorkItemsFromBacklog(workItems);
    }

    const updatedWorkItems = [];
    for (const workItem of backlogWorkItems) {
      if (workItems.some((wi) => wi.id === workItem.id)) {
        workItem.status = status;
      }
      updatedWorkItems.push(workItem);
    }
    setBacklogWorkItems(updatedWorkItems);
  }

  function updateWorkItemsPriorityInCycle(workItems, priority, cycleId) {
    const cycle = cycles.find((c) => c.id === cycleId);
    const updatedWorkItems = [];
    for (const workItem of cycle.workItems) {
      if (workItems.some((wi) => wi.id === workItem.id)) {
        workItem.priority = priority;
      }
      updatedWorkItems.push(workItem);
    }
    cycle.workItems = updatedWorkItems;
    setCycles([...cycles]);
  }

  function updateWorkItemAssigneeInCycle(workItems, assignee, cycleId) {
    const cycle = cycles.find((c) => c.id === cycleId);
    const updatedWorkItems = [];
    for (const workItem of cycle.workItems) {
      if (workItems.some((wi) => wi.id === workItem.id)) {
        workItem.assignedTo = assignee.id === null ? undefined : assignee;
      }
      updatedWorkItems.push(workItem);
    }
    cycle.workItems = updatedWorkItems;
    setCycles([...cycles]);
  }

  function updateWorkItemsPriorityInBacklog(workItems, priority) {
    const updatedWorkItems = [];
    for (const workItem of backlogWorkItems) {
      if (workItems.some((wi) => wi.id === workItem.id)) {
        workItem.priority = priority;
      }
      updatedWorkItems.push(workItem);
    }
    sortByPriority(updatedWorkItems);
    setBacklogWorkItems([...updatedWorkItems]);
  }

  function updateWorkItemAssigneeInBacklog(workItems, assignee) {
    const updatedWorkItems = [];
    for (const workItem of backlogWorkItems) {
      if (workItems.some((wi) => wi.id === workItem.id)) {
        workItem.assignedTo = assignee.id === null ? undefined : assignee;
      }
      updatedWorkItems.push(workItem);
    }
    setBacklogWorkItems([...updatedWorkItems]);
  }

  function deleteWorkItemsFromCycle(deletedWorkItems, cycleId) {
    const cycle = cycles.find((c) => c.id === cycleId);
    if (!cycle) return;

    const deletedIds = deletedWorkItems.map((wi) => wi.id);
    cycle.workItems = cycle.workItems.filter(
      (wi) => !deletedIds.includes(wi.id),
    );
    setCycles([...cycles]);
  }

  function deleteWorkItemsFromBacklog(deletedWorkItems) {
    const deletedIds = deletedWorkItems.map((wi) => wi.id);
    setBacklogWorkItems(
      backlogWorkItems.filter((wi) => !deletedIds.includes(wi.id)),
    );
  }

  return (
    <>
      {isLoadingCycles && <InfiniteLoadingBar />}
      <SimpleHeader
        headerButtons={[
          {
            name: 'New Cycle',
            shortcut: 's',
            id: 'new-cycle',
            action: () => {
              navigate(`/admin/orgs/${orgId}/projects/${projectId}/cycles/new`);
            },
          },
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
        <Row>
          <Col>
            <Card className="mb-5">
              <CardHeader>
                <Row>
                  <Col xs={12} sm={8}>
                    <CardTitle tag="h2">Cycles</CardTitle>
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
                      value={timelineFilterValue}
                      onSelect={(e) => {
                        setTimelineFilterValue(e.params.data.id);
                        navigate(`?timeline=${e.params.data.id}`);
                      }}
                    ></Select2>
                  </Col>
                </Row>
              </CardHeader>
              <div className="p-4">
                {!isLoadingCycles &&
                  cycles.length === 0 &&
                  timelineFilterValue !== 'past' && (
                    <div className="p-5 text-center">
                      <div className="mx-auto" style={{ maxWidth: '680px' }}>
                        <h3 className="mb-3">
                          No cycles for{' '}
                          {formatTimeline(timelineFilterValue).toLowerCase()}{' '}
                          yet
                        </h3>
                        <p className="text-muted">
                          Plan a cycle to focus your team and deliver
                          incremental progress on your work items.
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
                                <h5 className="mb-2">What is a Work Item?</h5>
                                <p className="mb-0 text-sm text-muted">
                                  A task or unit of work that helps break
                                  features into manageable steps.
                                </p>
                              </CardBody>
                            </Card>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  )}
                {!isLoadingCycles &&
                  cycles.length === 0 &&
                  timelineFilterValue === 'past' && (
                    <div className="p-5 text-center">
                      <div className="mx-auto" style={{ maxWidth: '680px' }}>
                        <h3 className="mb-3">No cycles in the past</h3>
                        <p className="text-muted mb-0">
                          There are no cycles recorded for past timelines.
                        </p>
                      </div>
                    </div>
                  )}
                {cycles.length > 0 &&
                  !isLoadingCycles &&
                  cycles.map((cycle) => (
                    <div key={cycle.id} className="mb-5">
                      <Row className="pl-4 pt-2 pr-4">
                        <Col>
                          <h3 className="mb-0">
                            <button
                              onClick={() => {
                                const displayWorkItems = showWorkItems;
                                displayWorkItems[cycle.id] =
                                  !displayWorkItems[cycle.id];
                                setShowWorkItems({ ...displayWorkItems });
                              }}
                              className="btn btn-sm btn-outline-light shadow-none shadow-none--hover pt-1 pb-0 pl-2 pr-2"
                            >
                              {!showWorkItems[cycle.id] && (
                                <i className="ni ni-bold-right" />
                              )}
                              {showWorkItems[cycle.id] && (
                                <i className="ni ni-bold-down" />
                              )}
                            </button>
                            <Link
                              to={`/admin/orgs/${orgId}/projects/${projectId}/cycles/edit/${cycle.id}`}
                              className="mr-2"
                            >
                              <span className="text-muted">
                                {formatDate(getCycleStartDate(cycle))} -{' '}
                                {formatDate(getCycleEndDate(cycle))}
                              </span>{' '}
                              | {cycle.title}
                            </Link>
                            {cycle.status === 'active' && (
                              <span className="badge badge-info">Active</span>
                            )}
                            {cycle.status === 'completed' && (
                              <span className="badge badge-success">
                                Completed
                              </span>
                            )}
                            {cycle.status === 'planned' && (
                              <button
                                onClick={async () => {
                                  await start(orgId, projectId, cycle.id);
                                }}
                                className="btn btn-sm btn-outline-primary mr-0"
                              >
                                Start Cycle
                              </button>
                            )}
                          </h3>
                        </Col>
                      </Row>
                      <Row className="pl-4 pr-4">
                        <Col>
                          <span className="text-muted text-sm p-0 m-0">
                            Work Items Count: {cycle.workItems.length},
                            Estimated Effort: {estimationTotal(cycle.workItems)}
                          </span>
                        </Col>
                      </Row>
                      {cycle.goal && (
                        <Row className="pl-4 pr-4">
                          <Col>
                            <div className="text-muted mb-0 text-sm">
                              Goal: {cycle.goal}
                            </div>
                          </Col>
                        </Row>
                      )}
                      {cycle.status === 'completed' && (
                        <div hidden={!showWorkItems[cycle.id]}>
                          <CardBody className="pb-2 pt-2 font-italic">
                            <Row>
                              <Col className="text-sm">
                                Completed Work Items
                              </Col>
                            </Row>
                          </CardBody>
                          <WorkItemsList
                            id={'completed-' + cycle.id}
                            showAssignedTo={true}
                            workItems={sortByPriority(
                              cycle.workItems.filter(
                                (workItem) =>
                                  workItem.status === 'done' ||
                                  workItem.status === 'closed',
                              ),
                            )}
                            headerClassName={'thead'}
                            onChangeCycle={handleChangeWorkItemsCycle}
                            onChangeStatus={(workItems, status) => {
                              updateWorkItemsStatusInCycle(
                                workItems,
                                status,
                                cycle.id,
                              );
                            }}
                            onChangePriority={(workItems, priority) => {
                              updateWorkItemsPriorityInCycle(
                                workItems,
                                priority,
                                cycle.id,
                              );
                            }}
                            onChangeAssignee={(workItems, assignee) => {
                              updateWorkItemAssigneeInCycle(
                                workItems,
                                assignee,
                                cycle.id,
                              );
                            }}
                            onDelete={(deletedWorkItems) => {
                              deleteWorkItemsFromCycle(
                                deletedWorkItems,
                                cycle.id,
                              );
                            }}
                          />
                          <CardBody className="pt-2 pb-2 font-italic">
                            <Row>
                              <Col className="text-sm">
                                Unfinished Work Items
                              </Col>
                            </Row>
                          </CardBody>
                          <WorkItemsList
                            id={'unfinished-' + cycle.id}
                            showAssignedTo={true}
                            workItems={sortByPriority(
                              cycle.workItems.filter(
                                (workItem) =>
                                  workItem.status !== 'done' &&
                                  workItem.status !== 'closed',
                              ),
                            )}
                            headerClassName={'thead'}
                            onChangeCycle={handleChangeWorkItemsCycle}
                            onChangeStatus={(workItems, status) => {
                              updateWorkItemsStatusInCycle(
                                workItems,
                                status,
                                cycle.id,
                              );
                            }}
                            onChangePriority={(workItems, priority) => {
                              updateWorkItemsPriorityInCycle(
                                workItems,
                                priority,
                                cycle.id,
                              );
                            }}
                            onChangeAssignee={(workItems, assignee) => {
                              updateWorkItemAssigneeInCycle(
                                workItems,
                                assignee,
                                cycle.id,
                              );
                            }}
                            onDelete={(deletedWorkItems) => {
                              deleteWorkItemsFromCycle(
                                deletedWorkItems,
                                cycle.id,
                              );
                            }}
                          />
                        </div>
                      )}
                      {cycle.status !== 'completed' && (
                        <div className="pt-2" hidden={!showWorkItems[cycle.id]}>
                          <WorkItemsList
                            id={cycle.id}
                            showAssignedTo={true}
                            workItems={sortByPriority(cycle.workItems)}
                            headerClassName={'thead'}
                            onChangeCycle={handleChangeWorkItemsCycle}
                            onChangeStatus={(workItems, status) => {
                              updateWorkItemsStatusInCycle(
                                workItems,
                                status,
                                cycle.id,
                              );
                            }}
                            onChangePriority={(workItems, priority) => {
                              updateWorkItemsPriorityInCycle(
                                workItems,
                                priority,
                                cycle.id,
                              );
                            }}
                            onChangeAssignee={(workItems, assignee) => {
                              updateWorkItemAssigneeInCycle(
                                workItems,
                                assignee,
                                cycle.id,
                              );
                            }}
                            onDelete={(deletedWorkItems) => {
                              deleteWorkItemsFromCycle(
                                deletedWorkItems,
                                cycle.id,
                              );
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
              {isLoadingCycles && <LoadingSpinnerBox />}
            </Card>
            <div id={'work-items-backlog'} />
            <WorkItemsListCard
              id={'backlog'}
              workItems={backlogWorkItems}
              title={'Backlog'}
              isLoading={isLoadingWorkItems}
              onAddWorkItem={handleAddWorkItemToBacklog}
              onChangeCycle={handleChangeWorkItemsCycle}
              onChangeStatus={(workItems, status) => {
                updateWorkItemsStatusInBacklog(workItems, status);
              }}
              onChangePriority={(workItems, priority) => {
                updateWorkItemsPriorityInBacklog(workItems, priority);
              }}
              onChangeAssignee={(workItems, assignee) => {
                updateWorkItemAssigneeInBacklog(workItems, assignee);
              }}
              onDelete={deleteWorkItemsFromBacklog}
              extraButtonLabel={'All Work Items'}
              extraButtonId={'all-work-items-backlog'}
              onExtraButtonClick={() => {
                navigate(
                  `/admin/orgs/${orgId}/projects/${projectId}/work-items`,
                );
              }}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Cycles;
