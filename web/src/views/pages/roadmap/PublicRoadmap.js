import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Card, CardHeader, CardBody, Col, Container, Row } from 'reactstrap';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './Roadmap.scss';
import Select2 from 'react-select2-wrapper';
import { formatTimeline } from '../../../services/utils/utils';
import { listPublicMilestonesWithInitiatives } from '../../../services/roadmap/roadmap.service';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import PublicMilestoneRoadmapItem from './PublicMilestoneRoadmapItem';
import PublicShareButtons from '../../../components/PublicShareButtons/PublicShareButtons';

function PublicRoadmap() {
  let location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const timelineQueryFilter = searchParams.get('timeline');
  const navigate = useNavigate();
  const { orgId, projectId } = useParams();
  const [timelineFilterValue, setTimelineFilterValue] = useState(
    timelineQueryFilter || 'this-quarter',
  );
  const [milestones, setMilestones] = useState([]);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(false);

  useEffect(() => {
    async function fetchMilestones() {
      setIsLoadingMilestones(true);
      try {
        const milestones = await listPublicMilestonesWithInitiatives(
          orgId,
          projectId,
          timelineFilterValue,
        );
        setMilestones(
          milestones.sort((a, b) => {
            return new Date(a.dueDate) - new Date(b.dueDate);
          }),
        );
      } catch (e) {
        console.error(e.message);
      } finally {
        setIsLoadingMilestones(false);
      }
    }

    fetchMilestones();
  }, [orgId, projectId, timelineFilterValue]);

  return (
    <>
      {isLoadingMilestones && <InfiniteLoadingBar />}
      <SimpleHeader />
      <Container className="mt--6" fluid>
        <Row>
          <Col>
            <Card className="mb-5">
              <CardHeader className="rounded-lg">
                <Row>
                  <Col xs={12} sm={8}>
                    <h2>Roadmap</h2>
                    <PublicShareButtons title={'Roadmap'} />
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
                        setTimelineFilterValue(e.target.value);
                        navigate(`?timeline=${e.target.value}`);
                      }}
                    ></Select2>
                  </Col>
                </Row>
              </CardHeader>
              <div className="pt-3">
                {isLoadingMilestones && <LoadingSpinnerBox />}
                {!isLoadingMilestones &&
                  milestones.length === 0 &&
                  timelineFilterValue !== 'past' && (
                    <div className="p-5 text-center">
                      <div className="mx-auto" style={{ maxWidth: '680px' }}>
                        <h3 className="mb-3">
                          No milestones for {formatTimeline(timelineFilterValue).toLowerCase()} yet
                        </h3>
                        <p className="text-muted">
                          Milestones and their initiatives will appear here once they are published for this timeline.
                        </p>
                        <Row className="mt-4 text-left">
                          <Col md="6" className="mb-3">
                            <Card>
                              <CardBody>
                                <h5 className="mb-2">What is an Initiative?</h5>
                                <p className="mb-0 text-sm text-muted">
                                  A high-level effort that groups related work to achieve a strategic outcome.
                                </p>
                              </CardBody>
                            </Card>
                          </Col>
                          <Col md="6" className="mb-3">
                            <Card>
                              <CardBody>
                                <h5 className="mb-2">What is a Milestone?</h5>
                                <p className="mb-0 text-sm text-muted">
                                  A significant checkpoint in your roadmap that helps you track progress and deadlines.
                                </p>
                              </CardBody>
                            </Card>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  )}
                {!isLoadingMilestones &&
                  milestones.length === 0 &&
                  timelineFilterValue === 'past' && (
                    <div className="p-5 text-center">
                      <div className="mx-auto" style={{ maxWidth: '680px' }}>
                        <h3 className="mb-3">No milestones in the past</h3>
                        <p className="text-muted mb-0">
                          There are no milestones recorded for past timelines.
                        </p>
                      </div>
                    </div>
                  )}
                {!isLoadingMilestones &&
                  milestones.length > 0 &&
                  milestones.map((milestone) => (
                    <PublicMilestoneRoadmapItem
                      orgId={orgId}
                      key={milestone.id}
                      milestone={milestone}
                    />
                  ))}
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default PublicRoadmap;
