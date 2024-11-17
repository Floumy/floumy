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
import FeaturesList from "../features/FeaturesList";
import { addFeature } from "../../../services/roadmap/roadmap.service";

export default function UpdateFeatureRequest({ featureRequest, onUpdate, onDelete }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteWarningOpen, setIsDeleteWarningOpen] = useState(false);
  const [status, setStatus] = useState(featureRequest.status);

  const navigate = useNavigate();

  const handleUpdate = async (values) => {
    try {
      setIsLoading(true);
      const updatedFeatureRequest = {
        title: values.title,
        description: values.description,
        status: status,
        estimation: values.estimation || null
      };
      await onUpdate(updatedFeatureRequest);
      navigate(-1);
      setTimeout(() => toast.success("The feature request has been saved"), 100);
    } catch (e) {
      toast.error("The feature request could not be saved");
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Floumy | Feature Request";
  });

  const handleDelete = async (id) => {
    try {
      await onDelete(id);
      navigate(-1);
      setTimeout(() => toast.success("The feature request has been deleted"), 100);
    } catch (e) {
      setIsDeleteWarningOpen(false);
      toast.error("The feature request could not be deleted");
    }
  };

  const validationSchema = Yup.object({
    title: Yup.string()
      .required("The title is required"),
    description: Yup.string()
      .required("The description is required"),
    status: Yup.string()
      .required("The status is required"),
    estimation: Yup.number()
      .nullable()
      .positive("The estimation must be a positive number")
      .typeError("The estimation must be a number")
  });

  async function handleAddFeature(featureRequestId, feature) {
    feature.featureRequest = featureRequestId;
    const savedFeature = await addFeature(feature);
    featureRequest.features.push(savedFeature);
    featureRequest.features.sort(sortFeatures);
  }

  function updateFeaturesStatus(updatedFeatures, status) {
    const updatedFeaturesIds = updatedFeatures.map(feature => feature.id);
    featureRequest.features.map(feature => {
      if (updatedFeaturesIds.includes(feature.id)) {
        feature.status = status;
      }
      return feature;
    });
  }

  function sortFeatures(a, b) {
    const priorityMap = ["high", "medium", "low"];
    return priorityMap.indexOf(a.priority) - priorityMap.indexOf(b.priority);
  }

  function updateFeaturesPriority(updatedFeatures, priority) {
    const updatedFeaturesIds = updatedFeatures.map(feature => feature.id);
    featureRequest.features = featureRequest.features.map(feature => {
      if (updatedFeaturesIds.includes(feature.id)) {
        feature.priority = priority;
      }
      return feature;
    }).sort(sortFeatures);
  }

  return (
    <>
      <DeleteWarning
        isOpen={isDeleteWarningOpen}
        entity={"feature request"}
        toggle={() => setIsDeleteWarningOpen(!isDeleteWarningOpen)}
        onDelete={() => handleDelete(featureRequest.id)}
      />
      {isLoading && <InfiniteLoadingBar />}
      <Card>
        <CardHeader>
          <h3 className="mb-0"><span className="mr-2">Edit Feature Request</span></h3>
        </CardHeader>
        <CardBody>
          <Formik
            initialValues={{
              title: featureRequest?.title || "",
              description: featureRequest?.description || "",
              status: featureRequest?.status || "",
              estimation: featureRequest?.estimation || ""
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
                      <label
                        className="form-control-label"
                      >
                        Title
                      </label>
                      <Field
                        as={Input}
                        id="title"
                        name="title"
                        placeholder="Title"
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
                  <Col>
                    <FormGroup>
                      <label
                        className="form-control-label"
                      >
                        Status
                      </label>
                      <Select2
                        className="react-select-container"
                        defaultValue={status}
                        name="status"
                        data={[
                          { text: "Pending", id: "pending" },
                          { text: "Approved", id: "approved" },
                          { text: "Planned", id: "planned" },
                          { text: "Ready to Start", id: "ready-to-start" },
                          { text: "In Progress", id: "in-progress" },
                          { text: "Completed", id: "completed" },
                          { text: "Closed", id: "closed" }
                        ]}
                        onChange={(e) => setStatus(e.target.value)}>
                      </Select2>
                      <ErrorMessage name={"status"} component={InputError} />
                    </FormGroup>
                  </Col>
                  <Col>
                    <FormGroup>
                      <label
                        className="form-control-label"
                      >
                        Estimation
                      </label>
                      <Field
                        as={Input}
                        id="estimation"
                        name="estimation"
                        type="text"
                        className="bg-white"
                        onChange={handleChange}
                        value={values.estimation}
                        autoComplete={"off"}
                      />
                      <ErrorMessage name={"estimation"} component={InputError} />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <FormGroup>
                      <label
                        className="form-control-label"
                      >
                        Description
                      </label>
                      <Field
                        as={Input}
                        id="description"
                        name="description"
                        placeholder="Description"
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
                  id={"save-feature-request"}
                  color="primary"
                  type="submit"
                  className="mt-3"
                  disabled={isSubmitting}
                >
                  Save Request
                </Button>
                <Button
                  id={"delete-feature-request"}
                  color="secondary"
                  type="button"
                  className="mt-3"
                  onClick={() => setIsDeleteWarningOpen(true)}
                  disabled={isSubmitting}
                >
                  Delete Request
                </Button>
              </Form>
            )}
          </Formik>
        </CardBody>
      </Card>
      {!isLoading && featureRequest && featureRequest.features && <>
        <Card>
          <CardHeader className="border-1">
            <div className="row">
              <div className="col-12">
                <h3 className="mb-0">Related Initiatives</h3>
              </div>
            </div>
          </CardHeader>
          <FeaturesList
            features={featureRequest.features}
            onAddFeature={async (feature) => {
              await handleAddFeature(featureRequest.id, feature);
            }}
            onChangeStatus={updateFeaturesStatus}
            onChangePriority={updateFeaturesPriority}
          />
        </Card>
      </>}
    </>
  );
}