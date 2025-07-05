import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Input,
  Row,
} from 'reactstrap';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import InputError from '../../../components/Errors/InputError';
import Select2 from 'react-select2-wrapper';
import React, { useCallback, useEffect, useState } from 'react';
import {
  deleteInitiative,
  listMilestones,
} from '../../../services/roadmap/roadmap.service';
import { listKeyResults } from '../../../services/okrs/okrs.service';
import * as Yup from 'yup';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import DeleteWarning from '../components/DeleteWarning';
import FloumyDropZone from '../components/FloumyDropZone';
import { toast } from 'react-toastify';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CardHeaderDetails from '../components/CardHeaderDetails';
import { getOrg } from '../../../services/org/orgs.service';
import { listFeatureRequests } from '../../../services/feature-requests/feature-requests.service';
import RichTextEditor from '../../../components/RichTextEditor/RichTextEditor';
import AIButton from '../../../components/AI/AIButton';
import { getInitiativeDescription } from '../../../services/ai/ai.service';

function CreateUpdateDeleteInitiative({ onSubmit, initiative }) {
  const { orgId, projectId } = useParams();
  const [priority, setPriority] = useState('medium');
  const [descriptionText, setDescriptionText] = useState('');
  const [mentions, setMentions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyResults, setKeyResults] = useState([{}]);
  const [keyResult, setKeyResult] = useState('');
  const [milestones, setMilestones] = useState([{}]);
  const [milestone, setMilestone] = useState('');
  const [isUpdate, setIsUpdate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('planned');
  const [isDeleteWarningOpen, setIsDeleteWarningOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const uploadedFiles = initiative ? initiative.files : [];
  const navigate = useNavigate();
  const [members, setMembers] = useState([{ id: '', text: 'None' }]);
  const [assignedTo, setAssignedTo] = useState('');
  const [featureRequests, setFeatureRequests] = useState([]);
  const [featureRequest, setFeatureRequest] = useState('');

  const paymentPlan = localStorage.getItem('paymentPlan');

  const fetchAndSetKeyResults = useCallback(async () => {
    const keyResults = await listKeyResults(orgId, projectId);
    keyResults.push({ id: '', title: 'None' });
    setKeyResults(keyResults);
    if (initiative?.keyResult?.id) {
      setKeyResult(initiative.keyResult.id);
    } else {
      setKeyResult('');
    }
  }, [initiative?.keyResult?.id, orgId, projectId]);

  const fetchAndSetMilestones = useCallback(async () => {
    const milestones = await listMilestones(orgId, projectId);
    milestones.push({ id: '', title: 'None' });
    setMilestones(milestones);
    if (initiative?.milestone?.id) {
      setMilestone(initiative.milestone.id);
    } else {
      setMilestone('');
    }
  }, [initiative?.milestone?.id, orgId, projectId]);

  const fetchAndSetMembers = useCallback(async () => {
    const org = await getOrg();
    const mappedUsers = org.members
      .filter((user) => user.isActive || user.id === initiative?.assignedTo?.id)
      .map((user) => {
        return { id: user.id, text: user.name };
      });
    mappedUsers.push({ id: '', text: 'None' });
    setMembers(mappedUsers);
  }, [initiative?.assignedTo?.id]);

  const fetchAndSetFeatureRequests = useCallback(async () => {
    const featureRequests = await listFeatureRequests(orgId, projectId, 1, 0);
    featureRequests.push({ id: '', title: 'None' });
    setFeatureRequests(featureRequests);
    if (initiative?.featureRequest?.id) {
      setFeatureRequest(initiative.featureRequest.id);
    }
  }, [initiative?.featureRequest?.id, orgId, projectId]);

  useEffect(() => {
    document.title = 'Floumy | Initiative';

    async function fetchData() {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchAndSetKeyResults(),
          fetchAndSetMilestones(),
          fetchAndSetMembers(),
          fetchAndSetFeatureRequests(),
        ]);
      } catch (e) {
        toast.error('The key results and milestones could not be loaded');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [
    fetchAndSetKeyResults,
    fetchAndSetMilestones,
    fetchAndSetMembers,
    fetchAndSetFeatureRequests,
  ]);

  useEffect(() => {
    if (initiative?.id) {
      setIsUpdate(true);
      setPriority(initiative.priority);
      setStatus(initiative.status);
      setDescriptionText(initiative.description);
      setKeyResult(initiative?.keyResult?.id);
      setMilestone(initiative?.milestone?.id);
      setAssignedTo(initiative?.assignedTo?.id);
    }
  }, [initiative]);

  useEffect(() => {
    if (initiative?.assignedTo?.id) {
      setAssignedTo(initiative.assignedTo.id);
    }
  }, [initiative?.assignedTo?.id, members]);

  useEffect(() => {
    if (initiative?.milestone?.id) {
      setMilestone(initiative.milestone.id);
    }
  }, [initiative?.milestone?.id, milestones]);

  useEffect(() => {
    if (initiative?.keyResult?.id) {
      setKeyResult(initiative.keyResult.id);
    }
  }, [initiative?.keyResult?.id, keyResults]);

  const validationSchema = Yup.object({
    title: Yup.string().required('The title is required'),
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
      const initiativeToBeSaved = {
        title: values.title,
        description: descriptionText,
        mentions: mentions.map((mention) => mention.id),
        priority: priority,
        status: status,
        files: files,
        assignedTo: assignedTo,
        featureRequest: featureRequest,
      };
      if (keyResult !== '') {
        initiativeToBeSaved.keyResult = keyResult;
      }
      if (milestone !== '') {
        initiativeToBeSaved.milestone = milestone;
      }
      const savedInitiative = await onSubmit(initiativeToBeSaved);

      setIsSubmitting(false);

      setTimeout(() => toast.success('The initiative has been saved'), 100);
      if (!initiative || !initiative.id) {
        navigate(
          `/admin/orgs/${orgId}/projects/${projectId}/roadmap/initiatives/detail/${savedInitiative.id}`,
          { replace: true },
        );
      }
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
      toast.error('The initiative could not be saved');
    }
  };

  const onDelete = async (id) => {
    try {
      await deleteInitiative(orgId, projectId, id);
      navigate(-1);
      setTimeout(() => toast.success('The initiative has been deleted'), 100);
    } catch (e) {
      toast.error('The initiative could not be deleted');
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
        entity={'initiative'}
        toggle={() => setIsDeleteWarningOpen(!isDeleteWarningOpen)}
        onDelete={() => onDelete(initiative.id)}
      />
      {isLoading && <InfiniteLoadingBar />}
      <Card>
        <CardHeader>
          {!isUpdate && <h3 className="mb-0">New Initiative</h3>}
          {isUpdate && (
            <h3 className="mb-0">Edit Initiative {initiative.reference}</h3>
          )}
          {isUpdate && (
            <CardHeaderDetails
              createdAt={initiative.createdAt}
              updatedAt={initiative.updatedAt}
              createdBy={initiative.createdBy}
            />
          )}
        </CardHeader>
        <CardBody>
          <Formik
            initialValues={{ title: initiative?.title || '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, handleChange, errors, touched }) => (
              <Form className="needs-validation" noValidate>
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
                    <ErrorMessage name={'title'} component={InputError} />
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
                        { id: 'high', text: 'High' },
                        { id: 'medium', text: 'Medium' },
                        { id: 'low', text: 'Low' },
                      ]}
                      onChange={(e) => setPriority(e.target.value)}
                    ></Select2>
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
                        { id: 'planned', text: 'Planned' },
                        { id: 'ready-to-start', text: 'Ready to Start' },
                        { id: 'in-progress', text: 'In Progress' },
                        { id: 'completed', text: 'Completed' },
                        { id: 'closed', text: 'Closed' },
                      ]}
                      onChange={(e) => setStatus(e.target.value)}
                    ></Select2>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col>
                    <label
                      className="form-control-label"
                      htmlFor="validationCustom01"
                    >
                      {keyResult ? (
                        <Link
                          to={`/admin/orgs/${orgId}/projects/${projectId}/kr/detail/${keyResult}`}
                        >
                          Key Result
                          <i className="fa fa-link ml-2" />
                        </Link>
                      ) : (
                        'Key Result'
                      )}
                    </label>
                    <Select2
                      className="react-select-container"
                      defaultValue={keyResult}
                      placeholder="Select a key result"
                      data={keyResults.map((keyResult) => {
                        if (!keyResult.id) {
                          return { id: '', text: 'None' };
                        }

                        return {
                          id: keyResult.id,
                          text: `${keyResult.reference}: ${keyResult.title}`,
                        };
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
                      {milestone ? (
                        <Link
                          to={`/admin/orgs/${orgId}/projects/${projectId}/roadmap/milestones/edit/${milestone}`}
                        >
                          Milestone
                          <i className="fa fa-link ml-2" />
                        </Link>
                      ) : (
                        'Milestone'
                      )}
                    </label>
                    <Select2
                      className="react-select-container"
                      defaultValue={milestone}
                      placeholder="Select a milestone"
                      data={milestones.map((milestone) => {
                        return {
                          id: milestone.id,
                          text: getMilestoneSelectItemText(milestone),
                        };
                      })}
                      onChange={(e) => setMilestone(e.target.value)}
                    ></Select2>
                  </Col>
                </Row>
                {paymentPlan === 'premium' && (
                  <Row className="mb-3">
                    <Col>
                      <label
                        className="form-control-label"
                        htmlFor="validationCustom01"
                      >
                        {featureRequest ? (
                          <Link
                            to={`/admin/orgs/${orgId}/projects/${projectId}/feature-requests/edit/${featureRequest}`}
                          >
                            Feature Request
                            <i className="fa fa-link ml-2" />
                          </Link>
                        ) : (
                          'Feature Request'
                        )}
                      </label>
                      <Select2
                        className="react-select-container"
                        defaultValue={featureRequest}
                        placeholder="Select a feature request"
                        data={featureRequests.map((featureRequest) => {
                          return {
                            id: featureRequest.id,
                            text: featureRequest.title,
                          };
                        })}
                        onChange={(e) => setFeatureRequest(e.target.value)}
                      ></Select2>
                    </Col>
                  </Row>
                )}
                <Row className="mb-5">
                  <Col>
                    <label
                      className="form-control-label"
                      htmlFor="validationCustom01"
                    >
                      Description
                    </label>
                    {!initiative?.description && (
                      <AIButton
                        text="Fill with AI"
                        disabled={values.title.length === 0}
                        onClick={async () => {
                          const response = await getInitiativeDescription(
                            values.title,
                            keyResult,
                            milestone,
                            featureRequest,
                          );
                          setDescriptionText(response);
                        }}
                      />
                    )}
                    <RichTextEditor
                      value={descriptionText}
                      onChange={(text, mentions) => {
                        setDescriptionText(text);
                        setMentions(mentions);
                      }}
                      toolbar={[
                        ['bold', 'italic'],
                        ['link', 'blockquote', 'code', 'image', 'video'],
                        [
                          {
                            list: 'ordered',
                          },
                          {
                            list: 'bullet',
                          },
                        ],
                      ]}
                      placeholder="Describe your initiative and its impact ..."
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
                    <FloumyDropZone
                      onFilesChanged={handleFilesChanged}
                      initialFiles={uploadedFiles}
                    />
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
                  id={'save-initiative'}
                  color="primary"
                  type="submit"
                  className="mt-3"
                  disabled={isSubmitting}
                >
                  Save Initiative
                </Button>
                {isUpdate && (
                  <Button
                    id={'delete-initiative'}
                    color="secondary"
                    type="button"
                    className="mt-3"
                    onClick={() => setIsDeleteWarningOpen(true)}
                    disabled={isSubmitting}
                  >
                    Delete Initiative
                  </Button>
                )}
              </Form>
            )}
          </Formik>
        </CardBody>
      </Card>
    </>
  );
}

export default CreateUpdateDeleteInitiative;
