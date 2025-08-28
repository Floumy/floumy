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
  listSprintsWithWorkItemsForTimeline,
  startSprint,
} from '../../../services/sprints/sprints.service';
import {
  formatDate,
  getSprintEndDate,
  getSprintStartDate,
  sortByPriority,
} from '../../../services/utils/utils';
import {
  addWorkItem,
  listOpenWorkItems,
} from '../../../services/backlog/backlog.service';
import { useHotkeys } from 'react-hotkeys-hook';
import WorkItemsListCard from '../backlog/WorkItemsListCard';

function Sprints() {
  const { orgId, projectId } = useParams();
  let location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const timelineQueryFilter = searchParams.get('timeline');
  const [isLoadingSprints, setIsLoadingSprints] = useState(false);
  const [isLoadingWorkItems, setIsLoadingWorkItems] = useState(false);
  const [timelineFilterValue, setTimelineFilterValue] = useState(
    timelineQueryFilter || 'this-quarter',
  );
  const [sprints, setSprints] = useState([]);
  const [backlogWorkItems, setBacklogWorkItems] = useState([]);
  const [showWorkItems, setShowWorkItems] = useState({});
  const navigate = useNavigate();

  // on b hotkey press scroll to the initiatives backlog section
  useHotkeys('b', () => {
    document.getElementById('work-items-backlog').scrollIntoView();
  });

  useEffect(() => {
    document.title = 'Floumy | Sprints';

    async function fetchSprints() {
      setIsLoadingSprints(true);
      try {
        const sprints = await listSprintsWithWorkItemsForTimeline(
          orgId,
          projectId,
          timelineFilterValue,
        );
        setSprints(sprints);
        const showItems = {};
        sprints.forEach((sprint) => {
          showItems[sprint.id] = true;
        });
        setShowWorkItems(showItems);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingSprints(false);
      }
    }

    fetchSprints();
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

  async function start(orgId, projectId, sprintId) {
    try {
      await startSprint(orgId, projectId, sprintId);
      navigate(`/admin/orgs/${orgId}/projects/${projectId}/active-sprint`);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAddWorkItemWithSprint(workItem, sprintId) {
    workItem.sprint = sprintId;
    const savedWorkItem = await addWorkItem(orgId, projectId, workItem);
    const workItems = sprints.find(
      (sprint) => sprint.id === sprintId,
    ).workItems;
    workItems.push(savedWorkItem);
    sortByPriority(workItems);
    setSprints([...sprints]);
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

  function moveWorkItemsToSprint(workItems, newSprintId) {
    const newSprint = sprints.find((sprint) => sprint.id === newSprintId);
    if (!newSprint) {
      return;
    }

    workItems.forEach((workItem) => {
      workItem.sprint = {
        id: newSprint.id,
      };
      newSprint.workItems.push(workItem);
    });
    sortByPriority(newSprint.workItems);
    setSprints([...sprints]);
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

  function moveWorkItemsFromBacklogToSprint(workItems, newSprintId) {
    if (newSprintId) {
      moveWorkItemsToSprint(workItems, newSprintId);
    }
    removeWorkItemsFromBacklog(workItems);
  }

  function moveWorkItemsToBacklog(workItems) {
    workItems.forEach((workItem) => {
      workItem.sprint = null;
      backlogWorkItems.push(workItem);
    });
    setBacklogWorkItems([...backlogWorkItems]);
  }

  function removeWorkItemsFromSprint(workItems, oldSprintId) {
    const oldSprint = sprints.find((sprint) => sprint.id === oldSprintId);
    if (!oldSprint) {
      return;
    }

    const newWorkItems = [];
    oldSprint.workItems.forEach((workItem) => {
      workItem.sprint = null;
      if (!workItems.some((w) => w.id === workItem.id)) {
        newWorkItems.push(workItem);
      }
    });
    oldSprint.workItems = newWorkItems;
    sortByPriority(oldSprint.workItems);
    setSprints([...sprints]);
  }

  function moveWorkItemsFromSprintToBacklog(workItems) {
    const oldSprintId = workItems[0].sprint.id;
    if (oldSprintId) {
      removeWorkItemsFromSprint(workItems, oldSprintId);
    }

    moveWorkItemsToBacklog(workItems);
  }

  function moveWorkItemsFromOldSprintToNewSprint(workItems, newSprintId) {
    const oldSprintId = workItems[0].sprint.id;
    if (oldSprintId) {
      removeWorkItemsFromSprint(workItems, oldSprintId);
    }

    moveWorkItemsToSprint(workItems, newSprintId);
  }

  function handleChangeWorkItemsSprint(workItems, newSprintId) {
    const backlogWorkItems = workItems.filter((workItem) => !workItem.sprint);
    if (backlogWorkItems.length > 0) {
      return moveWorkItemsFromBacklogToSprint(backlogWorkItems, newSprintId);
    }

    if (newSprintId === null) {
      return moveWorkItemsFromSprintToBacklog(workItems);
    }

    // Add the work item to the new sprint
    moveWorkItemsFromOldSprintToNewSprint(workItems, newSprintId);
  }

  function updateWorkItemsStatusInSprint(workItems, status, sprintId) {
    const sprint = sprints.find((sprint) => sprint.id === sprintId);
    const updatedWorkItems = [];
    for (const workItem of sprint.workItems) {
      if (workItems.some((wi) => wi.id === workItem.id)) {
        workItem.status = status;
      }
      updatedWorkItems.push(workItem);
    }
    sprint.workItems = updatedWorkItems;
    setSprints([...sprints]);
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

  function updateWorkItemsPriorityInSprint(workItems, priority, sprintId) {
    const sprint = sprints.find((sprint) => sprint.id === sprintId);
    const updatedWorkItems = [];
    for (const workItem of sprint.workItems) {
      if (workItems.some((wi) => wi.id === workItem.id)) {
        workItem.priority = priority;
      }
      updatedWorkItems.push(workItem);
    }
    sprint.workItems = updatedWorkItems;
    setSprints([...sprints]);
  }

  function updateWorkItemAssigneeInSprint(workItems, assignee, sprintId) {
    const sprint = sprints.find((sprint) => sprint.id === sprintId);
    const updatedWorkItems = [];
    for (const workItem of sprint.workItems) {
      if (workItems.some((wi) => wi.id === workItem.id)) {
        workItem.assignedTo = assignee.id === null ? undefined : assignee;
      }
      updatedWorkItems.push(workItem);
    }
    sprint.workItems = updatedWorkItems;
    setSprints([...sprints]);
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

  function deleteWorkItemsFromSprint(deletedWorkItems, sprintId) {
    const sprint = sprints.find((sprint) => sprint.id === sprintId);
    if (!sprint) return;

    const deletedIds = deletedWorkItems.map((wi) => wi.id);
    sprint.workItems = sprint.workItems.filter(
      (wi) => !deletedIds.includes(wi.id),
    );
    setSprints([...sprints]);
  }

  function deleteWorkItemsFromBacklog(deletedWorkItems) {
    const deletedIds = deletedWorkItems.map((wi) => wi.id);
    setBacklogWorkItems(
      backlogWorkItems.filter((wi) => !deletedIds.includes(wi.id)),
    );
  }

  return (
    <>
      {isLoadingSprints && <InfiniteLoadingBar />}
      <SimpleHeader
        headerButtons={[
          {
            name: 'New Sprint',
            shortcut: 's',
            id: 'new-sprint',
            action: () => {
              navigate(
                `/admin/orgs/${orgId}/projects/${projectId}/sprints/new`,
              );
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
          {
            name: 'All Work Items',
            id: 'all-work-items',
            action: () => {
              navigate(`/admin/orgs/${orgId}/projects/${projectId}/work-items`);
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
                    <CardTitle tag="h2">Sprints</CardTitle>
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
                {sprints.length === 0 && !isLoadingSprints && (
                  <div
                    style={{ maxWidth: '600px' }}
                    className="mx-auto font-italic"
                  >
                    <h3>Sprints</h3>
                    <p>
                      Sprints are short, time-boxed periods during which your
                      team works to complete specific work items. They help you
                      deliver incremental progress and adapt quickly to changes.
                      Plan your sprints to maintain a steady development pace
                      and ensure continuous improvement.
                      <br />
                      <Link
                        to={`/admin/orgs/${orgId}/projects/${projectId}/sprints/new`}
                        className="text-blue font-weight-bold"
                      >
                        Plan a Sprint
                      </Link>
                    </p>
                    <h3>Work Items</h3>
                    <p>
                      Work Items are the tasks and activities that need to be
                      completed to develop your features. They break down the
                      work into manageable chunks, making it easier to track
                      progress and stay organized. Create work items to keep
                      your team aligned and projective.
                      <br />
                      <Link
                        to={`/admin/orgs/${orgId}/projects/${projectId}/work-item/new`}
                        className="text-blue font-weight-bold"
                      >
                        Create a Work Item
                      </Link>
                    </p>
                  </div>
                )}
                {sprints.length > 0 &&
                  !isLoadingSprints &&
                  sprints.map((sprint) => (
                    <div key={sprint.id} className="mb-5">
                      <Row className="pl-4 pt-2 pr-4">
                        <Col>
                          <h3 className="mb-0">
                            <button
                              onClick={() => {
                                const displayWorkItems = showWorkItems;
                                displayWorkItems[sprint.id] =
                                  !displayWorkItems[sprint.id];
                                setShowWorkItems({ ...displayWorkItems });
                              }}
                              className="btn btn-sm btn-outline-light shadow-none shadow-none--hover pt-1 pb-0 pl-2 pr-2"
                            >
                              {!showWorkItems[sprint.id] && (
                                <i className="ni ni-bold-right" />
                              )}
                              {showWorkItems[sprint.id] && (
                                <i className="ni ni-bold-down" />
                              )}
                            </button>
                            <Link
                              to={`/admin/orgs/${orgId}/projects/${projectId}/sprints/edit/${sprint.id}`}
                              className="mr-2"
                            >
                              <span className="text-muted">
                                {formatDate(getSprintStartDate(sprint))} -{' '}
                                {formatDate(getSprintEndDate(sprint))}
                              </span>{' '}
                              | {sprint.title}
                            </Link>
                            {sprint.status === 'active' && (
                              <span className="badge badge-info">Active</span>
                            )}
                            {sprint.status === 'completed' && (
                              <span className="badge badge-success">
                                Completed
                              </span>
                            )}
                            {sprint.status === 'planned' && (
                              <button
                                onClick={async () => {
                                  await start(orgId, projectId, sprint.id);
                                }}
                                className="btn btn-sm btn-outline-primary mr-0"
                              >
                                Start Sprint
                              </button>
                            )}
                          </h3>
                        </Col>
                      </Row>
                      <Row className="pl-4 pr-4">
                        <Col>
                          <span className="text-muted text-sm p-0 m-0">
                            Work Items Count: {sprint.workItems.length},
                            Estimated Effort:{' '}
                            {estimationTotal(sprint.workItems)}
                          </span>
                        </Col>
                      </Row>
                      {sprint.goal && (
                        <Row className="pl-4 pr-4">
                          <Col>
                            <div className="text-muted mb-0 text-sm">
                              Goal: {sprint.goal}
                            </div>
                          </Col>
                        </Row>
                      )}
                      {sprint.status === 'completed' && (
                        <div hidden={!showWorkItems[sprint.id]}>
                          <CardBody className="pb-2 pt-2 font-italic">
                            <Row>
                              <Col className="text-sm">
                                Completed Work Items
                              </Col>
                            </Row>
                          </CardBody>
                          <WorkItemsList
                            id={'completed-' + sprint.id}
                            showAssignedTo={true}
                            workItems={sortByPriority(
                              sprint.workItems.filter(
                                (workItem) =>
                                  workItem.status === 'done' ||
                                  workItem.status === 'closed',
                              ),
                            )}
                            headerClassName={'thead'}
                            onChangeSprint={handleChangeWorkItemsSprint}
                            onChangeStatus={(workItems, status) => {
                              updateWorkItemsStatusInSprint(
                                workItems,
                                status,
                                sprint.id,
                              );
                            }}
                            onChangePriority={(workItems, priority) => {
                              updateWorkItemsPriorityInSprint(
                                workItems,
                                priority,
                                sprint.id,
                              );
                            }}
                            onChangeAssignee={(workItems, assignee) => {
                              updateWorkItemAssigneeInSprint(
                                workItems,
                                assignee,
                                sprint.id,
                              );
                            }}
                            onDelete={(deletedWorkItems) => {
                              deleteWorkItemsFromSprint(
                                deletedWorkItems,
                                sprint.id,
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
                            id={'unfinished-' + sprint.id}
                            showAssignedTo={true}
                            workItems={sortByPriority(
                              sprint.workItems.filter(
                                (workItem) =>
                                  workItem.status !== 'done' &&
                                  workItem.status !== 'closed',
                              ),
                            )}
                            headerClassName={'thead'}
                            onChangeSprint={handleChangeWorkItemsSprint}
                            onChangeStatus={(workItems, status) => {
                              updateWorkItemsStatusInSprint(
                                workItems,
                                status,
                                sprint.id,
                              );
                            }}
                            onChangePriority={(workItems, priority) => {
                              updateWorkItemsPriorityInSprint(
                                workItems,
                                priority,
                                sprint.id,
                              );
                            }}
                            onChangeAssignee={(workItems, assignee) => {
                              updateWorkItemAssigneeInSprint(
                                workItems,
                                assignee,
                                sprint.id,
                              );
                            }}
                            onDelete={(deletedWorkItems) => {
                              deleteWorkItemsFromSprint(
                                deletedWorkItems,
                                sprint.id,
                              );
                            }}
                          />
                        </div>
                      )}
                      {sprint.status !== 'completed' && (
                        <div
                          className="pt-2"
                          hidden={!showWorkItems[sprint.id]}
                        >
                          <WorkItemsList
                            id={sprint.id}
                            showAssignedTo={true}
                            workItems={sortByPriority(sprint.workItems)}
                            headerClassName={'thead'}
                            onAddNewWorkItem={async (workItem) => {
                              await handleAddWorkItemWithSprint(
                                workItem,
                                sprint.id,
                              );
                            }}
                            onChangeSprint={handleChangeWorkItemsSprint}
                            onChangeStatus={(workItems, status) => {
                              updateWorkItemsStatusInSprint(
                                workItems,
                                status,
                                sprint.id,
                              );
                            }}
                            onChangePriority={(workItems, priority) => {
                              updateWorkItemsPriorityInSprint(
                                workItems,
                                priority,
                                sprint.id,
                              );
                            }}
                            onChangeAssignee={(workItems, assignee) => {
                              updateWorkItemAssigneeInSprint(
                                workItems,
                                assignee,
                                sprint.id,
                              );
                            }}
                            onDelete={(deletedWorkItems) => {
                              deleteWorkItemsFromSprint(
                                deletedWorkItems,
                                sprint.id,
                              );
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
              {isLoadingSprints && <LoadingSpinnerBox />}
            </Card>
            <div id={'work-items-backlog'} />
            <WorkItemsListCard
              id={'backlog'}
              workItems={backlogWorkItems}
              title={'Backlog'}
              isLoading={isLoadingWorkItems}
              onAddWorkItem={handleAddWorkItemToBacklog}
              onChangeSprint={handleChangeWorkItemsSprint}
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

export default Sprints;
