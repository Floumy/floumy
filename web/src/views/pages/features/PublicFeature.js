import { Card, CardBody, CardHeader, Col, Form, Input, Row } from "reactstrap";
import ReactQuill from "react-quill";
import React from "react";
import CardHeaderDetails from "../components/CardHeaderDetails";
import { featureStatusName, priorityName } from "../../../services/utils/utils";
import PublicShareButtons from "../../../components/PublicShareButtons/PublicShareButtons";

function PublicFeature({ feature }) {
  return (
    <>
      <Card>
        <CardHeader>
          <h3 className="mb-0">Initiative {feature.reference}</h3>
          <CardHeaderDetails createdAt={feature.createdAt}
                             updatedAt={feature.updatedAt} />
          {feature && <div className="py-2"><PublicShareButtons title={feature.title} /></div>}
        </CardHeader>
        <CardBody>
          <Form
            className="needs-validation"
            noValidate>
            <Row>
              <Col className="mb-3">
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
                  value={feature.title}
                  autoComplete="off"
                  disabled={true}
                  className="bg-white"
                />
              </Col>
            </Row>
            <Row>
              <Col xs={12} sm={6} className="mb-3">
                <label
                  className="form-control-label"
                  htmlFor="validationCustom01"
                >
                  Priority
                </label>
                <Input
                  type="text"
                  disabled={true}
                  className="bg-white"
                  defaultValue={priorityName(feature?.priority)}
                  name="priority"></Input>
              </Col>
              <Col xs={12} sm={6} className="mb-3">
                <label
                  className="form-control-label"
                  htmlFor="validationCustom01"
                >
                  Status
                </label>
                <Input
                  disabled={true}
                  type="text"
                  className="bg-white"
                  defaultValue={featureStatusName(feature?.status)}
                  name="status"
                ></Input>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <label
                  className="form-control-label"
                  htmlFor="validationCustom01"
                >
                  Key Result
                </label>
                <Input
                  type="text"
                  disabled={true}
                  className="bg-white"
                  defaultValue={feature.keyResult?.title || "None"}
                ></Input>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <label
                  className="form-control-label"
                  htmlFor="validationCustom01"
                >
                  Milestone
                </label>
                <Input
                  type="text"
                  disabled={true}
                  className="bg-white"
                  defaultValue={feature.milestone?.title || "None"}
                ></Input>
              </Col>
            </Row>
            {feature.featureRequest !== undefined && <Row className="mb-3">
              <Col>
                <label
                  className="form-control-label"
                  htmlFor="validationCustom01"
                >
                  Feature Request
                </label>
                <Input
                  type="text"
                  disabled={true}
                  className="bg-white"
                  defaultValue={feature.featureRequest?.title || "None"}
                ></Input>
              </Col>
            </Row>}
            <Row className="mb-3">
              <Col>
                <label
                  className="form-control-label"
                  htmlFor="validationCustom01"
                >
                  Description
                </label>
                <ReactQuill
                  value={feature.description}
                  readOnly={true}
                  theme="snow"
                  modules={{
                    toolbar: false
                  }}
                />
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>
    </>
  );
}

export default PublicFeature;
