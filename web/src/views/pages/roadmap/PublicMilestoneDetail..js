import React, { useEffect } from "react";
import { Card, CardBody, CardHeader, Col, Input, Row } from "reactstrap";
import PublicFeaturesListCard from "../features/PublicFeaturesListCard";
import { useParams } from "react-router-dom";
import PublicShareButtons from "../../../components/PublicShareButtons/PublicShareButtons";

function PublicMilestoneDetail({ milestone = { id: "", title: "", description: "", dueDate: "" } }) {
  const { orgId } = useParams();

  useEffect(() => {
    document.title = "Floumy | Milestone";
  }, []);

  return (
    <>
      <Card>
        <CardHeader>
          <h3 className="mb-0">Milestone</h3>
          {milestone && <div className="py-2"><PublicShareButtons title={milestone.title} /></div>}
        </CardHeader>
        <CardBody>
          <Row>
            <Col className="mb-3" md="8">
              <label
                className="form-control-label"
                htmlFor="validationCustom01"
              >
                Title
              </label>
              <Input
                id="title"
                name="title"
                type="text"
                disabled={true}
                className="bg-white"
                value={milestone.title}
              />
            </Col>
            <Col>
              <label
                className="form-control-label"
              >
                Due Date
              </label>
              <Input
                type="text"
                name="dueDate"
                value={milestone.dueDate}
                disabled={true}
                className="bg-white"
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <label
                className="form-control-label"
                htmlFor="validationCustom01"
              >
                Description
              </label>
              <Input
                disabled={true}
                className="bg-white"
                id="description"
                name="description"
                type="textarea"
                resize="none"
                value={milestone.description}
              />
            </Col>
          </Row>
        </CardBody>
      </Card>
      {milestone?.features && <PublicFeaturesListCard
        orgId={orgId}
        title="Initiatives"
        features={milestone.features}
        showAssignedTo={false}
      />}
    </>
  );
}

export default PublicMilestoneDetail;
