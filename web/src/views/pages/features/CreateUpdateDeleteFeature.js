import { Button, Card, CardBody, CardHeader, Col, Input, Row } from "reactstrap";
import { ErrorMessage, Field, Form, Formik } from "formik";
import InputError from "../../../components/Errors/InputError";
import Select2 from "react-select2-wrapper";
import ReactQuill from "react-quill";
import React, { useCallback, useEffect, useState } from "react";
import { deleteFeature, listMilestones } from "../../../services/roadmap/roadmap.service";
import { listKeyResults } from "../../../services/okrs/okrs.service";
import * as Yup from "yup";
import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import DeleteWarning from "../components/DeleteWarning";
import FloumyDropZone from "../components/FloumyDropZone";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import CardHeaderDetails from "../components/CardHeaderDetails";
import { getOrg } from "../../../services/org/orgs.service";
import { listFeatureRequests } from "../../../services/feature-requests/feature-requests.service";

function CreateUpdateDeleteFeature({ onSubmit, feature }) {
  const [priority, setPriority] = useState("medium");
  const [descriptionText, setDescriptionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyResults, setKeyResults] = useState([{}]);
  const [keyResult, setKeyResult] = useState("");
  const [milestones, setMilestones] = useState([{}]);
  const [milestone, setMilestone] = useState("");
  const [isUpdate, setIsUpdate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("planned");
  const [isDeleteWarningOpen, setIsDeleteWarningOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const uploadedFiles = feature ? feature.files : [];
  const navigate = useNavigate();
  const [members, setMembers] = useState([{ id: "", text: "None" }]);
  const [assignedTo, setAssignedTo] = useState("");
  const [featureRequests, setFeatureRequests] = useState([]);
  const [featureRequest, setFeatureRequest] = useState("");

  const paymentPlan = localStorage.getItem("paymentPlan");
  const { id: orgId } = JSON.parse(localStorage.getItem("currentOrg"));

  const fetchAndSetKeyResults = useCallback(async () => {
    const keyResults = await listKeyResults();
    keyResults.push({ id: "", title: "None" });
    setKeyResults(keyResults);
    if (feature?.keyResult?.id) {
      setKeyResult(feature.keyResult.id);
    } else {
      setKeyResult("");
    }
  }, [feature?.keyResult?.id]);

  const fetchAndSetMilestones = useCallback(async () => {
    const milestones = await listMilestones();
    milestones.push({ id: "", title: "None" });
    setMilestones(milestones);
    if (feature?.milestone?.id) {
      setMilestone(feature.milestone.id);
    } else {
      setMilestone("");
    }
  }, [feature?.milestone?.id]);

  const fetchAndSetMembers = useCallback(async () => {
    const org = await getOrg();
    const mappedUsers = org.members
      .filter(user => user.isActive || user.id === feature?.assignedTo?.id)
      .map(user => {
        return { id: user.id, text: user.name };
      });
    mappedUsers.push({ id: "", text: "None" });
    setMembers(mappedUsers);
  }, [feature?.assignedTo?.id]);

  const fetchAndSetFeatureRequests = useCallback(async () => {
    const featureRequests = await listFeatureRequests(orgId, 1, 0);
    featureRequests.push({ id: "", title: "None" });
    setFeatureRequests(featureRequests);
    if (feature?.featureRequest?.id) {
      setFeatureRequest(feature.featureRequest.id);
    }
  }, [feature?.featureRequest?.id]);

  useEffect(() => {
    document.title = "Floumy | Initiative";

    async function fetchData() {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchAndSetKeyResults(),
          fetchAndSetMilestones(),
          fetchAndSetMembers(),
          fetchAndSetFeatureRequests()
        ]);
      } catch (e) {
        toast.error("The key results and milestones could not be loaded");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [fetchAndSetKeyResults, fetchAndSetMilestones, fetchAndSetMembers]);

  useEffect(() => {
    if (feature?.id) {
      setIsUpdate(true);
      setPriority(feature.priority);
      setStatus(feature.status);
      setDescriptionText(feature.description);
      setKeyResult(feature?.keyResult?.id);
      setMilestone(feature?.milestone?.id);
      setAssignedTo(feature?.assignedTo?.id);
    }
  }, [feature]);

  useEffect(() => {
    if (feature?.assignedTo?.id) {
      setAssignedTo(feature.assignedTo.id);
    }
  }, [feature?.assignedTo?.id, members]);

  useEffect(() => {
    if (feature?.milestone?.id) {
      setMilestone(feature.milestone.id);
    }
  }, [feature?.milestone?.id, milestones]);

  useEffect(() => {
    if (feature?.keyResult?.id) {
      setKeyResult(feature.keyResult.id);
    }
  }, [feature?.keyResult?.id, keyResults]);

  const validationSchema = Yup.object({
    title: Yup.string()
      .required("The title is required")
  });

  function getMilestoneSelectItemText(milestone) {
    if (!milestone.dueDate) {
      return milestone.title;
    }

    return `${milestone.dueDate} | ${milestone.title}`;
  }

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      const feature = {
        title: values.title,
        description: descriptionText,
        priority: priority,
        status: status,
        files: files,
        assignedTo: assignedTo
      };
      if (keyResult !== "") {
        feature.keyResult = keyResult;
      }
      if (milestone !== "") {
        feature.milestone = milestone;
      }
      await onSubmit(feature);
      setIsSubmitting(false);
      navigate(-1);
      setTimeout(() => toast.success("The feature has been saved"), 100);
    } catch (e) {
      setIsSubmitting(false);
      toast.error("The feature could not be saved");
    }
  };

  const onDelete = async (id) => {
    try {
      await deleteFeature(id);
      navigate(-1);
      setTimeout(() => toast.success("The feature has been deleted"), 100);
    } catch (e) {
      toast.error("The feature could not be deleted");
      setIsDeleteWarningOpen(false);
    }
  };

  const handleFilesChanged = useCallback((files) => {
    setFiles(files);
  }, []);

  return (
    <>
      <DeleteWarning
        isOpen={isDeleteWarningOpen}
        entity={"initiative"}
        toggle={() => setIsDeleteWarningOpen(!isDeleteWarningOpen)}
        onDelete={() => onDelete(feature.id)}
      />
      {isLoading && <InfiniteLoadingBar />}
      <Card>
        <CardHeader>
          {!isUpdate && <h3 className="mb-0">New Initiative</h3>}
          {isUpdate && <h3 className="mb-0">Edit Initiative {feature.reference}</h3>}
          {isUpdate && <CardHeaderDetails createdAt={feature.createdAt}
                                          updatedAt={feature.updatedAt}
                                          createdBy={feature.createdBy} />}
        </CardHeader>
        <CardBody>
          <Formik
            initialValues={{ title: feature?.title || "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, handleChange, errors, touched }) => (
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
                    <Field
                      as={Input}
                      id="title"
                      name="title"
                      placeholder="What do you want to create?"
                      type="text"
                      value={values.title}
                      onChange={handleChange}
                      invalid={!!(errors.title && touched.title)}
                      autoComplete="off"
                    />
                    <ErrorMessage name={"title"} component={InputError} />
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
                    <Select2
                      className="react-select-container"
                      defaultValue={priority}
                      name="priority"
                      data={[
                        { id: "high", text: "High" },
                        { id: "medium", text: "Medium" },
                        { id: "low", text: "Low" }
                      ]}
                      onChange={(e) => setPriority(e.target.value)}></Select2>
                  </Col>
                  <Col xs={12} sm={6} className="mb-3">
                    <label
                      className="form-control-label"
                      htmlFor="validationCustom01"
                    >
                      Status
                    </label>
                    <Select2
                      className="react-select-container"
                      defaultValue={status}
                      name="status"
                      data={[
                        { id: "planned", text: "Planned" },
                        { id: "ready-to-start", text: "Ready to Start" },
                        { id: "in-progress", text: "In Progress" },
                        { id: "completed", text: "Completed" },
                        { id: "closed", text: "Closed" }
                      ]}
                      onChange={(e) => setStatus(e.target.value)}></Select2>
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
                    <Select2
                      className="react-select-container"
                      defaultValue={keyResult}
                      placeholder="Select a key result"
                      data={keyResults.map((keyResult) => {
                        if (!keyResult.id) {
                          return { id: "", text: "None" };
                        }

                        return { id: keyResult.id, text: `${keyResult.reference}: ${keyResult.title}` };
                      })}
                      onChange={(e) => setKeyResult(e.target.value)}
                    ></Select2>
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
                    <Select2
                      className="react-select-container"
                      defaultValue={milestone}
                      placeholder="Select a milestone"
                      data={milestones.map((milestone) => {
                        return { id: milestone.id, text: getMilestoneSelectItemText(milestone) };
                      })}
                      onChange={(e) => setMilestone(e.target.value)}
                    ></Select2>
                  </Col>
                </Row>
                {paymentPlan === "premium" && <Row className="mb-3">
                  <Col>
                    <label
                      className="form-control-label"
                      htmlFor="validationCustom01"
                    >
                      Feature Request
                    </label>
                    <Select2
                      className="react-select-container"
                      defaultValue={featureRequest}
                      placeholder="Select a feature request"
                      data={featureRequests.map((featureRequest) => {
                        return { id: featureRequest.id, text: featureRequest.title };
                      })}
                      onChange={(e) => setFeatureRequest(e.target.value)}
                    ></Select2>
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
                      value={descriptionText}
                      onChange={(value) => setDescriptionText(value)}
                      theme="snow"
                      placeholder="Describe your initiative and its impact ..."
                      modules={{
                        toolbar: [
                          ["bold", "italic"],
                          ["link", "blockquote", "code", "image", "video"],
                          [
                            {
                              list: "ordered"
                            },
                            {
                              list: "bullet"
                            }
                          ]
                        ]
                      }}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <label
                      className="form-control-label"
                      htmlFor="validationCustom01"
                    >
                      Attachments
                    </label>
                    <FloumyDropZone onFilesChanged={handleFilesChanged} initialFiles={uploadedFiles} />
                  </Col>
                </Row>
                <Row className="mb-5">
                  <Col>
                    <label
                      className="form-control-label"
                      htmlFor="validationCustom01"
                    >
                      Assigned to
                    </label>
                    <Select2
                      className="react-select-container"
                      defaultValue={assignedTo}
                      data={members}
                      onChange={(e) => setAssignedTo(e.target.value)}
                    ></Select2>
                  </Col>
                </Row>
                <Button
                  id={"save-feature"}
                  color="primary"
                  type="submit"
                  className="mt-3"
                  disabled={isSubmitting}
                >
                  Save Initiative
                </Button>
                {isUpdate && <Button
                  id={"delete-feature"}
                  color="secondary"
                  type="button"
                  className="mt-3"
                  onClick={() => setIsDeleteWarningOpen(true)}
                  disabled={isSubmitting}
                >
                  Delete Initiative
                </Button>}
              </Form>
            )}
          </Formik>
        </CardBody>
      </Card>
    </>
  );
}

export default CreateUpdateDeleteFeature;
