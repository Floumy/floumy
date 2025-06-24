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
                {sprints.length === 0 && !isLoadingSprints && (
                  <div className="text-center">
                    <h3>No sprints found for this timeline.</h3>
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
