import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Row } from 'reactstrap';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import InputError from '../../../components/Errors/InputError';

export default function CreateIssue({ onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { orgId, projectId } = useParams();
  const navigate = useNavigate();


  const getDetailUrl = (issueId) => {
    const currentContextUrlSlug = window.location.pathname.split('/')[1];
    if (currentContextUrlSlug === 'public') {
      return `/public/orgs/${orgId}/projects/${projectId}/issues/${issueId}`;
    }

    return `/admin/orgs/${orgId}/projects/${projectId}/issues/edit/${issueId}`;
  };

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true);
      const savedIssue = await onSubmit(values);
      setTimeout(() => toast.success('The issue has been saved'), 100);

      navigate(getDetailUrl(savedIssue.id), {replace: true});
    } catch (e) {
      toast.error('The issue could not be saved');
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Floumy | New Issue';
  }, []);

  const currentUserId = localStorage.getItem('currentUserId');

  if (!currentUserId) {
    window.location.href = `/auth/sign-in?redirectTo=${encodeURI(window.location.pathname)}`;
    return null;
  }

  const validationSchema = Yup.object({
    title: Yup.string().required('The title is required'),
    description: Yup.string().required('The description is required'),
  });

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <Card>
        <CardHeader>
          <h3 className="mb-0">New Issue</h3>
        </CardHeader>
        <CardBody>
          <Formik
            initialValues={{ title: '', description: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, handleChange, errors, touched }) => (
              <Form className="needs-validation" noValidate>
                <Row>
                  <Col>
                    <FormGroup>
                      <label className="form-control-label">Title</label>
                      <Field
                        as={Input}
                        id="title"
                        name="title"
                        placeholder="What issue did you find?"
                        type="text"
                        value={values.title}
                        onChange={handleChange}
                        invalid={!!(errors.title && touched.title)}
                        autoComplete="off"
                      />
                      <ErrorMessage name={'title'} component={InputError} />
                    </FormGroup>
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
                        placeholder="Describe the issue and its impact ..."
                        type="textarea"
                        rows={5}
                        value={values.description}
                        onChange={handleChange}
                        invalid={!!(errors.description && touched.description)}
                        autoComplete="off"
                      />
                      <ErrorMessage name={'description'} component={InputError} />
                    </FormGroup>
                  </Col>
                </Row>
                <Button
                  id={'save-issue'}
                  color="primary"
                  type="submit"
                  className="mt-3"
                  disabled={isSubmitting}
                >
                  Save Issue
                </Button>
              </Form>
            )}
          </Formik>
        </CardBody>
      </Card>
    </>
  );
}