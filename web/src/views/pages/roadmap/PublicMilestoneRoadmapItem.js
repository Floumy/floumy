import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import PublicFeaturesList from "../features/PublicFeaturesList";
import { Link, useParams } from "react-router-dom";

function PublicMilestoneRoadmapItem({ orgId, milestone }) {
  const { productId } = useParams();
  const [features, setFeatures] = useState([]);
  const [showFeatures, setShowFeatures] = useState(true);
  useEffect(() => {
    const priority = ["high", "medium", "low"];
    const features = milestone.features.sort((a, b) => {
      return priority.indexOf(a.priority) - priority.indexOf(b.priority);
    });
    setFeatures(features);
  }, [milestone?.features]);

  function getMilestoneHeader() {
    return <>
      <h3 className="pt-2 pr-4">
        <button onClick={(e) => {
          e.preventDefault();
          setShowFeatures(!showFeatures);
        }}
                className="btn btn-sm btn-outline-light shadow-none shadow-none--hover pt-1 pb-0 pr-2">
          {!showFeatures && <i className="ni ni-bold-right" />}
          {showFeatures && <i className="ni ni-bold-down" />}
        </button>
        <Link to={`/public/orgs/${orgId}/projects/${productId}/milestones/detail/${milestone.id}`}>
          <span className="text-gray">{milestone.dueDate}</span> | {milestone.title} <span
          className="text-muted text-sm"></span>
        </Link>
      </h3>
      <div className={"text-muted text-sm"}>Initiatives Count: {milestone.features.length}</div>
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
            <div hidden={!showFeatures}>
              <PublicFeaturesList
                orgId={orgId}
                productId={productId}
                features={features}
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
