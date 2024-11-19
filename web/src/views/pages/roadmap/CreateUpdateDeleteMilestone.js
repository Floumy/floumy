import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Row } from "reactstrap";
import { ErrorMessage, Field, Form, Formik } from "formik";
import InputError from "../../../components/Errors/InputError";
import ReactDatetime from "react-datetime";
import { addFeature, deleteMilestone } from "../../../services/roadmap/roadmap.service";
import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import DeleteWarning from "../components/DeleteWarning";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import FeaturesListCard from "../features/FeaturesListCard";

function CreateUpdateDeleteMilestone({ onSubmit, milestone = { id: "", title: "", description: "", dueDate: "" } }) {
  const { orgId, productId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dueDate, setDueDate] = useState(milestone?.dueDate);
  const [isDueDateInvalid, setIsDueDateInvalid] = useState(false);
  const [isDueDateTouched, setIsDueDateTouched] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isDeleteWarningOpen, setIsDeleteWarningOpen] = useState(false);
  const [features, setFeatures] = useState(milestone?.features);
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    title: Yup.string()
      .required("The title is required")
  });

  const handleSubmit = async (values) => {
    try {
      if (dueDate === "") {
        setIsDueDateInvalid(true);
        return;
      }
      setIsSubmitting(true);
      setIsDueDateInvalid(false);
      await onSubmit({
        title: values.title,
        description: values.description,
        dueDate: dueDate
      });
      navigate(-1);
      setTimeout(() => toast.success("The milestone has been saved"), 100);
    } catch (e) {
      toast.error("The milestone could not be saved");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    document.title = "Floumy | Milestone";
    if (milestone.id) {
      setIsUpdate(true);
    }
  }, [milestone]);

  function getDueDateClassName() {
    if (isDueDateInvalid) {
      return "form-control is-invalid";
    }
    return "form-control ";
  }

  const onDelete = async (id) => {
    try {
      await deleteMilestone(orgId, productId, id);
      navigate(-1);
      setTimeout(() => toast.success("The milestone has been deleted"), 100);
    } catch (e) {
      setIsDeleteWarningOpen(false);
      toast.error("The milestone could not be deleted");
    }
  };

  function isDate(value) {
    return value && typeof value.format === "function";
  }

  function updateFeaturesMilestone(updatedFeatures, newMilestoneId) {
    if (milestone.id === newMilestoneId) {
      return;
    }
    const newFeatures = [];
    for (const feature of features) {
      if (!updatedFeatures.some(f => f.id === feature.id)) {
        feature.milestone = newMilestoneId;
        newFeatures.push(feature);
      }
    }

    setFeatures(newFeatures);
  }

  function onAddFeature() {
    return async (feature) => {
      feature.milestone = milestone.id;
      const savedFeature = await addFeature(orgId, productId, feature);
      features.push(savedFeature);
      setFeatures([...features]);
    };
  }

  return (
    <>
      <DeleteWarning
        isOpen={isDeleteWarningOpen}
        entity={"milestone"}
        toggle={() => setIsDeleteWarningOpen(!isDeleteWarningOpen)}
        onDelete={() => onDelete(milestone.id)}
      />
      {isSubmitting && <InfiniteLoadingBar />}
      <Card>
        <CardHeader>
          {isUpdate && <h3 className="mb-0">Edit Milestone</h3>}
          {!isUpdate && <h3 className="mb-0">New Milestone</h3>}
        </CardHeader>
        <CardBody>
          <Formik
            initialValues={{ title: milestone?.title, description: milestone?.description }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            validate={(values) => {
              const errors = {};
              if (values.title === "") {
                errors.title = "The title is required";
              }
              if (isDueDateTouched && dueDate === "") {
                setIsDueDateInvalid(true);
              }
              return errors;
            }}
          >
            {({ values, handleChange, errors, touched }) => (
              <Form
                className="needs-validation"
                noValidate>
                <Row>
                  <Col className="mb-3" md="8">
                    <label
                      className="form-control-label"
                      htmlFor="validationCustom01"
                    >
                      Title
                    </label>
                    <Field
                      as={Input}
                      id="title"
                      name="title"
                      placeholder="What is the title of this milestone?"
                      type="text"
                      value={values.title}
                      onChange={handleChange}
                      invalid={!!(errors.title && touched.title)}
                      autoComplete="off"
                    />
                    <ErrorMessage name={"title"} component={InputError} />
                  </Col>
                  <Col>
                    <FormGroup>
                      <label
                        className="form-control-label"
                      >
                        Due Date
                      </label>
                      <ReactDatetime
                        inputProps={{
                          placeholder: "When is this due?",
                          className: getDueDateClassName(),
                          onBlur: () => setIsDueDateTouched(true)
                        }}
                        closeOnSelect={true}
                        timeFormat={false}
                        dateFormat={"YYYY-MM-DD"}
                        value={dueDate}
                        onChange={(value) => isDate(value) ? setDueDate(value.format("YYYY-MM-DD")) : setDueDate("")}
                      />
                      {isDueDateInvalid &&
                        <InputError>
                          The due date is required
                        </InputError>
                      }
                    </FormGroup>
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
                    <Field
                      as={Input}
                      id="description"
                      name="description"
                      placeholder="What is the description of this milestone?"
                      type="textarea"
                      resize="none"
                      value={values.description}
                      onChange={handleChange}
                      invalid={!!(errors.description && touched.description)}
                      autoComplete="off"
                    />
                  </Col>
                </Row>
                <Button
                  id={"save-milestone"}
                  color="primary"
                  type="submit"
                  className="mt-3"
                  disabled={isSubmitting}
                >
                  Save Milestone
                </Button>
                {isUpdate && <Button
                  id={"delete-milestone"}
                  color="secondary"
                  type="button"
                  className="mt-3"
                  onClick={() => setIsDeleteWarningOpen(true)}
                  disabled={isSubmitting}
                >
                  Delete Milestone
                </Button>}
              </Form>
            )}
          </Formik>
        </CardBody>
      </Card>
      {features && <FeaturesListCard
        title="Initiatives"
        features={features}
        showAssignedTo={true}
        onAddFeature={onAddFeature()}
        onChangeMilestone={updateFeaturesMilestone}
      />}
    </>
  );
}

export default CreateUpdateDeleteMilestone;
