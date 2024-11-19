import React, { useEffect, useState } from "react";
import FeaturesList from "../features/FeaturesList";
import { Col, Row } from "reactstrap";
import { Link, useParams } from "react-router-dom";
import { addFeature } from "../../../services/roadmap/roadmap.service";

function Milestone({ milestone, onFeatureChangeMilestone }) {
  const { orgId, productId } = useParams();
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
        <Link to={`/admin/orgs/${orgId}/products/${productId}/roadmap/milestones/edit/${milestone.id}`}>
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

  async function handleAddFeatureWithMilestone(feature, milestoneId) {
    feature.milestone = milestoneId;
    const savedFeature = await addFeature(feature);
    features.push(savedFeature);
    setFeatures([...features]);
  }

  function updateFeaturesStatus(updatedFeatures, status) {
    const updatedFeaturesIds = updatedFeatures.map(feature => feature.id);
    const updatedFeaturesStatus = features.map(feature => {
      if (updatedFeaturesIds.includes(feature.id)) {
        feature.status = status;
      }
      return feature;
    });
    setFeatures(updatedFeaturesStatus);
  }

  function updateFeaturesPriority(updatedFeatures, priority) {
    const updatedFeaturesIds = updatedFeatures.map(feature => feature.id);
    const updatedFeaturesPriority = features.map(feature => {
      if (updatedFeaturesIds.includes(feature.id)) {
        feature.priority = priority;
      }
      return feature;
    });
    setFeatures(updatedFeaturesPriority);
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
              <FeaturesList
                id={`milestone-${milestone.id}-features-context-menu`}
                features={features}
                showAssignedTo={true}
                headerClassName={"thead"}
                onAddFeature={async (feature) => {
                  await handleAddFeatureWithMilestone(feature, milestone.id);
                }}
                onChangePriority={updateFeaturesPriority}
                onChangeStatus={updateFeaturesStatus}
                onChangeMilestone={onFeatureChangeMilestone}
              />
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Milestone;
