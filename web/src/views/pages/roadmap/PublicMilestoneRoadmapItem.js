import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import PublicInitiativesList from "../initiatives/PublicInitiativesList";
import { Link, useParams } from "react-router-dom";

function PublicMilestoneRoadmapItem({ orgId, milestone }) {
  const { projectId } = useParams();
  const [initiatives, setInitiatives] = useState([]);
  const [showInitiatives, setShowInitiatives] = useState(true);
  useEffect(() => {
    const priority = ["high", "medium", "low"];
    const initiatives = milestone.initiatives.sort((a, b) => {
      return priority.indexOf(a.priority) - priority.indexOf(b.priority);
    });
    setInitiatives(initiatives);
  }, [milestone?.initiatives]);

  function getMilestoneHeader() {
    return <>
      <h3 className="pt-2 pr-4">
        <button onClick={(e) => {
          e.preventDefault();
          setShowInitiatives(!showInitiatives);
        }}
                className="btn btn-sm btn-outline-light shadow-none shadow-none--hover pt-1 pb-0 pr-2">
          {!showInitiatives && <i className="ni ni-bold-right" />}
          {showInitiatives && <i className="ni ni-bold-down" />}
        </button>
        <Link to={`/public/orgs/${orgId}/projects/${projectId}/milestones/detail/${milestone.id}`}>
          <span className="text-gray">{milestone.dueDate}</span> | {milestone.title} <span
          className="text-muted text-sm"></span>
        </Link>
      </h3>
      <div className={"text-muted text-sm"}>Initiatives Count: {milestone.initiatives.length}</div>
      {milestone.description &&
        <div className="text-sm text-muted">
          Description: {milestone.description}
        </div>}
    </>;
  }

  return (
    <>
      <div className="mb-5">
        <Row className="pl-4 pr-4 pb-2">
          <Col sm={12}>
            {getMilestoneHeader()}
          </Col>
        </Row>
        <Row>
          <Col>
            <div hidden={!showInitiatives}>
              <PublicInitiativesList
                orgId={orgId}
                projectId={projectId}
                initiatives={initiatives}
                headerClassName={"thead"}
              />
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default PublicMilestoneRoadmapItem;
