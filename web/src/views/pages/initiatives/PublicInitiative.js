import { Card, CardBody, CardHeader, Col, Form, Input, Row } from "reactstrap";
import ReactQuill from "react-quill";
import React from "react";
import CardHeaderDetails from "../components/CardHeaderDetails";
import { initiativeStatusName, priorityName } from "../../../services/utils/utils";
import PublicShareButtons from "../../../components/PublicShareButtons/PublicShareButtons";

function PublicInitiative({ initiative }) {
  return (
    <>
      <Card>
        <CardHeader>
          <h3 className="mb-0">Initiative {initiative.reference}</h3>
          <CardHeaderDetails createdAt={initiative.createdAt}
                             updatedAt={initiative.updatedAt} />
          {initiative && <div className="py-2"><PublicShareButtons title={initiative.title} /></div>}
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
                  value={initiative.title}
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
                  defaultValue={priorityName(initiative?.priority)}
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
                  defaultValue={initiativeStatusName(initiative?.status)}
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
                  defaultValue={initiative.keyResult?.title || "None"}
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
                  defaultValue={initiative.milestone?.title || "None"}
                ></Input>
              </Col>
            </Row>
            {initiative.featureRequest !== undefined && <Row className="mb-3">
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
                  defaultValue={initiative.featureRequest?.title || "None"}
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
                  value={initiative.description}
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

export default PublicInitiative;
