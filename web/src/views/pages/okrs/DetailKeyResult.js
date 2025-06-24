import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Input,
  Row,
} from 'reactstrap';
import FloumySlider from '../../../components/Sliders/FloumySlider';
import Select2 from 'react-select2-wrapper';
import InitiativesList from '../initiatives/InitiativesList';
import React, { useEffect } from 'react';
import DeleteWarning from '../components/DeleteWarning';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import InputError from '../../../components/Errors/InputError';
import { addInitiative } from '../../../services/roadmap/roadmap.service';
import { sortByPriority } from '../../../services/utils/utils';
import {
  addKeyResultComment,
  deleteKeyResult,
  deleteKeyResultComment,
  getKeyResult,
  updateKeyResult,
  updateKeyResultComment,
} from '../../../services/okrs/okrs.service';
import { useNavigate, useParams } from 'react-router-dom';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import NotFoundCard from '../components/NotFoundCard';
import { toast } from 'react-toastify';
import Comments from '../../../components/Comments/Comments';
import AIButton from '../../../components/AI/AIButton';
import { generateInitiativesForOKR } from '../../../services/ai/ai.service';

function DetailKeyResult() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [status, setStatus] = React.useState('');
  const [isDeleteWarningOpen, setIsDeleteWarningOpen] = React.useState(false);
  const [progress, setProgress] = React.useState('');
  const { keyResultId, orgId, projectId } = useParams();
  const [keyResult, setKeyResult] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();

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

  useEffect(() => {
    document.title = 'Floumy | Key Result';

    async function loadData() {
      try {
        setIsLoading(true);
        const keyResult = await getKeyResult(orgId, projectId, keyResultId);
        setKeyResult(keyResult);
        setStatus(keyResult.status);
        setProgress(keyResult.progress);
      } catch (e) {
        toast.error('The key result could not be loaded');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [orgId, projectId, keyResultId]);

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      await updateKeyResult(orgId, projectId, keyResultId, {
        title: values.title,
        status,
        progress,
      });

      toast.success('The key result has been saved');
    } catch (e) {
      toast.error('The key result could not be saved');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await deleteKeyResult(orgId, projectId, keyResultId);
      navigate(-1);
      setTimeout(() => toast.success('The key result has been deleted'), 100);
    } catch (e) {
      toast.error('The key result could not be deleted');
    } finally {
      setIsSubmitting(false);
      setIsDeleteWarningOpen(false);
    }
  };

  async function handleAddInitiative(keyResultId, initiative) {
    initiative.keyResult = keyResultId;
    const savedInitiative = await addInitiative(orgId, projectId, initiative);
    keyResult.initiatives.push(savedInitiative);
    sortByPriority(keyResult.initiatives);
    setKeyResult({ ...keyResult });
  }

  async function handleDeleteInitiative(deletedInitiatives) {
    const deletedIds = deletedInitiatives.map((i) => i.id);
    setKeyResult({
      ...keyResult,
      initiatives: keyResult.initiatives.filter(
        (i) => !deletedIds.includes(i.id),
      ),
    });
  }

  const validationSchema = Yup.object({
    title: Yup.string().required('The key result title is required'),
  });

  function updateInitiativesKeyResult(updatedInitiatives, keyResultId) {
    if (keyResultId === null || keyResultId !== keyResult.id) {
      const newInitiatives = keyResult.initiatives.filter(
        (initiative) => !updatedInitiatives.some((f) => f.id === initiative.id),
      );
      setKeyResult({ ...keyResult, initiatives: newInitiatives });
    }
  }

  function updateInitiativesPriority(updatedInitiatives, priority) {
    const updatedInitiativesIds = updatedInitiatives.map(
      (initiative) => initiative.id,
    );
    const updatedInitiativesPriority = keyResult.initiatives.map(
      (initiative) => {
        if (updatedInitiativesIds.includes(initiative.id)) {
          initiative.priority = priority;
        }
        return initiative;
      },
    );
    setKeyResult({
      ...keyResult,
      initiatives: sortByPriority(updatedInitiativesPriority),
    });
  }

  function updateInitiativesStatus(updatedInitiatives, status) {
    const updatedInitiativesIds = updatedInitiatives.map(
      (initiative) => initiative.id,
    );
    const updatedInitiativesStatus = keyResult.initiatives.map((initiative) => {
      if (updatedInitiativesIds.includes(initiative.id)) {
        initiative.status = status;
      }
      return initiative;
    });
    setKeyResult({
      ...keyResult,
      initiatives: sortByPriority(updatedInitiativesStatus),
    });
  }

  async function handleCommentAdd(comment) {
    try {
      const addedComment = await addKeyResultComment(
        orgId,
        projectId,
        keyResultId,
        comment,
      );
      keyResult.comments.push(addedComment);
      setKeyResult({ ...keyResult });
      toast.success('Comment added successfully');
    } catch (e) {
      toast.error('Failed to add comment');
    }
  }

  async function handleCommentEditSubmit(commentId, comment) {
    try {
      await updateKeyResultComment(
        orgId,
        projectId,
        keyResultId,
        commentId,
        comment,
      );
      const updatedComment = keyResult.comments.find((c) => c.id === commentId);
      updatedComment.content = comment.content;
      updatedComment.mentions = comment.mentions;
      setKeyResult({ ...keyResult });
      toast.success('Comment updated successfully');
    } catch (e) {
      toast.error('Failed to update comment');
    }
  }

  async function handCommentDelete(commentId) {
    try {
      await deleteKeyResultComment(orgId, projectId, keyResultId, commentId);
      const index = keyResult.comments.findIndex((c) => c.id === commentId);
      keyResult.comments.splice(index, 1);
      setKeyResult({ ...keyResult });
      toast.success('Comment deleted successfully');
    } catch (e) {
      toast.error('Failed to delete comment');
    }
  }

  function isPlaceholderInitiativeOnly() {
    return (
      keyResult &&
      (!keyResult.initiatives ||
        keyResult.initiatives.length === 1 ||
        !keyResult.initiatives[0]?.title)
    );
  }

  const addInitiativesWithAi = async () => {
    try {
      const initiativesToAdd = (
        await generateInitiativesForOKR(keyResult.title, keyResult.title)
      ).map((initiative) => {
        return {
          title: initiative.title,
          description: initiative.description,
          priority: initiative.priority,
          status: 'planned',
          keyResult: keyResult.id,
        };
      });
      const savedInitiatives = [];
      for (const initiative of initiativesToAdd) {
        savedInitiatives.push(
          await addInitiative(orgId, projectId, initiative),
        );
      }
      setKeyResult({ ...keyResult, initiatives: savedInitiatives });
      toast.success('The initiatives have been added');
    } catch (e) {
      toast.error('The initiatives could not be saved');
      console.error(e);
    }
  };

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader breadcrumbs={keyResult?.breadcrumbs} />
      <Container className="mt--6" fluid id="OKRs">
        <Row>
          <Col lg={8} md={12}>
            {!isLoading && !keyResult && (
              <NotFoundCard message="Key result not be found" />
            )}
            <DeleteWarning
              isOpen={isDeleteWarningOpen}
              entity={'Key Result'}
              toggle={() => setIsDeleteWarningOpen(!isDeleteWarningOpen)}
              onDelete={handleDelete}
            />
            <Card>
              <CardHeader className="border-1">
                <div className="row">
                  <div className="col-12">
                    <h3 className="mb-0">
                      Edit Key Result {keyResult && keyResult.reference}
                    </h3>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {isLoading && <LoadingSpinnerBox />}
                {!isLoading && keyResult && (
                  <Formik
                    initialValues={{ title: keyResult.title || '' }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ values, handleChange, errors, touched }) => (
                      <Form className="needs-validation" noValidate>
                        <Row className="mb-3">
                          <Col>
                            <label className="form-control-label">Title</label>
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
                            <ErrorMessage
                              name={'objective'}
                              component={InputError}
                            />
                          </Col>
                        </Row>
                        <Row className="mb-3">
                          <Col xs={12} sm={6} className="mb-3">
                            <label className="form-control-label col-form-label">
                              Status
                            </label>
                            <Select2
                              id={'status-kr'}
                              className="form-control"
                              defaultValue={status}
                              options={{
                                placeholder: 'Status',
                              }}
                              data={statuses}
                              onChange={async (e) => {
                                await setStatus(e.target.value);
                              }}
                            />
                          </Col>
                          <Col xs={12} sm={6} className="mb-3">
                            <label className="form-control-label col-form-label">
                              Progress
                            </label>
                            <FloumySlider
                              initialValue={keyResult.progress * 100}
                              onSliderValueChange={(sliderValue) => {
                                setProgress(parseFloat(sliderValue) / 100);
                              }}
                            />
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
                              Save Key Result
                            </Button>
                            <Button
                              id={'delete-objective'}
                              color="secondary"
                              type="button"
                              className="ml-0 mb-3"
                              onClick={async () => {
                                setIsDeleteWarningOpen(true);
                              }}
                              disabled={isSubmitting}
                            >
                              Delete Key Result
                            </Button>
                          </Col>
                        </Row>
                      </Form>
                    )}
                  </Formik>
                )}
              </CardBody>
            </Card>
            {!isLoading && keyResult && keyResult.initiatives && (
              <>
                <Card>
                  <CardHeader className="border-1">
                    <div className="row">
                      <div className="col-12">
                        <h3 className="mb-0">
                          Related Initiatives
                          {isPlaceholderInitiativeOnly() && (
                            <AIButton
                              disabled={keyResult.title.length === 0}
                              onClick={addInitiativesWithAi}
                            />
                          )}
                        </h3>
                      </div>
                    </div>
                  </CardHeader>
                  <InitiativesList
                    initiatives={keyResult.initiatives}
                    onAddInitiative={async (initiative) => {
                      await handleAddInitiative(keyResult.id, initiative);
                    }}
                    onChangeStatus={updateInitiativesStatus}
                    onChangePriority={updateInitiativesPriority}
                    onChangeKeyResult={updateInitiativesKeyResult}
                    onDelete={handleDeleteInitiative}
                  />
                </Card>
              </>
            )}
          </Col>
          {!isLoading && (
            <Col lg={4} md={12}>
              <Comments
                comments={keyResult?.comments || []}
                onCommentAdd={handleCommentAdd}
                onCommentEdit={handleCommentEditSubmit}
                onCommentDelete={handCommentDelete}
              />
            </Col>
          )}
        </Row>
      </Container>
    </>
  );
}

export default DetailKeyResult;
