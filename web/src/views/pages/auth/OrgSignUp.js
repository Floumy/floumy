import { useState } from 'react';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
// nodejs library that concatenates classes
import classnames from 'classnames';
// reactstrap components
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Row,
} from 'reactstrap';
// core components
import AuthHeader from '../../../components/Headers/AuthHeader.js';
import { orgSignUp } from '../../../services/auth/auth.service';
import { useNavigate } from 'react-router-dom';
import InputError from '../../../components/Errors/InputError';
import { getInputGroupErrorClass } from './form-input-utils';

function OrgSignUp() {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const invitationToken = params.get('invitationToken');

  const [focusedName, setFocusedName] = useState(false);
  const [focusedEmail, setFocusedEmail] = useState(false);
  const [focusedPassword, setFocusedPassword] = useState(false);
  const [focusedOrgName, setFocusedOrgName] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const validationSpec = {
    name: Yup.string()
      .min(2, 'The name must be at least 2 characters long')
      .required('The name is required'),
    email: Yup.string()
      .matches(
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        'The email address provided is invalid',
      )
      .required('The email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters long')
      .required('The password is required'),
    acceptedTerms: Yup.boolean()
      .required('Required')
      .oneOf([true], 'You must accept the terms and conditions.'),
  };

  if (!invitationToken) {
    validationSpec.orgName = Yup.string()
      .min(2, 'The organization name must be at least 2 characters long')
      .required('The organization name is required');
  }

  const validationSchema = Yup.object(validationSpec);

  const initialValues = {
    name: '',
    email: '',
    password: '',
    acceptedTerms: false,
    orgName: '',
  };
  return (
    <>
      <AuthHeader title="Join Floumy!" lead="Stop dreaming, start doing." />
      <Container className="mt--8 pb-5">
        <Row className="justify-content-center">
          <Col lg="6" md="8">
            <Card className="bg-secondary border-0">
              <CardHeader className="bg-transparent">
                <div className="text-center">
                  <h3>Sign up</h3>
                </div>
              </CardHeader>
              <CardBody className="px-lg-5 py-lg-5">
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={async (values, { setSubmitting }) => {
                    try {
                      setError(null);
                      setSubmitting(true);
                      await orgSignUp(
                        values.name,
                        values.email,
                        values.password,
                        values.orgName,
                        invitationToken,
                      );
                      setSubmitting(false);
                      navigate('/auth/activation-required');
                    } catch (e) {
                      setError(e.message);
                    }
                  }}
                >
                  {({ isSubmitting, errors, touched }) => (
                    <Form>
                      {error && (
                        <div className="text-center text-danger mb-3">
                          {error}
                        </div>
                      )}
                      {!invitationToken && (
                        <FormGroup
                          className={classnames({
                            focused: focusedOrgName,
                          })}
                        >
                          <InputGroup
                            className={getInputGroupErrorClass(
                              errors.orgName && touched.orgName,
                            )}
                          >
                            <InputGroupAddon addonType="prepend">
                              <InputGroupText>
                                <i className="ni ni-app" />
                              </InputGroupText>
                            </InputGroupAddon>
                            <Field
                              as={Input}
                              name="orgName"
                              placeholder="Your organization or company name"
                              type="text"
                              onFocus={() => setFocusedOrgName(true)}
                              onBlur={() => setFocusedOrgName(false)}
                              invalid={!!(errors.orgName && touched.orgName)}
                              className="px-3"
                              autoComplete="off"
                            />
                          </InputGroup>
                          <ErrorMessage name="orgName" component={InputError} />
                        </FormGroup>
                      )}
                      <FormGroup
                        className={classnames({
                          focused: focusedName,
                        })}
                      >
                        <InputGroup
                          className={getInputGroupErrorClass(
                            errors.name && touched.name,
                          )}
                        >
                          <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                              <i className="ni ni-hat-3" />
                            </InputGroupText>
                          </InputGroupAddon>
                          <Field
                            as={Input}
                            name="name"
                            placeholder="Your full name"
                            type="text"
                            onFocus={() => setFocusedName(true)}
                            onBlur={() => setFocusedName(false)}
                            invalid={!!(errors.name && touched.name)}
                            className="px-3"
                            autoComplete="off"
                          />
                        </InputGroup>
                        <ErrorMessage name="name" component={InputError} />
                      </FormGroup>
                      <FormGroup
                        className={classnames({
                          focused: focusedEmail,
                        })}
                      >
                        <InputGroup
                          className={getInputGroupErrorClass(
                            errors.email && touched.email,
                          )}
                        >
                          <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                              <i className="ni ni-email-83" />
                            </InputGroupText>
                          </InputGroupAddon>
                          <Field
                            as={Input}
                            name="email"
                            placeholder="Email"
                            type="email"
                            onFocus={() => setFocusedEmail(true)}
                            onBlur={() => setFocusedEmail(false)}
                            invalid={!!(errors.email && touched.email)}
                            className="px-3"
                          />
                        </InputGroup>
                        <ErrorMessage name="email" component={InputError} />
                      </FormGroup>
                      <FormGroup
                        className={classnames({
                          focused: focusedPassword,
                        })}
                      >
                        <InputGroup
                          className={getInputGroupErrorClass(
                            errors.password && touched.password,
                          )}
                        >
                          <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                              <i className="ni ni-lock-circle-open" />
                            </InputGroupText>
                          </InputGroupAddon>
                          <Field
                            as={Input}
                            name="password"
                            placeholder="Password (min. 8 characters)"
                            type="password"
                            onFocus={() => setFocusedPassword(true)}
                            onBlur={() => setFocusedPassword(false)}
                            invalid={!!(errors.password && touched.password)}
                            className="px-3"
                          />
                        </InputGroup>
                        <ErrorMessage name="password" component={InputError} />
                      </FormGroup>
                      <Row className="my-4">
                        <Col xs="12">
                          <div className="custom-control custom-control-alternative custom-checkbox">
                            <Field
                              as={Input}
                              name="acceptedTerms"
                              className="custom-control-input"
                              id="customCheckRegister"
                              type="checkbox"
                            />
                            <label
                              className="custom-control-label"
                              htmlFor="customCheckRegister"
                            >
                              <span className="text-muted">
                                I agree with the{' '}
                                <a
                                  href="https://app.termly.io/policy-viewer/policy.html?policyUUID=fb8deed6-e77a-43cd-aa76-1c655b357e4c"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Privacy Policy
                                </a>{' '}
                                and{' '}
                                <a
                                  href="https://app.termly.io/policy-viewer/policy.html?policyUUID=b76fc02b-bf3a-4da0-a77b-dcb50b8d37c2"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Terms of Service
                                </a>
                              </span>
                            </label>
                          </div>
                          <ErrorMessage
                            name="acceptedTerms"
                            component={InputError}
                          />
                        </Col>
                      </Row>
                      <div className="text-center">
                        <Button
                          id="create-account-submit"
                          className="mt-4"
                          color="info"
                          type="submit"
                          disabled={isSubmitting}
                        >
                          Create account
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
                <div className="text-center text-muted mt-4">
                  Or sign in <a href="/auth/sign-in">here</a>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default OrgSignUp;
