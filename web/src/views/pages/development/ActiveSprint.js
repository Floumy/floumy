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
  completeSprint,
  getActiveSprint,
} from '../../../services/sprints/sprints.service';
import DevelopmentStats from './DevelopmentStats';
import WorkItemsList from '../backlog/WorkItemsList';
import { getWorkItemsGroupedByStatus } from '../../../services/utils/workItemUtils';

function ActiveSprint() {
  const { orgId, projectId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [activeSprint, setActiveSprint] = useState(null);
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
        const activeSprint = await getActiveSprint(orgId, projectId);
        setActiveSprint(activeSprint);
        if (activeSprint && activeSprint.workItems.length > 0) {
          setWorkItemsGroupedByStatus(activeSprint.workItems);
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
    activeSprint.workItems.forEach((workItem) => {
      if (!workItems.some((w) => w.id === workItem.id)) {
        newWorkItems.push(workItem);
      }
    });
    activeSprint.workItems = newWorkItems;
    setActiveSprint({ ...activeSprint });
    setWorkItemsGroupedByStatus(activeSprint.workItems);
  }

  function handleChangeSprint(workItems, newSprintId) {
    if (activeSprint.id === newSprintId) return;
    removeWorkItemsFromActiveSprint(workItems);
  }

  function updateWorkItemsStatus(workItems, status) {
    const updatedWorkItems = activeSprint.workItems.map((workItem) => {
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
    setActiveSprint({ ...activeSprint, workItems: updatedWorkItems });
  }

  function updateWorkItemsPriority(workItems, priority) {
    const updatedWorkItems = [];
    activeSprint.workItems.forEach((workItem) => {
      if (workItems.some((w) => w.id === workItem.id)) {
        workItem.priority = priority;
      }
      updatedWorkItems.push(workItem);
    });

    setWorkItemsGroupedByStatus(updatedWorkItems);
    setActiveSprint({ ...activeSprint, workItems: updatedWorkItems });
  }

  function updateWorkItemAssignee(workItems, assignee) {
    const updatedWorkItems = [];
    for (const workItem of activeSprint.workItems) {
      if (workItems.some((wi) => wi.id === workItem.id)) {
        workItem.assignedTo = assignee.id === null ? undefined : assignee;
      }
      updatedWorkItems.push(workItem);
    }
    setActiveSprint({ ...activeSprint, workItems: updatedWorkItems });
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
          activeSprint &&
          activeSprint.workItems &&
          activeSprint.workItems.length > 0 && (
            <DevelopmentStats sprint={activeSprint} />
          )}
        <Row>
          <Col>
            {!isLoading && !activeSprint && (
              <Card>
                <CardHeader>
                  <Row>
                    <Col sm={6}>
                      <h2 className="mb-0">Active Sprint</h2>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <div
                    style={{ maxWidth: '600px' }}
                    className="mx-auto font-italic"
                  >
                    <h3>Active Sprint</h3>
                    <p>
                      The active Sprint is the current period where your team is
                      actively working on tasks. They keep you focused on
                      immediate priorities and ensure steady progress. Review
                      your active sprint regularly to stay on track and adjust
                      as needed for optimal performance.
                      <br />
                      <Link
                        to={`/admin/orgs/${orgId}/projects/${projectId}/sprints`}
                        className="text-blue font-weight-bold"
                      >
                        Manage the Active Sprint
                      </Link>
                    </p>
                  </div>
                </CardBody>
              </Card>
            )}
            {activeSprint && (
              <Card>
                <CardHeader>
                  <Row>
                    <Col xs={12} sm={10}>
                      <h3>
                        <a
                          href={`/admin/orgs/${orgId}/projects/${projectId}/sprints/edit/${activeSprint.id}`}
                        >
                          <span className="text-muted">
                            {formatDate(getSprintStartDate(activeSprint))} -{' '}
                            {formatDate(getSprintEndDate(activeSprint))}
                          </span>{' '}
                          | {activeSprint.title}
                        </a>
                      </h3>
                      <p className="text-muted mb-0">{activeSprint.goal}</p>
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
                          await completeSprint(
                            orgId,
                            projectId,
                            activeSprint.id,
                          );
                          navigate(
                            `/admin/orgs/${orgId}/projects/${projectId}/sprints`,
                          );
                        }}
                      >
                        Complete Sprint
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
