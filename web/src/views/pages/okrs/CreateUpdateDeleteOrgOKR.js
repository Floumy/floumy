import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Input,
  Row,
} from 'reactstrap';
import { ErrorMessage, Field, FieldArray, Form, Formik } from 'formik';
import InputError from '../../../components/Errors/InputError';
import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import Select2 from 'react-select2-wrapper';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import DeleteWarning from '../components/DeleteWarning';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { generateKeyResults } from '../../../services/ai/ai.service';
import AIButton from '../../../components/AI/AIButton';
import { deleteOKR } from '../../../services/okrs/org-okrs.service';
import { getOrg } from '../../../services/org/orgs.service';

function CreateUpdateDeleteOrgOKR({ onSubmit, okr }) {
  const { orgId, projectId } = useParams();
  const [fields, setFields] = useState([{}]);
  const [timeline, setTimeline] = useState('this-quarter');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteWarningOpen, setIsDeleteWarningOpen] = useState(false);
  const navigate = useNavigate();
  const [members, setMembers] = useState([{ id: '', text: 'None' }]);
  const [assignedTo, setAssignedTo] = useState('');

  const onDeleteOKR = async (id) => {
    setIsLoading(true);
    try {
      await deleteOKR(orgId, projectId, id);
      navigate(-1);
      setTimeout(() => toast.success('The OKR has been deleted'), 100);
    } catch (e) {
      setIsDeleteWarningOpen(false);
      toast.error('The OKR could not be deleted');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsLoading(true);
    try {
      setSubmitting(true);
      // Remove empty key results
      const keyResults = fields.filter((field) => field.title);
      const savedOKR = await onSubmit({
        ...values,
        timeline,
        assignedTo,
        keyResults: keyResults,
      });
      navigate(`/orgs/${orgId}/okrs/detail/${savedOKR.objective.id}`, {
        replace: true,
      });
      setTimeout(() => toast.success('The OKR has been saved'), 100);
    } catch (e) {
      toast.error('The OKR could not be saved');
    } finally {
      setSubmitting(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!okr) return;

    document.title = 'Floumy | OKR';

    if (okr.objective.timeline) {
      setTimeline(okr.objective.timeline);
    }

    if (okr.keyResults.length > 0) {
      const keyResults = okr.keyResults
        .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
        .map((keyResult) => {
          return {
            id: keyResult.id,
            title: keyResult.title,
          };
        });
      setFields([...keyResults, {}]);
    }
  }, [okr]);

  const validationSchema = Yup.object({
    objective: Yup.string().required('The objective is required'),
  });

  const handleFieldChange = (e, keyResultId, index) => {
    const newFields = [...fields];
    newFields[index] = {
      id: keyResultId,
      title: e.target.value,
    };

    // Add a new field if typing in the last field
    if (e.target.value !== '' && index === fields.length - 1) {
      newFields.push({});
    }

    setFields(newFields);
  };

  const handleTimelineChange = (e) => {
    setTimeline(e.target.value);
  };

  const handleFieldKeyDown = (e, index) => {
    if (
      e.key === 'Backspace' &&
      fields[index].title === '' &&
      fields.length > 1
    ) {
      // This is important to prevent React to propagate the event further and call handleFieldChange
      e.preventDefault();
      setFields(fields.filter((_, idx) => idx !== index));
    }
  };

  useEffect(() => {
    async function fetchAndSetMembers() {
      const org = await getOrg();
      const mappedUsers = org.members
        .filter(
          (user) => user.isActive || user.id === okr?.objective?.assignedTo,
        )
        .map((user) => {
          return { id: user.id, text: user.name };
        });
      mappedUsers.push({ id: '', text: 'None' });
      setMembers(mappedUsers);
    }

    async function fetchData() {
      setIsLoading(true);
      try {
        await Promise.all([fetchAndSetMembers()]);
      } catch (e) {
        toast.error('The members could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [okr?.objective?.assignedTo]);

  async function fillKeyResultsWithAi(objective) {
    try {
      const keyResults = (await generateKeyResults(objective)).map((kr) => ({
        id: kr.title,
        title: kr.title,
      }));
      setFields([...keyResults, ...fields]);
    } catch (e) {
      toast.error('The key results could not be filled with AI');
    }
  }

  function isPlaceholderKeyResultOnly() {
    return fields && fields?.length === 1 && !fields[0]?.title;
  }

  return (
    <>
      <DeleteWarning
        isOpen={isDeleteWarningOpen}
        entity={'objective'}
        toggle={() => setIsDeleteWarningOpen(!isDeleteWarningOpen)}
        onDelete={() => onDeleteOKR(okr.objective.id)}
      />
      {isLoading && <InfiniteLoadingBar />}
      <Card>
        <CardHeader>
          <h3 className="mb-0">{okr ? 'Edit Objective' : 'New Objective'}</h3>
        </CardHeader>
        <CardBody>
          <Formik
            initialValues={{
              objective: okr?.objective.title || '',
              keyResults: fields,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, handleChange, isSubmitting, errors, touched }) => (
              <Form className="needs-validation" noValidate>
                <Row>
                  <Col className="mb-3" md={12} lg={12}>
                    <label
                      className="form-control-label"
                      htmlFor="validationCustom01"
                    >
                      Objective
                    </label>
                    <Field
                      as={Input}
                      id="objective"
                      name="objective"
                      placeholder="What do you want to achieve?"
                      type="text"
                      value={values.objective}
                      onChange={handleChange}
                      invalid={!!(errors.objective && touched.objective)}
                      autoComplete="off"
                    />
                    <ErrorMessage name={'objective'} component={InputError} />
                  </Col>
                  <Col className="mb-3" md={12} lg={6}>
                    <label
                      className="form-control-label"
                      htmlFor="validationCustom01"
                    >
                      Timeline
                    </label>
                    <Select2
                      className="react-select-container"
                      defaultValue={timeline}
                      name="timeline"
                      data={[
                        { id: 'this-quarter', text: 'This Quarter' },
                        { id: 'next-quarter', text: 'Next Quarter' },
                        { id: 'later', text: 'Later' },
                      ]}
                      onChange={handleTimelineChange}
                    ></Select2>
                  </Col>
                  <Col className="mb-3" md={12} lg={6}>
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
                <div className="form-row">
                  <Col className="mb-3" md={12} lg={12}>
                    <label
                      className="form-control-label"
                      htmlFor="validationCustom01"
                    >
                      Key Results
                      {isPlaceholderKeyResultOnly() && (
                        <AIButton
                          disabled={values.objective.length === 0}
                          onClick={async () =>
                            await fillKeyResultsWithAi(values.objective)
                          }
                        />
                      )}
                    </label>
                    <FieldArray name="keyResults">
                      <div>
                        {fields &&
                          fields.length > 0 &&
                          fields.map((field, index) => (
                            <Field
                              id={`key-result-${index}`}
                              key={field.id}
                              as={Input}
                              className="floumy-form-input key-result mb-3"
                              name={`keyResults.${index}`}
                              placeholder="How will you measure your progress?"
                              type="text"
                              value={field.title || ''}
                              onChange={(e) => {
                                handleChange(e);
                                handleFieldChange(e, field.id, index);
                              }}
                              onKeyDown={(e) => handleFieldKeyDown(e, index)}
                              autoComplete={'off'}
                              invalid={
                                !!(errors.keyResults && touched.keyResults)
                              }
                            />
                          ))}
                      </div>
                    </FieldArray>
                  </Col>
                </div>
                <div>
                  <Button
                    id={'save-objective'}
                    color="primary"
                    type="submit"
                    className="mr-3 mb-3"
                    disabled={isSubmitting}
                  >
                    Save Objective
                  </Button>
                  {okr && (
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
                  )}
                </div>
              </Form>
            )}
          </Formik>
        </CardBody>
      </Card>
    </>
  );
}

export default CreateUpdateDeleteOrgOKR;
