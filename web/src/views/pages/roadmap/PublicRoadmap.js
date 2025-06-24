import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Card, CardHeader, Col, Container, Row } from 'reactstrap';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './Roadmap.scss';
import Select2 from 'react-select2-wrapper';
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
                {!isLoadingMilestones && milestones.length === 0 && (
                  <h3 className="text-center pb-3">
                    No milestones found for this timeline.
                  </h3>
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
