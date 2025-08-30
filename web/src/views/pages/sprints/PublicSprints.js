import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Card, CardBody, CardHeader, Col, Container, Row } from 'reactstrap';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import React, { useEffect, useState } from 'react';
import Select2 from 'react-select2-wrapper';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { listPublicSprintsWithWorkItemsForTimeline } from '../../../services/sprints/sprints.service';
import {
  formatDate,
  getSprintEndDate,
  getSprintStartDate,
  sortByPriority,
  formatTimeline,
} from '../../../services/utils/utils';
import PublicWorkItemsList from '../backlog/PublicWorkItemsList';
import PublicShareButtons from '../../../components/PublicShareButtons/PublicShareButtons';

function PublicSprints() {
  let location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const timelineQueryFilter = searchParams.get('timeline');
  const [isLoadingSprints, setIsLoadingSprints] = useState(false);
  const [timelineFilterValue, setTimelineFilterValue] = useState(
    timelineQueryFilter || 'this-quarter',
  );
  const [sprints, setSprints] = useState([]);
  const [showWorkItems, setShowWorkItems] = useState({});
  const navigate = useNavigate();
  const { orgId, projectId } = useParams();

  useEffect(() => {
    document.title = 'Floumy | Sprints';

    async function fetchSprints() {
      setIsLoadingSprints(true);
      try {
        const sprints = await listPublicSprintsWithWorkItemsForTimeline(
          orgId,
          projectId,
          timelineFilterValue,
        );
        setSprints(sprints);
        // Show all work items by default
        const displayWorkItems = {};
        sprints.forEach((sprint) => {
          displayWorkItems[sprint.id] = true;
        });
        setShowWorkItems(displayWorkItems);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingSprints(false);
      }
    }

    fetchSprints();
  }, [orgId, projectId, timelineFilterValue]);

  function estimationTotal(workItems) {
    let total = 0;
    workItems.forEach((workItem) => {
      if (workItem.estimation) {
        total += workItem.estimation;
      }
    });

    return total;
  }

  return (
    <>
      {isLoadingSprints && <InfiniteLoadingBar />}
      <SimpleHeader />
      <Container className="mt--6" fluid id="OKRs">
        <Row>
          <Col>
            <Card className="mb-5">
              <CardHeader>
                <Row>
                  <Col xs={12} sm={8}>
                    <h2>Sprints</h2>
                    <PublicShareButtons title={'Sprints'} />
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
              <div className="pt-3 pb-2">
                {!isLoadingSprints &&
                  sprints.length === 0 &&
                  timelineFilterValue !== 'past' && (
                    <div className="p-5 text-center">
                      <div className="mx-auto" style={{ maxWidth: '680px' }}>
                        <h3 className="mb-3">
                          No sprints for{' '}
                          {formatTimeline(timelineFilterValue).toLowerCase()}{' '}
                          yet
                        </h3>
                        <p className="text-muted">
                          Planned sprints and their work items will appear here
                          once they are published for this timeline.
                        </p>
                        <Row className="mt-4 text-left">
                          <Col md="6" className="mb-3">
                            <Card>
                              <CardBody>
                                <h5 className="mb-2">What is a Sprint?</h5>
                                <p className="mb-0 text-sm text-muted">
                                  A fixed timeframe where the team focuses on a
                                  set of prioritized work items.
                                </p>
                              </CardBody>
                            </Card>
                          </Col>
                          <Col md="6" className="mb-3">
                            <Card>
                              <CardBody>
                                <h5 className="mb-2">What is a Work Item?</h5>
                                <p className="mb-0 text-sm text-muted">
                                  A task, bug, or story tracked within a sprint
                                  to deliver value incrementally.
                                </p>
                              </CardBody>
                            </Card>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  )}
                {!isLoadingSprints &&
                  sprints.length === 0 &&
                  timelineFilterValue === 'past' && (
                    <div className="p-5 text-center">
                      <div className="mx-auto" style={{ maxWidth: '680px' }}>
                        <h3 className="mb-3">No sprints in the past</h3>
                        <p className="text-muted mb-0">
                          There are no sprints recorded for past timelines.
                        </p>
                      </div>
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
                              to={`/public/orgs/${orgId}/projects/${projectId}/sprints/detail/${sprint.id}`}
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
                              <span className="badge badge-primary text-white">
                                Planned
                              </span>
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
                          <PublicWorkItemsList
                            orgId={orgId}
                            id={'completed-' + sprint.id}
                            workItems={sortByPriority(
                              sprint.workItems.filter(
                                (workItem) =>
                                  workItem.status === 'done' ||
                                  workItem.status === 'closed',
                              ),
                            )}
                            headerClassName={'thead'}
                          />
                          <CardBody className="pt-2 pb-2 font-italic">
                            <Row>
                              <Col className="text-sm">
                                Unfinished Work Items
                              </Col>
                            </Row>
                          </CardBody>
                          <PublicWorkItemsList
                            orgId={orgId}
                            id={'unfinished-' + sprint.id}
                            workItems={sortByPriority(
                              sprint.workItems.filter(
                                (workItem) =>
                                  workItem.status !== 'done' &&
                                  workItem.status !== 'closed',
                              ),
                            )}
                            headerClassName={'thead'}
                          />
                        </div>
                      )}
                      {sprint.status !== 'completed' && (
                        <div
                          className="pt-2"
                          hidden={!showWorkItems[sprint.id]}
                        >
                          <PublicWorkItemsList
                            orgId={orgId}
                            id={sprint.id}
                            showAssignedTo={true}
                            workItems={sortByPriority(sprint.workItems)}
                            headerClassName={'thead'}
                          />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
              {isLoadingSprints && <LoadingSpinnerBox />}
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default PublicSprints;
