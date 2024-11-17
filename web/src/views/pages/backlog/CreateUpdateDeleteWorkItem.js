import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import { Button, Card, CardBody, CardHeader, Col, Input, Row } from "reactstrap";
import { ErrorMessage, Field, Form, Formik } from "formik";
import InputError from "../../../components/Errors/InputError";
import Select2 from "react-select2-wrapper";
import ReactQuill from "react-quill";
import React, { useCallback, useEffect, useState } from "react";
import * as Yup from "yup";
import { listAllFeatures } from "../../../services/roadmap/roadmap.service";
import {
  addComment,
  deleteComment,
  deleteWorkItem,
  listComments,
  updateComment
} from "../../../services/backlog/backlog.service";
import { listIterations } from "../../../services/iterations/iterations.service";
import FloumyDropZone from "../components/FloumyDropZone";
import { formatHyphenatedString } from "../../../services/utils/utils";
import DeleteWarning from "../components/DeleteWarning";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CardHeaderDetails from "../components/CardHeaderDetails";
import { getOrg } from "../../../services/org/orgs.service";
import Comments from "../../../components/Comments/Comments";
import { listIssues } from "../../../services/issues/issues.service";

function CreateUpdateDeleteWorkItem({ onSubmit, workItem = defaultWorkItem }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [priority, setPriority] = useState(workItem.priority || "");
  const [descriptionText, setDescriptionText] = useState(workItem.description);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState(workItem.type || "");
  const [status, setStatus] = useState(workItem.status || "");
  const [features, setFeatures] = useState([{ id: "", text: "None" }]);
  const [iterations, setIterations] = useState([{ id: "", text: "None" }]);
  const [feature, setFeature] = useState(workItem.feature ? workItem.feature.id : "");
  const [iteration, setIteration] = useState(workItem.iteration ? workItem.iteration.id : "");
  const [deleteWarning, setDeleteWarning] = useState(false);
  const [files, setFiles] = useState([]);
  const [members, setMembers] = useState([{ id: "", text: "None" }]);
  const [assignedTo, setAssignedTo] = useState("");
  const uploadedFiles = workItem.files || [];
  const navigate = useNavigate();
  const paymentPlan = localStorage.getItem("paymentPlan");
  const [comments, setComments] = useState([]);
  const [issues, setIssues] = useState([{ id: "", text: "None" }]);
  const [issue, setIssue] = useState(workItem.issue ? workItem.issue.id : "");

  const loadAndSetIssues = useCallback(async () => {
    // Replace this with your actual API call to fetch issues
    const currentOrg = JSON.parse(localStorage.getItem("currentOrg"));

    const fetchedIssues = await listIssues(currentOrg.id, 1, 0);
    const mappedIssues = fetchedIssues.map(issue => {
      return { id: issue.id, text: `${issue.title}` };
    });
    mappedIssues.push({ id: "", text: "None" });
    setIssues(mappedIssues);
    setIssue(workItem.issue ? workItem.issue.id : "");
  }, [workItem.issue]);

  const loadAndSetFeatures = useCallback(async () => {
    const features = await listAllFeatures();
    const mappedFeatures = features
      .map(feature => {
        return { id: feature.id, text: `${feature.reference}: ${feature.title}` };
      });
    mappedFeatures.push({ id: "", text: "None" });
    setFeatures(mappedFeatures);
    setFeature(workItem.feature ? workItem.feature.id : "");
  }, [workItem.feature]);

  const loadAndSetIterations = useCallback(async () => {
    const iterations = await listIterations();
    const mappedIterations = iterations
      .map(iteration => {
        return {
          id: iteration.id,
          text: `${iteration.startDate} | ${iteration.title} [${formatHyphenatedString(iteration.status)}]`
        };
      });
    mappedIterations.push({ id: "", text: "None" });
    setIterations(mappedIterations);
    setIteration(workItem.iteration ? workItem.iteration.id : "");
  }, [workItem.iteration]);

  const loadAndSetMembers = useCallback(async () => {
    const org = await getOrg();
    const mappedUsers = org.members
      .filter(user => user.isActive || user.id === workItem.assignedTo?.id)
      .map(user => {
        return { id: user.id, text: user.name };
      });
    mappedUsers.push({ id: "", text: "None" });
    setMembers(mappedUsers);
  }, [workItem.assignedTo]);

  const loadAndSetComments = useCallback(async () => {
    const comments = await listComments(workItem.id);
    setComments(comments);
  }, [workItem.id]);

  useEffect(() => {
    document.title = "Floumy | Work Item";

    async function fetchData() {
      setIsLoading(true);
      try {
        await Promise.all([
          loadAndSetFeatures(),
          loadAndSetIterations(),
          loadAndSetMembers(),
          loadAndSetIssues()
        ]);
      } catch (e) {
        toast.error("The work item details could not be loaded");
      } finally {
        setIsLoading(false);
      }
    }

    if (workItem.id) {
      loadAndSetComments();
    }

    fetchData();

  }, [loadAndSetFeatures, loadAndSetIterations, loadAndSetMembers, loadAndSetComments, workItem.id, loadAndSetIssues]);

  useEffect(() => {
    if (workItem.title) {
      setIsUpdate(true);
    }
  }, [workItem.title]);

  useEffect(() => {
    if (workItem.assignedTo && workItem.assignedTo.id) {
      setAssignedTo(workItem.assignedTo.id);
    }
  }, [workItem.assignedTo, members]);

  async function onDelete(id) {
    try {
      setIsSubmitting(true);
      await deleteWorkItem(id);
      navigate(-1);
      setTimeout(() => toast.success("The work item has been deleted"), 1000);
    } catch (e) {
      setDeleteWarning(false);
      toast.error("The work item could not be deleted");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(values) {
    try {
      setIsSubmitting(true);
      const workItem = {
        title: values.title,
        description: descriptionText,
        priority: priority,
        type: type,
        feature: feature,
        iteration: iteration,
        estimation: values.estimation || null,
        status: status,
        files: files,
        assignedTo: assignedTo,
        issue: issue
      };
      await onSubmit(workItem);
      navigate(-1);
      setTimeout(() => toast.success("The work item has been saved"), 100);
    } catch (e) {
      toast.error("The work item could not be saved");
    } finally {
      setIsSubmitting(false);
    }
  }

  const validationSchema = Yup.object({
    title: Yup.string()
      .required("The title is required"),
    estimation: Yup.number()
      .nullable()
      .positive("The estimation must be a positive number")
      .typeError("The estimation must be a number")
  });

  const handleFilesChanged = useCallback((files) => {
    setFiles(files);
  }, []);

  const handleCommentSubmit = async (comment) => {
    try {
      const addedComment = await addComment(workItem.id, comment);
      setComments([...comments, addedComment]);
      toast.success("Comment added successfully");
    } catch (e) {
      toast.error("Failed to add comment");
    }
  };

  const handleCommentEditSubmit = async (commentId, comment) => {
    try {
      const updatedComment = await updateComment(workItem.id, commentId, comment);
      setComments(comments.map(c => c.id === commentId ? updatedComment : c));
      toast.success("Comment updated successfully");
    } catch (e) {
      toast.error("Failed to update comment");
    }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      await deleteComment(workItem.id, commentId);
      setComments(comments.filter(comment => comment.id !== commentId));
      toast.success("Comment deleted successfully");
    } catch (e) {
      toast.error("Failed to delete comment");
    }
  };

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <DeleteWarning
        isOpen={deleteWarning}
        toggle={() => setDeleteWarning(!deleteWarning)}
        entity={"work item"}
        onDelete={() => onDelete(workItem.id)} />
      <Row>
        <Col>
          <Card>
            <CardHeader>
              {!isUpdate && <h3 className="mb-0">New Work Item</h3>}
              {isUpdate && <>
                <h3 className="mb-0">Edit Work Item {workItem.reference}</h3>
                <CardHeaderDetails createdAt={workItem.createdAt} updatedAt={workItem.updatedAt}
                                   createdBy={workItem.createdBy} />
              </>}
            </CardHeader>
            <CardBody>
              <Formik
                initialValues={{ title: workItem.title || "", estimation: workItem.estimation || "" }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ values, handleChange, errors, touched }) => (
                  <Form
                    className="needs-validation"
                    noValidate>
                    <Row className="mb-3">
                      <Col>
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
                          placeholder="What is this work item about?"
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
                      <Col xs={12} sm={3} className="mb-3">
                        <label
                          className="form-control-label"
                          htmlFor="validationCustom01"
                        >
                          Type
                        </label>
                        <Select2
                          className="react-select-container"
                          defaultValue={type}
                          name="type"
                          data={[
                            { id: "user-story", text: "User Story" },
                            { id: "task", text: "Task" },
                            { id: "bug", text: "Bug" },
                            { id: "spike", text: "Spike" },
                            { id: "technical-debt", text: "Technical Debt" }
                          ]}
                          onChange={(e) => setType(e.target.value)}></Select2>
                      </Col>
                      <Col xs={12} sm={3} className="mb-3">
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
                      <Col xs={12} sm={3} className="mb-3">
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
                            { id: "blocked", text: "Blocked" },
                            { id: "code-review", text: "Code Review" },
                            { id: "testing", text: "Testing" },
                            { id: "revisions", text: "Revisions" },
                            { id: "ready-for-deployment", text: "Ready for Deployment" },
                            { id: "deployed", text: "Deployed" },
                            { id: "done", text: "Done" },
                            { id: "closed", text: "Closed" }
                          ]}
                          onChange={(e) => setStatus(e.target.value)}>
                        </Select2>
                      </Col>
                      <Col xs={12} sm={3} className="mb-3">
                        <label className="form-control-label">
                          Estimation
                        </label>
                        <Field
                          as={Input}
                          id="estimation"
                          name="estimation"
                          placeholder="What is the estimation?"
                          type="text"
                          value={values.estimation}
                          onChange={handleChange}
                          invalid={!!(errors.estimation && touched.estimation)}
                          autoComplete="off"
                        />
                        <ErrorMessage name={"estimation"} component={InputError} />
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col>
                        <label
                          className="form-control-label"
                          htmlFor="validationCustom01"
                        >
                          Initiative
                        </label>
                        <Select2
                          className="react-select-container"
                          defaultValue={feature}
                          placeholder="Select an initiative"
                          data={features}
                          onChange={(e) => setFeature(e.target.value)}
                        ></Select2>
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col>
                        <label
                          className="form-control-label"
                          htmlFor="validationCustom01"
                        >
                          Sprint
                        </label>
                        <Select2
                          className="react-select-container"
                          defaultValue={iteration}
                          placeholder="Select a sprint"
                          data={iterations}
                          onChange={(e) => setIteration(e.target.value)}
                        ></Select2>
                      </Col>
                    </Row>
                    {paymentPlan === "premium" && <Row className="mb-3">
                      <Col>
                        <label
                          className="form-control-label"
                          htmlFor="validationCustom01"
                        >
                          Issue
                        </label>
                        <Select2
                          className="react-select-container"
                          defaultValue={issue}
                          placeholder="Select an issue"
                          data={issues}
                          onChange={(e) => setIssue(e.target.value)}
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
                          placeholder="Describe this work item..."
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
                    <Row className="mb-0">
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
                      id={"save-work-item"}
                      color="primary"
                      type="submit"
                      className="mr-3 mb-3"
                      disabled={isSubmitting}
                    >
                      Save Work Item
                    </Button>
                    {isUpdate && <Button
                      id={"delete-work-item"}
                      color="secondary"
                      type="button"
                      className="ml-0 mb-3"
                      onClick={() => setDeleteWarning(true)}
                      disabled={isSubmitting}
                    >
                      Delete Work Item
                    </Button>}
                  </Form>
                )}
              </Formik>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
        {workItem.id && !isLoading &&
          <Col>
            <Comments comments={comments}
                      onCommentAdd={handleCommentSubmit}
                      onCommentDelete={handleCommentDelete}
                      onCommentEdit={handleCommentEditSubmit}
            />
          </Col>}
      </Row>
    </>
  );
}

const defaultWorkItem = {
  title: "",
  description: "",
  priority: "medium",
  type: "user-story",
  estimation: null,
  status: "planned",
  feature: { id: "" },
  iteration: { id: "" }
};

export default CreateUpdateDeleteWorkItem;
