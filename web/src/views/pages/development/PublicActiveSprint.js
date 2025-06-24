import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Badge, Card, CardHeader, Col, Container, Row } from 'reactstrap';
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
import { getPublicActiveSprint } from '../../../services/sprints/sprints.service';
import DevelopmentStats from './DevelopmentStats';
import PublicWorkItemsList from '../backlog/PublicWorkItemsList';
import PublicShareButtons from '../../../components/PublicShareButtons/PublicShareButtons';
import { getWorkItemsGroupedByStatus } from '../../../services/utils/workItemUtils';

function PublicActiveSprint() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeSprint, setActiveSprint] = useState(null);
  const [workItemsByStatus, setWorkItemsByStatus] = useState({});
  const { orgId, projectId } = useParams();

  const setWorkItemsGroupedByStatus = useCallback((workItems) => {
    const sortedWorkItemsByStatus = getWorkItemsGroupedByStatus(workItems);
    setWorkItemsByStatus(sortedWorkItemsByStatus);
  }, []);

  useEffect(() => {
    document.title = 'Floumy | Development';

    async function fetchData() {
      try {
        setIsLoading(true);
        const activeSprint = await getPublicActiveSprint(orgId, projectId);
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

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader />
      <Container className="mt--6" fluid id="OKRs">
        {isLoading && (
          <Card>
            <CardHeader>
              <h3>Active Sprint</h3>
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
                      <h3 className="mb-0">Active Sprint</h3>
                    </Col>
                  </Row>
                </CardHeader>
                <Row>
                  <Col sm={12}>
                    <h3 className="text-center pt-3 py-2">
                      No active sprint found.
                    </h3>
                  </Col>
                </Row>
              </Card>
            )}
            {activeSprint && (
              <Card>
                <CardHeader>
                  <Row>
                    <Col xs={12}>
                      <h3>
                        <span className="text-muted">
                          {formatDate(getSprintStartDate(activeSprint))} -{' '}
                          {formatDate(getSprintEndDate(activeSprint))}
                        </span>{' '}
                        | {activeSprint.title}
                      </h3>
                      <p className="text-muted mb-0">{activeSprint.goal}</p>
                      {activeSprint && (
                        <div className="py-2">
                          <PublicShareButtons title={activeSprint.title} />
                        </div>
                      )}
                    </Col>
                  </Row>
                </CardHeader>
                <div className="pt-3">
                  {Object.keys(workItemsByStatus).length === 0 &&
                    !isLoading && (
                      <div className="text-center mb-3">
                        No work items found in this sprint.
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
