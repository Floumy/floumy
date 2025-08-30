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
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Milestone from './Milestone';
import './Roadmap.scss';
import Select2 from 'react-select2-wrapper';
import {
  addInitiative,
  listInitiativesWithoutMilestone,
  listMilestonesWithInitiatives,
} from '../../../services/roadmap/roadmap.service';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import { useHotkeys } from 'react-hotkeys-hook';
import { formatTimeline, sortByPriority } from '../../../services/utils/utils';
import InitiativesListCard from '../initiatives/InitiativesListCard';
import { getUser } from '../../../services/okrs/okrs.service';

function InitiativesRoadmap() {
  const { orgId, projectId } = useParams();
  let location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const timelineQueryFilter = searchParams.get('timeline');
  const navigate = useNavigate();
  const [timelineFilterValue, setTimelineFilterValue] = useState(
    timelineQueryFilter || 'this-quarter',
  );
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
        const initiatives = await listInitiativesWithoutMilestone(
          orgId,
          projectId,
        );
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
        const milestones = await listMilestonesWithInitiatives(
          orgId,
          projectId,
          timelineFilterValue,
        );
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
    const previousMilestone = milestones.find((milestone) =>
      milestone.initiatives.find(
        (initiative) => initiative.id === updatedInitiatives[0].id,
      ),
    );
    if (previousMilestone.id === newMilestoneId) {
      return;
    }

    const newMilestone = milestones.find(
      (milestone) => milestone.id === newMilestoneId,
    );
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

    previousMilestone.initiatives = previousMilestone.initiatives.filter(
      (initiative) => !updatedInitiatives.some((f) => f.id === initiative.id),
    );

    setMilestones([...milestones]);
  }

  function updateBacklogInitiativesMilestone(
    updatedInitiatives,
    newMilestoneId,
  ) {
    // Remove initiative from initiatives list and add it to the new milestone
    const newMilestone = milestones.find(
      (milestone) => milestone.id === newMilestoneId,
    );
    for (const initiative of updatedInitiatives) {
      newMilestone.initiatives.push(initiative);
    }
    newMilestone.initiatives = sortByPriority(newMilestone.initiatives);

    const filteredInitiatives = initiatives.filter(
      (initiative) => !updatedInitiatives.some((f) => f.id === initiative.id),
    );
    setInitiatives(filteredInitiatives);

    setMilestones([...milestones]);
  }

  function updateBacklogInitiativesStatus(updatedInitiatives, newStatus) {
    const updatedInitiativesIds = updatedInitiatives.map((f) => f.id);
    const updatedInitiativesList = initiatives
      .map((initiative) => {
        // If the initiative is closed or completed, we remove it from the backlog
        if (
          initiative.status === 'closed' ||
          initiative.status === 'completed'
        ) {
          return null;
        }
        if (updatedInitiativesIds.includes(initiative.id)) {
          initiative.status = newStatus;
        }
        return initiative;
      })
      .filter((initiative) => initiative !== null);

    setInitiatives([...sortByPriority(updatedInitiativesList)]);
  }

  function updateInitiativesUser(updatedInitiatives, newAssignedTo) {
    const updatedInitiativesIds = updatedInitiatives.map((f) => f.id);
    const updatedInitiativesList = initiatives.map((initiative) => {
      if (updatedInitiativesIds.includes(initiative.id)) {
        initiative.assignedTo = newAssignedTo;
      }
      return initiative;
    });
    setInitiatives([...sortByPriority(updatedInitiativesList)]);
  }

  async function updateBacklogInitiativesAssignedTo(
    updatedInitiatives,
    newAssignedTo,
  ) {
    if (!newAssignedTo) {
      updateInitiativesUser(updatedInitiatives, newAssignedTo);
      return;
    }
    const user = await getUser(orgId, newAssignedTo);
    updateInitiativesUser(updatedInitiatives, user);
  }

  async function onAddInitiative(initiative) {
    const savedInitiative = await addInitiative(orgId, projectId, initiative);
    initiatives.push(savedInitiative);
    setInitiatives([...initiatives]);
  }

  async function onDeleteInitiative(deletedInitiatives) {
    const deletedIds = deletedInitiatives.map((i) => i.id);
    setInitiatives(initiatives.filter((i) => !deletedIds.includes(i.id)));
  }

  return (
    <>
      {isLoadingMilestones && <InfiniteLoadingBar />}
      <SimpleHeader
        headerButtons={[
          {
            name: 'New Milestone',
            shortcut: 'm',
            id: 'new-milestone',
            action: () => {
              navigate(
                `/admin/orgs/${orgId}/projects/${projectId}/roadmap/milestones/new`,
              );
            },
          },
          {
            name: 'New Initiative',
            shortcut: 'i',
            id: 'new-initiative',
            action: () => {
              navigate(
                `/admin/orgs/${orgId}/projects/${projectId}/roadmap/initiatives/new`,
              );
            },
          },
        ]}
      />
      <Container className="mt--6" fluid>
        <Row>
          <Col>
            <Card className="mb-5">
              <CardHeader className="rounded-lg">
                <Row>
                  <Col xs={12} sm={8}>
                    <CardTitle tag="h2">Initiatives Roadmap</CardTitle>
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
              <div className="p-4">
                {isLoadingMilestones && <LoadingSpinnerBox />}
                {!isLoadingMilestones &&
                  milestones.length === 0 &&
                  timelineFilterValue !== 'past' && (
                    <div className="p-5 text-center">
                      <div className="mx-auto" style={{ maxWidth: '680px' }}>
                        <h3 className="mb-3">
                          No milestones for{' '}
                          {formatTimeline(timelineFilterValue).toLowerCase()}{' '}
                          yet
                        </h3>
                        <p className="text-muted">
                          Add a milestone to frame your roadmap and then group
                          related work with initiatives.
                        </p>
                        <div className="my-4">
                          <Link
                            to={`/admin/orgs/${orgId}/projects/${projectId}/roadmap/milestones/new`}
                            className="btn btn-primary"
                          >
                            Create a new Milestone
                          </Link>
                        </div>
                        <Row className="mt-4 text-left">
                          <Col md="6" className="mb-3">
                            <Card>
                              <CardBody>
                                <h5 className="mb-2">What is an Initiative?</h5>
                                <p className="mb-0 text-sm text-muted">
                                  A high-level effort that groups related work
                                  to achieve a strategic outcome.
                                </p>
                              </CardBody>
                            </Card>
                          </Col>
                          <Col md="6" className="mb-3">
                            <Card>
                              <CardBody>
                                <h5 className="mb-2">What is a Milestone?</h5>
                                <p className="mb-0 text-sm text-muted">
                                  A significant checkpoint in your roadmap that
                                  helps you track progress and deadlines.
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
                    <Milestone
                      key={milestone.id}
                      milestone={milestone}
                      onInitiativeChangeMilestone={updateInitiativesMilestone}
                    />
                  ))}
              </div>
            </Card>
            <div id={'initiatives-backlog'} />
            <InitiativesListCard
              title="Backlog"
              initiatives={initiatives}
              isLoading={isLoadingInitiatives}
              onAddInitiative={onAddInitiative}
              onChangeMilestone={updateBacklogInitiativesMilestone}
              onChangeStatus={updateBacklogInitiativesStatus}
              onChangeAssignedTo={updateBacklogInitiativesAssignedTo}
              onDelete={onDeleteInitiative}
              extraButtonLabel={'All Initiatives'}
              extraButtonId={'all-initiatives-backlog'}
              onExtraButtonClick={() => {
                navigate(
                  `/admin/orgs/${orgId}/projects/${projectId}/initiatives`,
                );
              }}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default InitiativesRoadmap;
