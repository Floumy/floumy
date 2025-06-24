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
import React, { useEffect } from 'react';
import DeleteWarning from '../components/DeleteWarning';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import InputError from '../../../components/Errors/InputError';
import {
  addKeyResultComment,
  deleteKeyResult,
  deleteKeyResultComment,
  getKeyResult,
  updateKeyResult,
  updateKeyResultComment,
} from '../../../services/okrs/org-okrs.service';
import { useNavigate, useParams } from 'react-router-dom';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import NotFoundCard from '../components/NotFoundCard';
import { toast } from 'react-toastify';
import Comments from '../../../components/Comments/Comments';

function DetailOrgKeyResult() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [status, setStatus] = React.useState('');
  const [isDeleteWarningOpen, setIsDeleteWarningOpen] = React.useState(false);
  const [progress, setProgress] = React.useState('');
  const { keyResultId, orgId } = useParams();
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
        const keyResult = await getKeyResult(orgId, keyResultId);
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
  }, [orgId, keyResultId]);

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      await updateKeyResult(orgId, keyResultId, {
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
      await deleteKeyResult(orgId, keyResultId);
      navigate(-1);
      setTimeout(() => toast.success('The key result has been deleted'), 100);
    } catch (e) {
      toast.error('The key result could not be deleted');
    } finally {
      setIsSubmitting(false);
      setIsDeleteWarningOpen(false);
    }
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('The key result title is required'),
  });

  async function handleCommentAdd(comment) {
    try {
      const addedComment = await addKeyResultComment(
        orgId,
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
      await updateKeyResultComment(orgId, keyResultId, commentId, comment);
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
      await deleteKeyResultComment(orgId, keyResultId, commentId);
      const index = keyResult.comments.findIndex((c) => c.id === commentId);
      keyResult.comments.splice(index, 1);
      setKeyResult({ ...keyResult });
      toast.success('Comment deleted successfully');
    } catch (e) {
      toast.error('Failed to delete comment');
    }
  }

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

export default DetailOrgKeyResult;
