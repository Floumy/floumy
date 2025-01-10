import React, { useEffect, useMemo, useState } from 'react';
// javascript plugin that creates a sortable object from a dom object
// reactstrap components
import { Badge, Button, Card, CardBody, CardHeader, Col, Container, Input, Progress, Row, Table } from 'reactstrap';
// core components
import SimpleHeader from 'components/Headers/SimpleHeader.js';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  addKeyResult,
  addObjectiveComment,
  deleteObjectiveComment,
  deleteOKR,
  getOKR,
  updateObjective,
  updateObjectiveComment,
} from '../../../services/okrs/okrs.service';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import NotFoundCard from '../components/NotFoundCard';
import DetailOKRStats from './DetailOKRStats';
import {
  dateToQuarterAndYear,
  formatHyphenatedString,
  formatOKRsProgress,
  okrStatusColorClassName,
} from '../../../services/utils/utils';
import DeleteWarning from '../components/DeleteWarning';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import InputError from '../../../components/Errors/InputError';
import Select2 from 'react-select2-wrapper';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { getOrg } from '../../../services/org/orgs.service';
import Comments from '../../../components/Comments/Comments';
import { generateKeyResults } from '../../../services/ai/ai.service';
import AIButton from '../../../components/AI/AIButton';

function DetailOKR() {
  const { orgId, projectId, id } = useParams();
  const [okr, setOKR] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeline, setTimeline] = useState('this-quarter');
  const [status, setStatus] = useState('on-track');
  const [isDeleteWarningOpen, setIsDeleteWarningOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [members, setMembers] = useState([{ id: '', text: 'None' }]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [assignedTo, setAssignedTo] = useState('');
  const [timelineOptions, setTimelineOptions] = useState([
    { id: 'this-quarter', text: 'This Quarter' },
    { id: 'next-quarter', text: 'Next Quarter' },
    { id: 'later', text: 'Later' },
  ]);

  useEffect(() => {
    async function fetchAndSetMembers() {
      try {
        const org = await getOrg();
        setMembers(org.members);
      } catch (e) {
        toast.error('The members could not be loaded');
      }
    }

    async function fetchAndSetOKR() {
      try {
        const okr = await getOKR(orgId, projectId, id);
        setOKR(okr);
        setStatus(okr.objective.status);
        setTimeline(okr.objective.timeline);
        setAssignedTo(okr.objective?.assignedTo?.id || '');
        // We need this to show the past quarter in the timeline options
        if (okr.objective.timeline === 'past') {
          setTimelineOptions([...timelineOptions, {
            id: okr.objective.timeline,
            text: dateToQuarterAndYear(new Date(okr.objective.startDate)),
          }]);
        }
      } catch (e) {
        toast.error('The OKR could not be loaded');
      }
    }

    async function fetchData() {
      setIsLoading(true);
      await Promise.all([fetchAndSetMembers(), fetchAndSetOKR()]);
      setIsLoading(false);
    }

    fetchData();
  }, [id, orgId, projectId, timelineOptions]);

  useMemo(() => {
    const filteredOrgMembers =
      members
        .filter(member =>
          member.isActive ||
          member.id === assignedTo ||
          member.id === '')
        .map(user => {
          return { id: user.id, text: user.name };
        });
    filteredOrgMembers.push({ id: '', text: 'None' });
    setFilteredMembers(filteredOrgMembers);
  }, [members, assignedTo]);

  const statuses = [
    { id: 'on-track', text: 'On-Track' },
    { id: 'off-track', text: 'Off-Track' },
    { id: 'at-risk', text: 'At Risk' },
    { id: 'ahead-of-schedule', text: 'Ahead of Schedule' },
    { id: 'completed', text: 'Completed' },
    { id: 'stalled', text: 'Stalled' },
    { id: 'deferred', text: 'Deferred' },
    { id: 'cancelled', text: 'Cancelled' },
    { id: 'under-review', text: 'Under Review' },
    { id: 'needs-attention', text: 'Needs Attention' },
  ];

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      await updateObjective(orgId, projectId, okr.objective.id, {
        title: values.title,
        assignedTo,
        status,
        timeline,
      });
      navigate(-1);
      setTimeout(() => toast.success('The OKR has been saved'), 100);
    } catch (e) {
      toast.error('The OKR could not be saved');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await deleteOKR(orgId, projectId, okr.objective.id);
      navigate(-1);
      setTimeout(() => toast.success('The OKR has been deleted'), 100);
    } catch (e) {
      setIsDeleteWarningOpen(false);
      toast.error('The OKR could not be deleted');
    } finally {
      setIsSubmitting(false);
      setIsDeleteWarningOpen(false);
    }
  };

  async function handleAddKeyResult(values) {
    try {
      toast.success('The key result has been added');
      const keyResult = {
        title: values.title,
        status: 'on-track',
        progress: 0,
      };
      const savedKeyResult = await addKeyResult(orgId, projectId, okr.objective.id, keyResult);
      okr.keyResults.push(savedKeyResult);
      setOKR({ ...okr });
    } catch (e) {
      toast.error('The key result could not be saved');
      console.error(e);
    }
  }

  const handleAddKeyResultsWithAi = async (keyResults) => {
    try {
      toast.success('The key results have been added');
      const keyResultsToAdd = keyResults.map(keyResult => {
        return { title: keyResult.title, status: 'on-track', progress: 0 };
      });
      okr.keyResults = await Promise.all(
        keyResultsToAdd.map(
          async (keyResult) =>
            await addKeyResult(orgId, projectId, okr.objective.id, keyResult),
        ),
      );
      setOKR({ ...okr });
    } catch (e) {
      toast.error('The key results could not be saved');
      console.error(e);
    }
  };

  const validationSchema = Yup.object({
    title: Yup.string()
      .required('The objective title is required'),
  });

  const krValidationSchema = Yup.object({
    title: Yup.string()
      .required('The key result title is required'),
  });

  const handleAddComment = async (content) => {
    try {
      const addedComment = await addObjectiveComment(orgId, projectId, okr.objective.id, content);
      okr.objective.comments.push(addedComment);
      setOKR({ ...okr });
      toast.success('The comment has been added');
    } catch (e) {
      toast.error('The comment could not be added');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteObjectiveComment(orgId, projectId, okr.objective.id, commentId);
      okr.objective.comments = okr.objective.comments.filter(comment => comment.id !== commentId);
      setOKR({ ...okr });
      toast.success('The comment has been deleted');
    } catch (e) {
      toast.error('The comment could not be deleted');
    }
  };

  const handleUpdateComment = async (commentId, content) => {
    try {
      const updatedComment = await updateObjectiveComment(orgId, projectId, okr.objective.id, commentId, content);
      okr.objective.comments = okr.objective.comments.map(comment => {
        if (comment.id === commentId) {
          return updatedComment;
        }
        return comment;
      });
      setOKR({ ...okr });
      toast.success('The comment has been updated');
    } catch (e) {
      toast.error('The comment could not be updated');
    }
  };

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader
        headerButtons={[
          {
            name: 'Back',
            shortcut: '←',
            action: () => {
              window.history.back();
            },
          },
        ]}
      />
      <Container className="mt--6" fluid id="OKRs">
        {okr && okr.keyResults && okr.keyResults.length > 0 && <DetailOKRStats okr={okr} />}
        <Row>
          <Col>
            {!isLoading && !okr && <NotFoundCard message="Objective not be found" />}

            <DeleteWarning
              isOpen={isDeleteWarningOpen}
              entity={'objective'}
              toggle={() => setIsDeleteWarningOpen(!isDeleteWarningOpen)}
              onDelete={() => handleDelete()}
            />
            <Card>
              <CardHeader>
                <h3 className="mb-0">
                  Edit Objective {okr && okr.objective.reference}
                </h3>
              </CardHeader>
              <CardBody className="border-bottom">
                {(isLoading || isSubmitting) && <LoadingSpinnerBox />}
                {!isLoading && !isSubmitting && okr &&
                  <>
                    <Formik
                      initialValues={{ title: okr.objective.title || '' }}
                      validationSchema={validationSchema}
                      onSubmit={handleSubmit}
                    >
                      {({ values, handleChange, isSubmitting, errors, touched }) => (
                        <Form
                          className="needs-validation"
                          noValidate>
                          <Row>
                            <Col s={12} md={12}>
                              <div className="form-group mb-3">
                                <label htmlFor="objective-status"
                                       className="form-control-label col-form-label">
                                  Title
                                </label>
                                <Field
                                  as={Input}
                                  id="objective-title"
                                  name="title"
                                  placeholder="What do you want to achieve?"
                                  type="text"
                                  value={values.title}
                                  onChange={handleChange}
                                  invalid={!!(errors.title && touched.title)}
                                  autoComplete="off"
                                />
                                <ErrorMessage name={'objective'} component={InputError} />
                              </div>
                            </Col>
                            <Col s={12} md={6}>
                              <div className="form-group mb-3">
                                <label htmlFor="objective-status"
                                       className="form-control-label col-form-label">
                                  Status
                                </label>
                                <Select2
                                  className="form-control"
                                  defaultValue={status}
                                  options={{
                                    placeholder: 'Status',
                                  }}
                                  data={statuses}
                                  onChange={(e) => {
                                    setStatus(e.target.value);
                                  }}
                                  onClick={() => {
                                    setIsDeleteWarningOpen(true);
                                  }} />
                              </div>
                            </Col>
                            <Col s={12} md={6}>
                              <div className="form-group mb-3">
                                <label htmlFor="objective-status"
                                       className="form-control-label col-form-label">
                                  Timeline
                                </label>
                                <Select2
                                  className="react-select-container"
                                  defaultValue={timeline}
                                  name="timeline"
                                  data={timelineOptions}
                                  onChange={(e) => {
                                    setTimeline(e.target.value);
                                  }}></Select2>
                              </div>
                            </Col>
                          </Row>
                          <Row className="mb-5">
                            <Col>
                              <label
                                className="form-control-label col-form-label"
                                htmlFor="validationCustom01"
                              >
                                Assigned to
                              </label>
                              <Select2
                                className="react-select-container"
                                defaultValue={assignedTo}
                                data={filteredMembers}
                                onChange={(e) => setAssignedTo(e.target.value)}
                              ></Select2>
                            </Col>
                          </Row>
                          <Row>
                            <Col>
                              <Button
                                id={'save-objective'}
                                color="primary"
                                type="submit"
                                className="mr-3 mb-3"
                                disabled={isSubmitting}
                              >
                                Save Objective
                              </Button>
                              <Button
                                id={'delete-objective'}
                                color="secondary"
                                type="button"
                                className="ml-0 mb-3"
                                onClick={() => {
                                  setIsDeleteWarningOpen(true);
                                }}
                                disabled={isSubmitting}
                              >
                                Delete Objective
                              </Button>
                            </Col>
                          </Row>
                        </Form>)}
                    </Formik>
                  </>}
              </CardBody>
            </Card>
            {!isLoading &&
              <Card>
                <CardHeader>
                  <h3 className="mb-0">
                    Related Key Results {okr?.keyResults.length === 0 && <AIButton
                    text="Add with AI"
                    disabled={!okr.objective.id}
                    onClick={async () => {
                      const keyResults = await generateKeyResults(okr.objective.title);
                      await handleAddKeyResultsWithAi(keyResults);
                    }}
                  />}
                  </h3>
                </CardHeader>
                <Row>
                  <Col>
                    <div className="table-responsive">
                      <Table className="table align-items-center no-select" style={{ minWidth: '700px' }}
                             onContextMenu={(e) => e.preventDefault()}>
                        <thead className="thead-light">
                        <tr>
                          <th className="sort" scope="col" width="5%">
                            Reference
                          </th>
                          <th className="sort" scope="col" width="50%">
                            Key Result
                          </th>
                          <th className="sort" scope="col" width="30%">
                            Progress
                          </th>
                          <th scope="col" width="5%">
                            Initiatives Count
                          </th>
                          <th className="sort" scope="col" width="10%">
                            Status
                          </th>
                        </tr>
                        </thead>
                        <tbody className="list">
                        {okr && okr.keyResults && okr.keyResults.length === 0 &&
                          <tr>
                            <td colSpan={5}>
                              <div className="text-center text-muted">
                                No key results have been added yet
                              </div>
                            </td>
                          </tr>}
                        {okr && okr.keyResults && okr.keyResults.map((keyResult) => (
                          <tr key={keyResult.id}>
                            <td>
                              <Link
                                to={`/admin/orgs/${orgId}/projects/${projectId}/okrs/${id}/kr/detail/${keyResult.id}`}
                                className={'okr-detail'}>
                                {keyResult.reference}
                              </Link>
                            </td>
                            <td className="title-cell">
                              <Link
                                to={`/admin/orgs/${orgId}/projects/${projectId}/okrs/${id}/kr/detail/${keyResult.id}`}
                                className={'okr-detail'}>
                                {keyResult.title}
                              </Link>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <span className="mr-2">{formatOKRsProgress(keyResult.progress)}%</span>
                                <div>
                                  <Progress max="100" value={formatOKRsProgress(keyResult.progress)}
                                            color="primary" />
                                </div>
                              </div>
                            </td>
                            <td>
                              {keyResult.features.length}
                            </td>
                            <td>
                              <Badge color="" className="badge-dot mr-4">
                                <i className={okrStatusColorClassName(keyResult.status)} />
                                <span className="status">{formatHyphenatedString(keyResult.status)}</span>
                              </Badge>
                            </td>
                          </tr>))}
                        <tr>
                          <td colSpan={5}>
                            {<Formik
                              initialValues={{ title: '' }}
                              validationSchema={krValidationSchema}
                              onSubmit={async (values, { resetForm }) => {
                                await handleAddKeyResult(values);
                                resetForm();
                              }}
                            >
                              {({ values, handleChange, errors, touched }) => (
                                <Form
                                  className="needs-validation"
                                  noValidate>
                                  <Row>
                                    <Col xs={10}>
                                      <Field
                                        as={Input}
                                        id="title"
                                        name="title"
                                        placeholder="How will you measure your progress?"
                                        type="text"
                                        value={values.title}
                                        onChange={handleChange}
                                        invalid={!!(errors.title && touched.title)}
                                        autoComplete="off"
                                      />
                                    </Col>
                                    <Col xs={2} className="text-right">
                                      <Button
                                        id={'save-key-result'}
                                        color="primary"
                                        type="submit"
                                        disabled={isSubmitting}
                                      >
                                        Add
                                      </Button>
                                    </Col>
                                  </Row>
                                </Form>)}
                            </Formik>}
                          </td>
                        </tr>
                        </tbody>
                      </Table>
                    </div>
                  </Col>
                </Row>
              </Card>}
          </Col>
        </Row>
        <Row>
          {!isLoading &&
            <Col>
              <Comments comments={okr?.objective?.comments}
                        onCommentAdd={handleAddComment}
                        onCommentDelete={handleDeleteComment}
                        onCommentEdit={handleUpdateComment}
              />
            </Col>
          }
        </Row>
      </Container>
    </>
  );
}

export default DetailOKR;
