import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import { Button, Card, CardBody, CardHeader, Col, Input, Row } from 'reactstrap';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import InputError from '../../../components/Errors/InputError';
import Select2 from 'react-select2-wrapper';
import React, { useCallback, useEffect, useState } from 'react';
import * as Yup from 'yup';
import { listAllFeatures } from '../../../services/roadmap/roadmap.service';
import {
  addComment,
  deleteComment,
  deleteWorkItem,
  listComments,
  updateComment,
} from '../../../services/backlog/backlog.service';
import { listSprints } from '../../../services/sprints/sprints.service';
import FloumyDropZone from '../components/FloumyDropZone';
import { formatHyphenatedString } from '../../../services/utils/utils';
import DeleteWarning from '../components/DeleteWarning';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import CardHeaderDetails from '../components/CardHeaderDetails';
import { getOrg } from '../../../services/org/orgs.service';
import Comments from '../../../components/Comments/Comments';
import { listIssues } from '../../../services/issues/issues.service';
import RichTextEditor from '../../../components/RichTextEditor/RichTextEditor';
import { getWorkItemDescription } from '../../../services/ai/ai.service';
import AIButton from '../../../components/AI/AIButton';

function CreateUpdateDeleteWorkItem({ onSubmit, workItem = defaultWorkItem }) {
  const { orgId, projectId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [priority, setPriority] = useState(workItem.priority || '');
  const [title, setTitle] = useState(workItem.title);
  const [descriptionText, setDescriptionText] = useState(workItem.description);
  const [mentions, setMentions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState(workItem.type || "");
  const [status, setStatus] = useState(workItem.status || "");
  const [features, setFeatures] = useState([{ id: "", text: "None" }]);
  const [sprints, setSprints] = useState([{ id: "", text: "None" }]);
  const [feature, setFeature] = useState(workItem.feature ? workItem.feature.id : "");
  const [sprint, setSprint] = useState(workItem.sprint ? workItem.sprint.id : "");
  const [deleteWarning, setDeleteWarning] = useState(false);
  const [files, setFiles] = useState([]);
  const [members, setMembers] = useState([{ id: '', text: 'None' }]);
  const [assignedTo, setAssignedTo] = useState('');
  const uploadedFiles = workItem.files || [];
  const navigate = useNavigate();
  const paymentPlan = localStorage.getItem('paymentPlan');
  const [comments, setComments] = useState([]);
  const [issues, setIssues] = useState([{ id: '', text: 'None' }]);
  const [issue, setIssue] = useState(workItem.issue ? workItem.issue.id : '');

  const loadAndSetIssues = useCallback(async () => {
    const fetchedIssues = await listIssues(orgId, projectId, 1, 0);
    const mappedIssues = fetchedIssues.map(issue => {
      return { id: issue.id, text: `${issue.title}` };
    });
    mappedIssues.push({ id: '', text: 'None' });
    setIssues(mappedIssues);
    setIssue(workItem.issue ? workItem.issue.id : '');
  }, [workItem.issue, orgId, projectId]);

  const loadAndSetFeatures = useCallback(async () => {
    const features = await listAllFeatures(orgId, projectId);
    const mappedFeatures = features
      .map(feature => {
        return { id: feature.id, text: `${feature.reference}: ${feature.title}` };
      });
    mappedFeatures.push({ id: '', text: 'None' });
    setFeatures(mappedFeatures);
    setFeature(workItem.feature ? workItem.feature.id : '');
  }, [workItem.feature, orgId, projectId]);

  const loadAndSetSprints = useCallback(async () => {
    const sprints = await listSprints(orgId, projectId);
    const mappedSprints = sprints
      .map(sprint => {
        return {
          id: sprint.id,
          text: `${sprint.startDate} | ${sprint.title} [${formatHyphenatedString(sprint.status)}]`
        };
      });
    mappedSprints.push({ id: "", text: "None" });
    setSprints(mappedSprints);
    setSprint(workItem.sprint ? workItem.sprint.id : "");
  }, [workItem.sprint, orgId, projectId]);

  const loadAndSetMembers = useCallback(async () => {
    const org = await getOrg();
    const mappedUsers = org.members
      .filter(user => user.isActive || user.id === workItem.assignedTo?.id)
      .map(user => {
        return { id: user.id, text: user.name };
      });
    mappedUsers.push({ id: '', text: 'None' });
    setMembers(mappedUsers);
  }, [workItem.assignedTo]);

  const loadAndSetComments = useCallback(async () => {
    const comments = await listComments(orgId, projectId, workItem.id);
    setComments(comments);
  }, [orgId, projectId, workItem.id]);

  useEffect(() => {
    document.title = 'Floumy | Work Item';

    async function fetchData() {
      setIsLoading(true);
      try {
        await Promise.all([
          loadAndSetFeatures(),
          loadAndSetSprints(),
          loadAndSetMembers(),
          loadAndSetIssues(),
        ]);
      } catch (e) {
        toast.error('The work item details could not be loaded');
      } finally {
        setIsLoading(false);
      }
    }

    if (workItem.id) {
      loadAndSetComments();
    }

    fetchData();

  }, [loadAndSetFeatures, loadAndSetSprints, loadAndSetMembers, loadAndSetComments, workItem.id, loadAndSetIssues]);

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
      await deleteWorkItem(orgId, projectId, id);
      navigate(-1);
      setTimeout(() => toast.success('The work item has been deleted'), 1000);
    } catch (e) {
      setDeleteWarning(false);
      toast.error('The work item could not be deleted');
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
        mentions: mentions.map(mention => mention.id),
        priority: priority,
        type: type,
        feature: feature,
        sprint: sprint,
        estimation: values.estimation || null,
        status: status,
        files: files,
        assignedTo: assignedTo,
        issue: issue,
      };
      await onSubmit(workItem);
      navigate(-1);
      setTimeout(() => toast.success('The work item has been saved'), 100);
    } catch (e) {
      toast.error('The work item could not be saved');
    } finally {
      setIsSubmitting(false);
    }
  }

  const validationSchema = Yup.object({
    title: Yup.string()
      .required('The title is required'),
    estimation: Yup.number()
      .nullable()
      .positive('The estimation must be a positive number')
      .typeError('The estimation must be a number'),
  });

  const handleFilesChanged = useCallback((files) => {
    setFiles(files);
  }, []);

  const handleCommentSubmit = async (comment) => {
    try {
      const addedComment = await addComment(orgId, projectId, workItem.id, comment);
      setComments([...comments, addedComment]);
      toast.success('Comment added successfully');
    } catch (e) {
      toast.error('Failed to add comment');
    }
  };

  const handleCommentEditSubmit = async (commentId, comment) => {
    try {
      const updatedComment = await updateComment(orgId, projectId, workItem.id, commentId, comment);
      setComments(comments.map(c => c.id === commentId ? updatedComment : c));
      toast.success('Comment updated successfully');
    } catch (e) {
      toast.error('Failed to update comment');
    }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      await deleteComment(orgId, projectId, workItem.id, commentId);
      setComments(comments.filter(comment => comment.id !== commentId));
      toast.success('Comment deleted successfully');
    } catch (e) {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <DeleteWarning
        isOpen={deleteWarning}
        toggle={() => setDeleteWarning(!deleteWarning)}
        entity={'work item'}
        onDelete={() => onDelete(workItem.id)} />
      <Row className="flex-column flex-lg-row">
        <Col lg={workItem?.id ? 7 : 12} md={12}>
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
                initialValues={{ title: workItem.title || '', estimation: workItem.estimation || '' }}
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
                          onChange={(e) => {
                            setTitle(e.target.value);
                            handleChange(e);
                          }}
                          invalid={!!(errors.title && touched.title)}
                          autoComplete="off"
                        />
                        <ErrorMessage name={'title'} component={InputError} />
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={12} className="mb-3">
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
                            { id: 'planned', text: 'Planned' },
                            { id: 'ready-to-start', text: 'Ready to Start' },
                            { id: 'in-progress', text: 'In Progress' },
                            { id: 'blocked', text: 'Blocked' },
                            { id: 'code-review', text: 'Code Review' },
                            { id: 'testing', text: 'Testing' },
                            { id: 'revisions', text: 'Revisions' },
                            { id: 'ready-for-deployment', text: 'Ready for Deployment' },
                            { id: 'deployed', text: 'Deployed' },
                            { id: 'done', text: 'Done' },
                            { id: 'closed', text: 'Closed' },
                          ]}
                          onChange={(e) => setStatus(e.target.value)}>
                        </Select2>
                      </Col>
                      <Col xs={12} sm={4} className="mb-3">
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
                            { id: 'user-story', text: 'User Story' },
                            { id: 'task', text: 'Task' },
                            { id: 'bug', text: 'Bug' },
                            { id: 'spike', text: 'Spike' },
                            { id: 'technical-debt', text: 'Technical Debt' },
                          ]}
                          onChange={(e) => setType(e.target.value)}></Select2>
                      </Col>
                      <Col xs={12} sm={4} className="mb-3">
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
                            { id: 'high', text: 'High' },
                            { id: 'medium', text: 'Medium' },
                            { id: 'low', text: 'Low' },
                          ]}
                          onChange={(e) => setPriority(e.target.value)}></Select2>
                      </Col>

                      <Col xs={12} sm={4} className="mb-3">
                        <label className="form-control-label">
                          Estimation
                        </label>
                        <Field
                          as={Input}
                          id="estimation"
                          name="estimation"
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
                          defaultValue={sprint}
                          placeholder="Select a sprint"
                          data={sprints}
                          onChange={(e) => setSprint(e.target.value)}
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
                        <AIButton
                            text="Fill with AI"
                            disabled={title.length === 0}
                            onClick={async () => {
                              setDescriptionText(await getWorkItemDescription(title, type, feature, issue));
                            }}
                        />
                        <RichTextEditor value={descriptionText} onChange={(text, mentions) => {
                          setDescriptionText(text);
                          setMentions(mentions);
                        }} toolbar={[
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
                        ]} placeholder="Describe this work item..." />
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
        <Col lg={5} md={12} hidden={!workItem?.id}>
          <Card>
            <CardHeader>
              <h3 className="mb-0">
                Code
              </h3>
            </CardHeader>
            <CardBody>
              <Row>
                <Col>
                  <h4>Branches</h4>
                  <ul className="list-unstyled">
                    {workItem.branches?.length === 0 && <li className="mb-2">No branches found</li>}
                    {workItem.branches?.map((branch) => (
                    <li key={branch.id} className="mb-2">
                      <a href={branch.url} target="_blank" rel="noreferrer" className="text-blue">
                        <span className="mr-2">{branch.name}</span>
                        <i className="fa fa-external-link-alt mr-1" />
                      </a>
                    </li>
                  ))}
                  </ul>
                  <h4>Pull Requests</h4>
                  <ul className="list-unstyled">
                    {workItem.pullRequests?.map((pullRequest) => (
                      <li key={pullRequest.id} className="mb-2">
                        <a href={pullRequest.url} target="_blank" rel="noreferrer" className="text-blue">
                          <span className="mr-2">{pullRequest.title}</span>
                          <i className="fa fa-external-link-alt mr-1" />
                        </a>
                      </li>
                    ))}
                    {workItem.pullRequests?.length === 0 && <li className="mb-2">No pull requests found</li>}
                  </ul>
                </Col>
              </Row>
            </CardBody>
          </Card>
          {workItem.id && !isLoading &&
            <Comments comments={comments}
                      onCommentAdd={handleCommentSubmit}
                      onCommentDelete={handleCommentDelete}
                      onCommentEdit={handleCommentEditSubmit}
            />}
        </Col>
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
  sprint: { id: "" }
};

export default CreateUpdateDeleteWorkItem;
