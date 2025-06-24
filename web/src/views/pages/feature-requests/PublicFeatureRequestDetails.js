import React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  FormGroup,
  Input,
  Row,
} from 'reactstrap';
import CardHeaderDetails from '../components/CardHeaderDetails';
import { formatHyphenatedString } from '../../../services/utils/utils';

export default function PublicFeatureRequestDetails({ featureRequest }) {
  return (
    <>
      <Card>
        <CardHeader>
          <h3 className="mb-0">Feature Request</h3>
          <CardHeaderDetails
            createdAt={featureRequest.createdAt}
            updatedAt={featureRequest.updatedAt}
          />
        </CardHeader>
        <CardBody>
          <Form className="needs-validation" noValidate>
            <Row>
              <Col>
                <FormGroup>
                  <label className="form-control-label">Title</label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    value={featureRequest.title}
                    className="bg-white"
                    disabled={true}
                    readOnly={true}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col>
                <FormGroup>
                  <label className="form-control-label">Status</label>
                  <Input
                    id="status"
                    name="status"
                    type="text"
                    className="bg-white"
                    value={formatHyphenatedString(featureRequest.status)}
                    disabled={true}
                    readOnly={true}
                  />
                </FormGroup>
              </Col>
              <Col>
                <FormGroup>
                  <label className="form-control-label">Estimation</label>
                  <Input
                    id="estimation"
                    name="estimation"
                    type="text"
                    className="bg-white"
                    value={featureRequest.estimation}
                    disabled={true}
                    readOnly={true}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col>
                <FormGroup>
                  <label className="form-control-label">Description</label>
                  <Input
                    id="description"
                    name="description"
                    type="textarea"
                    rows={5}
                    className="bg-white"
                    value={featureRequest.description}
                    disabled={true}
                    readOnly={true}
                  />
                </FormGroup>
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>
    </>
  );
}
