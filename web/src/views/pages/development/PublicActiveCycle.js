import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Row,
} from 'reactstrap';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  formatDate,
  formatHyphenatedString,
  getSprintEndDate,
  getSprintStartDate,
  workItemStatusColorClassName,
} from '../../../services/utils/utils';
import { getPublicActiveCycle } from '../../../services/cycles/cycles.service';
import { getPublicProject } from '../../../services/projects/projects.service';
import { listPublicOpenWorkItems } from '../../../services/backlog/backlog.service';
import DevelopmentStats from './DevelopmentStats';
import PublicWorkItemsList from '../backlog/PublicWorkItemsList';
import { getWorkItemsGroupedByStatus } from '../../../services/utils/workItemUtils';

function PublicActiveSprint() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeCycle, setActiveSprint] = useState(null);
  const [activeWorkItems, setActiveWorkItems] = useState([]);
  const [workItemsByStatus, setWorkItemsByStatus] = useState({});
  const [cyclesEnabled, setCyclesEnabled] = useState(true);
  const { orgId, projectId } = useParams();

  const setWorkItemsGroupedByStatus = useCallback((workItems) => {
    const sortedWorkItemsByStatus = getWorkItemsGroupedByStatus(workItems);
    setWorkItemsByStatus(sortedWorkItemsByStatus);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const project = await getPublicProject(orgId, projectId).catch(
          () => null,
        );
        const cyclesEnabledForProject = project?.cyclesEnabled ?? true;
        setCyclesEnabled(cyclesEnabledForProject);
        document.title = cyclesEnabledForProject
          ? 'Floumy | Development'
          : 'Floumy | Active Work';

        if (cyclesEnabledForProject) {
          const activeCycleData = await getPublicActiveCycle(
            orgId,
            projectId,
          ).catch(() => null);
          setActiveSprint(activeCycleData);
          if (activeCycleData && activeCycleData.workItems?.length > 0) {
            setWorkItemsGroupedByStatus(activeCycleData.workItems);
          }
        } else {
          const workItems = await listPublicOpenWorkItems(
            orgId,
            projectId,
          ).catch(() => []);
          setActiveWorkItems(workItems);
          setWorkItemsGroupedByStatus(workItems);
        }
      } catch (e) {
        console.error(e.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [orgId, projectId, setWorkItemsGroupedByStatus]);

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader />
      <Container className="mt--6" fluid id="OKRs">
        {isLoading && (
          <Card>
            <CardHeader>
              <h3>{cyclesEnabled ? 'Active Cycle' : 'Active Work'}</h3>
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
              (cyclesEnabled ? !activeCycle : activeWorkItems.length === 0) && (
                <Card>
                  <CardHeader>
                    <Row>
                      <Col sm={6}>
                        <h3 className="mb-0">
                          {cyclesEnabled ? 'Active Cycle' : 'Active Work'}
                        </h3>
                      </Col>
                    </Row>
                  </CardHeader>
                  <div className="p-5 text-center">
                    <div className="mx-auto" style={{ maxWidth: '680px' }}>
                      {cyclesEnabled ? (
                        <>
                          <h3 className="mb-3">No active cycle yet</h3>
                          <p className="text-muted">
                            The active cycle will appear here once it starts.
                          </p>
                          <Row className="mt-4 text-left">
                            <Col md="6" className="mb-3">
                              <Card>
                                <CardBody>
                                  <h5 className="mb-2">What is a Sprint?</h5>
                                  <p className="mb-0 text-sm text-muted">
                                    A fixed timeframe where the team focuses on
                                    a set of prioritized work items.
                                  </p>
                                </CardBody>
                              </Card>
                            </Col>
                            <Col md="6" className="mb-3">
                              <Card>
                                <CardBody>
                                  <h5 className="mb-2">What is a Work Item?</h5>
                                  <p className="mb-0 text-sm text-muted">
                                    A task, bug, or story tracked within a
                                    sprint to deliver value incrementally.
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
                            There are no open work items to display.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            {((cyclesEnabled && activeCycle) ||
              (!cyclesEnabled && activeWorkItems.length > 0)) && (
              <Card>
                <CardHeader>
                  <Row>
                    <Col xs={12}>
                      {cyclesEnabled ? (
                        <>
                          <h3>
                            <span className="text-muted">
                              {formatDate(getSprintStartDate(activeCycle))} -{' '}
                              {formatDate(getSprintEndDate(activeCycle))}
                            </span>{' '}
                            | {activeCycle.title}
                          </h3>
                          <p className="text-muted mb-0">{activeCycle.goal}</p>
                        </>
                      ) : (
                        <h3 className="mb-0">Active Work</h3>
                      )}
                    </Col>
                  </Row>
                </CardHeader>
                <div className="pt-3">
                  {Object.keys(workItemsByStatus).length === 0 &&
                    !isLoading && (
                      <div className="text-center mb-3">
                        {cyclesEnabled
                          ? 'No work items found in this sprint.'
                          : 'No open work items.'}
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
                      <PublicWorkItemsList
                        orgId={orgId}
                        workItems={workItemsByStatus[status]}
                        showInitiative={true}
                        headerClassName={'thead'}
                        showStatus={false}
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

export default PublicActiveSprint;
