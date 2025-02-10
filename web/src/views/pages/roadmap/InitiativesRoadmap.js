import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Card, CardHeader, CardTitle, Col, Container, Row } from 'reactstrap';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Milestone from './Milestone';
import './Roadmap.scss';
import Select2 from 'react-select2-wrapper';
import {
  addInitiative,
  addMilestone,
  listInitiativesWithoutMilestone,
  listMilestonesWithInitiatives,
  updateInitiativeMilestone,
} from '../../../services/roadmap/roadmap.service';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import { useHotkeys } from 'react-hotkeys-hook';
import { formatTimeline, sortByPriority } from '../../../services/utils/utils';
import InitiativesListCard from '../initiatives/InitiativesListCard';
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
  const [initiatives, setInitiatives] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(false);
  const [isLoadingInitiatives, setIsLoadingInitiatives] = useState(false);
  // on b hotkey press scroll to the initiatives backlog section
  useHotkeys('b', () => {
    document.getElementById('initiatives-backlog').scrollIntoView();
  });
  useEffect(() => {
    document.title = 'Floumy | Roadmap';

    async function fetchInitiatives() {
      setIsLoadingInitiatives(true);
      try {
        const initiatives = await listInitiativesWithoutMilestone(orgId, projectId);
        const sortedInitiatives = sortByPriority(initiatives);
        setInitiatives(sortedInitiatives);
      } catch (e) {
        console.error(e.message);
      } finally {
        setIsLoadingInitiatives(false);
      }

    }

    fetchInitiatives();
  }, [orgId, projectId]);

  useEffect(() => {
    async function fetchMilestones() {
      setIsLoadingMilestones(true);
      try {
        const milestones = await listMilestonesWithInitiatives(orgId, projectId, timelineFilterValue);
        setMilestones(milestones);
      } catch (e) {
        console.error(e.message);
      } finally {
        setIsLoadingMilestones(false);
      }
    }

    fetchMilestones();
  }, [orgId, projectId, timelineFilterValue]);

  function updateInitiativesMilestone(updatedInitiatives, newMilestoneId) {
    const previousMilestone = milestones.find(milestone => milestone.initiatives.find(initiative => initiative.id === updatedInitiatives[0].id));
    if (previousMilestone.id === newMilestoneId) {
      return;
    }

    const newMilestone = milestones.find(milestone => milestone.id === newMilestoneId);
    if (newMilestone) {
      for (const initiative of updatedInitiatives) {
        newMilestone.initiatives.push(initiative);
      }
      newMilestone.initiatives = sortByPriority(newMilestone.initiatives);
    } else {
      for (const initiative of updatedInitiatives) {
        initiatives.push(initiative);
      }
      setInitiatives([...sortByPriority(initiatives)]);
    }

    previousMilestone.initiatives = previousMilestone.initiatives.filter(initiative => !updatedInitiatives.some(f => f.id === initiative.id));

    setMilestones([...milestones]);
  }

  function updateBacklogInitiativesMilestone(updatedInitiatives, newMilestoneId) {
    // Remove initiative from initiatives list and add it to the new milestone
    const newMilestone = milestones.find(milestone => milestone.id === newMilestoneId);
    for (const initiative of updatedInitiatives) {
      newMilestone.initiatives.push(initiative);
    }
    newMilestone.initiatives = sortByPriority(newMilestone.initiatives);

    const filteredInitiatives = initiatives.filter(initiative => !updatedInitiatives.some(f => f.id === initiative.id));
    setInitiatives(filteredInitiatives);

    setMilestones([...milestones]);
  }

  function updateBacklogInitiativesStatus(updatedInitiatives, newStatus) {
    const updatedInitiativesIds = updatedInitiatives.map(f => f.id);
    const updatedInitiativesList = initiatives.map(initiative => {
      // If the initiative is closed or completed, we remove it from the backlog
      if (initiative.status === 'closed' || initiative.status === 'completed') {
        return null;
      }
      if (updatedInitiativesIds.includes(initiative.id)) {
        initiative.status = newStatus;
      }
      return initiative;
    }).filter(initiative => initiative !== null);

    setInitiatives([...sortByPriority(updatedInitiativesList)]);
  }

  function onAddInitiative() {
    return async (initiative) => {
      const savedInitiative = await addInitiative(orgId, projectId, initiative);
      initiatives.push(savedInitiative);
      setInitiatives([...initiatives]);
    };
  }

  async function refreshMilestonesAndBacklogInitiatives() {
    setIsLoadingMilestones(true);
    const milestones = await listMilestonesWithInitiatives(orgId, projectId, timelineFilterValue);
    setMilestones(milestones);
    const initiatives = await listInitiativesWithoutMilestone(orgId, projectId);
    const sortedInitiatives = sortByPriority(initiatives);
    setInitiatives(sortedInitiatives);
    setIsLoadingMilestones(false);
  }

  async function handleAiRoadmapBuild() {
    const milestones = await generateRoadmapMilestones(orgId, projectId, timelineFilterValue);

    if (milestones.length === 0) {
      toast.error(`No initiatives found for ${formatTimeline(timelineFilterValue).toLowerCase()}`);
      return;
    }

    for (const milestone of milestones) {
      const savedMilestone = await addMilestone(orgId, projectId, {
        title: milestone.title,
        description: milestone.description,
        dueDate: milestone.dueDate,
      });
      for (const initiativeId of milestone.initiativeIds) {
        await updateInitiativeMilestone(orgId, projectId, initiativeId, savedMilestone.id);
      }
    }

    setTimeout(() => toast.success('The milestones have been added'), 1000);
    await refreshMilestonesAndBacklogInitiatives();
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
          id: 'new-initiative',
          action: () => {
            navigate(`/admin/orgs/${orgId}/projects/${projectId}/roadmap/initiatives/new`);
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
                      <Link to={`/admin/orgs/${orgId}/projects/${projectId}/roadmap/initiatives/new`}
                            className="text-blue font-weight-bold">Add an
                        Initiative</Link>
                    </p>
                  </div>
                )}
                {!isLoadingMilestones && milestones.length > 0 && milestones.map((milestone) => (
                  <Milestone key={milestone.id} milestone={milestone}
                             onInitiativeChangeMilestone={updateInitiativesMilestone} />))}
              </div>
            </Card>
            <div id={'initiatives-backlog'} />
            <InitiativesListCard title="Initiatives Backlog"
                                 initiatives={initiatives}
                                 isLoading={isLoadingInitiatives}
                                 onAddInitiative={onAddInitiative()}
                                 onChangeMilestone={updateBacklogInitiativesMilestone}
                                 onChangeStatus={updateBacklogInitiativesStatus} />
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default InitiativesRoadmap;
