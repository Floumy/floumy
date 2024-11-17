import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DeleteWarning from "../components/DeleteWarning";
import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Row } from "reactstrap";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import InputError from "../../../components/Errors/InputError";
import Select2 from "react-select2-wrapper";

export default function UpdateIssue({ issue, onUpdate, onDelete }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteWarningOpen, setIsDeleteWarningOpen] = useState(false);
  const [status, setStatus] = useState(issue?.status || "submitted");
  const [priority, setPriority] = useState(issue?.priority || "medium");

  const navigate = useNavigate();

  const handleUpdate = async (values) => {
    try {
      setIsLoading(true);
      const updatedIssue = {
        title: values.title,
        description: values.description,
        status: status,
        priority: priority
      };
      await onUpdate(updatedIssue);
      navigate(-1);
      setTimeout(() => toast.success("The issue has been saved"), 100);
    } catch (e) {
      toast.error("The issue could not be saved");
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Floumy | Issue";
  }, []);

  const handleDelete = async (id) => {
    try {
      await onDelete(id);
      navigate(-1);
      setTimeout(() => toast.success("The issue has been deleted"), 100);
    } catch (e) {
      setIsDeleteWarningOpen(false);
      toast.error("The issue could not be deleted");
    }
  };

  const validationSchema = Yup.object({
    title: Yup.string()
      .required("The title is required"),
    description: Yup.string()
      .required("The description is required")
  });

  return (
    <>
      <DeleteWarning
        isOpen={isDeleteWarningOpen}
        entity={"issue"}
        toggle={() => setIsDeleteWarningOpen(!isDeleteWarningOpen)}
        onDelete={() => handleDelete(issue.id)}
      />
      {isLoading && <InfiniteLoadingBar />}
      <Card>
        <CardHeader>
          <h3 className="mb-0"><span className="mr-2">Edit Issue</span></h3>
        </CardHeader>
        <CardBody>
          <Formik
            initialValues={{
              title: issue?.title || "",
              description: issue?.description || ""
            }}
            validationSchema={validationSchema}
            onSubmit={handleUpdate}
          >
            {({ values, handleChange, errors, touched }) => (
              <Form
                className="needs-validation"
                noValidate>
                <Row>
                  <Col>
                    <FormGroup>
                      <label className="form-control-label">Title</label>
                      <Field
                        as={Input}
                        id="title"
                        name="title"
                        placeholder="Issue title"
                        type="text"
                        value={values.title}
                        onChange={handleChange}
                        invalid={!!(errors.title && touched.title)}
                        autoComplete="off"
                      />
                      <ErrorMessage name={"title"} component={InputError} />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} sm={6} className="mb-3">
                    <label className="form-control-label">Status</label>
                    <Select2
                      className="react-select-container"
                      defaultValue={status}
                      name="status"
                      data={[
                        { id: "submitted", text: "Submitted" },
                        { id: "acknowledged", text: "Acknowledged" },
                        { id: "under-review", text: "Under Review" },
                        { id: "in-progress", text: "In Progress" },
                        { id: "awaiting-customer-response", text: "Awaiting Customer Response" },
                        { id: "resolved", text: "Resolved" },
                        { id: "closed", text: "Closed" }
                      ]}
                      onChange={(e) => setStatus(e.target.value)}
                    />
                  </Col>
                  <Col xs={12} sm={6} className="mb-3">
                    <label className="form-control-label">Priority</label>
                    <Select2
                      className="react-select-container"
                      defaultValue={priority}
                      name="priority"
                      data={[
                        { id: "low", text: "Low" },
                        { id: "medium", text: "Medium" },
                        { id: "high", text: "High" }
                      ]}
                      onChange={(e) => setPriority(e.target.value)}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <FormGroup>
                      <label className="form-control-label">Description</label>
                      <Field
                        as={Input}
                        id="description"
                        name="description"
                        placeholder="Describe the issue"
                        type="textarea"
                        rows={5}
                        value={values.description}
                        onChange={handleChange}
                        invalid={!!(errors.description && touched.description)}
                        autoComplete="off"
                      />
                      <ErrorMessage name={"description"} component={InputError} />
                    </FormGroup>
                  </Col>
                </Row>
                <Button
                  id={"save-issue"}
                  color="primary"
                  type="submit"
                  className="mt-3"
                  disabled={isSubmitting}
                >
                  Save Issue
                </Button>
                <Button
                  id={"delete-issue"}
                  color="secondary"
                  type="button"
                  className="mt-3 ml-2"
                  onClick={() => setIsDeleteWarningOpen(true)}
                  disabled={isSubmitting}
                >
                  Delete Issue
                </Button>
              </Form>
            )}
          </Formik>
        </CardBody>
      </Card>
    </>
  );
}