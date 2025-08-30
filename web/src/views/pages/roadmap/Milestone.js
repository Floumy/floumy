import React, { useEffect, useState } from 'react';
import InitiativesList from '../initiatives/InitiativesList';
import { Col, Row } from 'reactstrap';
import { Link, useParams } from 'react-router-dom';
import { getUser } from '../../../services/okrs/okrs.service';
import { sortByPriority } from '../../../services/utils/utils';

function Milestone({ milestone, onInitiativeChangeMilestone }) {
  const { orgId, projectId } = useParams();
  const [initiatives, setInitiatives] = useState([]);
  const [showInitiatives, setShowInitiatives] = useState(true);
  useEffect(() => {
    const priority = ['high', 'medium', 'low'];
    const initiatives = milestone.initiatives.sort((a, b) => {
      return priority.indexOf(a.priority) - priority.indexOf(b.priority);
    });
    setInitiatives(initiatives);
  }, [milestone?.initiatives]);

  function getMilestoneHeader() {
    return (
      <>
        <h3 className="pt-2 pr-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowInitiatives(!showInitiatives);
            }}
            className="btn btn-sm btn-outline-light shadow-none shadow-none--hover pt-1 pb-0 pr-2"
          >
            {!showInitiatives && <i className="ni ni-bold-right" />}
            {showInitiatives && <i className="ni ni-bold-down" />}
          </button>
          <Link
            to={`/admin/orgs/${orgId}/projects/${projectId}/roadmap/milestones/edit/${milestone.id}`}
          >
            <span className="text-gray">{milestone.dueDate}</span> |{' '}
            {milestone.title} <span className="text-muted text-sm"></span>
          </Link>
        </h3>
        <div className={'text-muted text-sm'}>
          Initiatives Count: {milestone.initiatives.length}
        </div>
        {milestone.description && (
          <div className="text-sm text-muted">
            Description: {milestone.description}
          </div>
        )}
      </>
    );
  }

  function updateInitiativesStatus(updatedInitiatives, status) {
    const updatedInitiativesIds = updatedInitiatives.map(
      (initiative) => initiative.id,
    );
    const updatedInitiativesStatus = initiatives.map((initiative) => {
      if (updatedInitiativesIds.includes(initiative.id)) {
        initiative.status = status;
      }
      return initiative;
    });
    setInitiatives(updatedInitiativesStatus);
  }

  function updateInitiativesPriority(updatedInitiatives, priority) {
    const updatedInitiativesIds = updatedInitiatives.map(
      (initiative) => initiative.id,
    );
    const updatedInitiativesPriority = initiatives.map((initiative) => {
      if (updatedInitiativesIds.includes(initiative.id)) {
        initiative.priority = priority;
      }
      return initiative;
    });
    setInitiatives(updatedInitiativesPriority);
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

  async function updateInitiativesAssignedTo(
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

  return (
    <>
      <div className="mb-5">
        <Row className="pl-4 pr-4 pb-2">
          <Col sm={12}>{getMilestoneHeader()}</Col>
        </Row>
        <Row>
          <Col>
            <div hidden={!showInitiatives}>
              <InitiativesList
                id={`milestone-${milestone.id}-initiatives-context-menu`}
                initiatives={initiatives}
                showAssignedTo={true}
                headerClassName={'thead'}
                onChangeAssignedTo={updateInitiativesAssignedTo}
                onChangePriority={updateInitiativesPriority}
                onChangeStatus={updateInitiativesStatus}
                onChangeMilestone={onInitiativeChangeMilestone}
              />
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Milestone;
