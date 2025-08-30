import React, { useEffect } from 'react';
import { Card, CardBody, CardHeader, Col, Input, Row } from 'reactstrap';
import PublicInitiativesListCard from '../initiatives/PublicInitiativesListCard';
import { useParams } from 'react-router-dom';

function PublicMilestoneDetail({
  milestone = { id: '', title: '', description: '', dueDate: '' },
}) {
  const { orgId, projectId } = useParams();

  useEffect(() => {
    document.title = 'Floumy | Milestone';
  }, []);

  return (
    <>
      <Card>
        <CardHeader>
          <h3 className="mb-0">Milestone</h3>
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
              <label className="form-control-label">Due Date</label>
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
      {milestone?.initiatives && (
        <PublicInitiativesListCard
          orgId={orgId}
          projectId={projectId}
          title="Initiatives"
          initiatives={milestone.initiatives}
          showAssignedTo={false}
        />
      )}
    </>
  );
}

export default PublicMilestoneDetail;
