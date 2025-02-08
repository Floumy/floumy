import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Card, CardHeader, CardTitle, Col, Container, Row } from 'reactstrap';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Milestone from './Milestone';
import './Roadmap.scss';
import Select2 from 'react-select2-wrapper';
import {
  addFeature, addMilestone,
  listFeaturesWithoutMilestone,
  listMilestonesWithFeatures, updateFeatureMilestone,
} from '../../../services/roadmap/roadmap.service';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import { useHotkeys } from 'react-hotkeys-hook';
import { sortByPriority } from '../../../services/utils/utils';
import FeaturesListCard from '../features/FeaturesListCard';
import AIButton from '../../../components/AI/AIButton';
import { generateRoadmapMilestones } from '../../../services/ai/ai.service';
import { toast } from 'react-toastify';

function InitiativesRoadmap() {
  const { orgId, projectId } = useParams();
  let location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const timelineQueryFilter = searchParams.get('timeline');
  const navigate = useNavigate();
  const [timelineFilterValue, setTimelineFilterValue] = useState(timelineQueryFilter || 'this-quarter');
  const [features, setFeatures] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(false);
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
  // on b hotkey press scroll to the features backlog section
  useHotkeys('b', () => {
    document.getElementById('features-backlog').scrollIntoView();
  });
  useEffect(() => {
    document.title = 'Floumy | Roadmap';

    async function fetchFeatures() {
      setIsLoadingFeatures(true);
      try {
        const features = await listFeaturesWithoutMilestone(orgId, projectId);
        const sortedFeatures = sortByPriority(features);
        setFeatures(sortedFeatures);
      } catch (e) {
        console.error(e.message);
      } finally {
        setIsLoadingFeatures(false);
      }

    }

    fetchFeatures();
  }, [orgId, projectId]);

  useEffect(() => {
    async function fetchMilestones() {
      setIsLoadingMilestones(true);
      try {
        const milestones = await listMilestonesWithFeatures(orgId, projectId, timelineFilterValue);
        setMilestones(milestones);
      } catch (e) {
        console.error(e.message);
      } finally {
        setIsLoadingMilestones(false);
      }
    }

    fetchMilestones();
  }, [orgId, projectId, timelineFilterValue]);

  function updateFeaturesMilestone(updatedFeatures, newMilestoneId) {
    const previousMilestone = milestones.find(milestone => milestone.features.find(feature => feature.id === updatedFeatures[0].id));
    if (previousMilestone.id === newMilestoneId) {
      return;
    }

    const newMilestone = milestones.find(milestone => milestone.id === newMilestoneId);
    if (newMilestone) {
      for (const feature of updatedFeatures) {
        newMilestone.features.push(feature);
      }
      newMilestone.features = sortByPriority(newMilestone.features);
    } else {
      for (const feature of updatedFeatures) {
        features.push(feature);
      }
      setFeatures([...sortByPriority(features)]);
    }

    previousMilestone.features = previousMilestone.features.filter(feature => !updatedFeatures.some(f => f.id === feature.id));

    setMilestones([...milestones]);
  }

  function updateBacklogFeaturesMilestone(updatedFeatures, newMilestoneId) {
    // Remove feature from features list and add it to the new milestone
    const newMilestone = milestones.find(milestone => milestone.id === newMilestoneId);
    for (const feature of updatedFeatures) {
      newMilestone.features.push(feature);
    }
    newMilestone.features = sortByPriority(newMilestone.features);

    const filteredFeatures = features.filter(feature => !updatedFeatures.some(f => f.id === feature.id));
    setFeatures(filteredFeatures);

    setMilestones([...milestones]);
  }

  function updateBacklogFeaturesStatus(updatedFeatures, newStatus) {
    const updatedFeaturesIds = updatedFeatures.map(f => f.id);
    const updatedFeaturesList = features.map(feature => {
      // If the feature is closed or completed, we remove it from the backlog
      if (feature.status === 'closed' || feature.status === 'completed') {
        return null;
      }
      if (updatedFeaturesIds.includes(feature.id)) {
        feature.status = newStatus;
      }
      return feature;
    }).filter(feature => feature !== null);

    setFeatures([...sortByPriority(updatedFeaturesList)]);
  }

  function onAddFeature() {
    return async (feature) => {
      const savedFeature = await addFeature(orgId, projectId, feature);
      features.push(savedFeature);
      setFeatures([...features]);
    };
  }

  async function refreshMilestonesAndBacklogFeatures() {
    setIsLoadingMilestones(true);
    const milestones = await listMilestonesWithFeatures(orgId, projectId, timelineFilterValue);
    setMilestones(milestones);
    const features = await listFeaturesWithoutMilestone(orgId, projectId);
    const sortedFeatures = sortByPriority(features);
    setFeatures(sortedFeatures);
    setIsLoadingMilestones(false);
  }

  async function handleAiRoadmapBuild() {
    const milestones = await generateRoadmapMilestones(orgId, projectId, timelineFilterValue);
    for (const milestone of milestones) {
      const savedMilestone = await addMilestone(orgId, projectId, {
        title: milestone.title,
        description: milestone.description,
        dueDate: milestone.dueDate,
      });
      for (const featureId of milestone.featureIds) {
        await updateFeatureMilestone(orgId, projectId, featureId, savedMilestone.id);
      }
    }

    setTimeout(() => toast.success('The milestones have been added'), 1000);
    await refreshMilestonesAndBacklogFeatures();
  }

  return (
    <>
      {isLoadingMilestones && <InfiniteLoadingBar />}
      <SimpleHeader headerButtons={[
        {
          name: 'New Milestone',
          shortcut: 'm',
          id: 'new-milestone',
          action: () => {
            navigate(`/admin/orgs/${orgId}/projects/${projectId}/roadmap/milestones/new`);
          },
        },
        {
          name: 'New Initiative',
          shortcut: 'i',
          id: 'new-feature',
          action: () => {
            navigate(`/admin/orgs/${orgId}/projects/${projectId}/roadmap/features/new`);
          },
        },
      ]} />
      <Container className="mt--6" fluid>
        <Row>
          <Col>
            <Card className="mb-5">
              <CardHeader className="rounded-lg">
                <Row>
                  <Col xs={12} sm={8}>
                    <CardTitle tag="h2">
                      Roadmap
                      {!isLoadingMilestones &&
                        milestones.length === 0 &&
                        (timelineFilterValue === 'this-quarter' || timelineFilterValue === 'next-quarter') &&
                        <AIButton text="Build with AI" onClick={async () => await handleAiRoadmapBuild()} />}
                    </CardTitle>
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
                    >
                    </Select2>
                  </Col>
                </Row>
              </CardHeader>
              <div className="p-4">
                {isLoadingMilestones && <LoadingSpinnerBox />}
                {!isLoadingMilestones && milestones.length === 0 && (
                  <div style={{ maxWidth: '600px' }} className="mx-auto font-italic">
                    <h3>Roadmap</h3>
                    <p>The Roadmap is your project's strategic plan that outlines the vision, direction, and
                      progress over time. It helps you communicate your plans and priorities to stakeholders. Start
                      by creating a roadmap to visualize your project's journey and keep everyone informed.</p>
                    <h3>Milestones</h3>
                    <p>Milestones are significant points or achievements in your project timeline. They help you
                      track major progress and ensure you're meeting key deadlines. Set milestones to celebrate your
                      accomplishments and keep your project on schedule.
                      <br />
                      <Link to={`/admin/orgs/${orgId}/projects/${projectId}/roadmap/milestones/new`}
                            className="text-blue font-weight-bold">Set a
                        Milestone</Link>
                    </p>
                    <h3>Initiatives</h3>
                    <p>Initiatives are high-level efforts that encompass multiple projects or tasks aimed at achieving
                      a strategic goal. They provide a broader context for your work, aligning various activities
                      towards a common objective. Define initiatives to prioritize efforts, allocate resources
                      effectively, and ensure your team is working towards the same strategic vision.
                      <br />
                      <Link to={`/admin/orgs/${orgId}/projects/${projectId}/roadmap/features/new`}
                            className="text-blue font-weight-bold">Add an
                        Initiative</Link>
                    </p>
                  </div>
                )}
                {!isLoadingMilestones && milestones.length > 0 && milestones.map((milestone) => (
                  <Milestone key={milestone.id} milestone={milestone}
                             onFeatureChangeMilestone={updateFeaturesMilestone} />))}
              </div>
            </Card>
            <div id={'features-backlog'} />
            <FeaturesListCard title="Initiatives Backlog"
                              features={features}
                              isLoading={isLoadingFeatures}
                              onAddFeature={onAddFeature()}
                              onChangeMilestone={updateBacklogFeaturesMilestone}
                              onChangeStatus={updateBacklogFeaturesStatus} />
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default InitiativesRoadmap;
