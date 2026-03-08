import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { useNavigate, useSearchParams } from 'react-router-dom';
import InputError from '../../../components/Errors/InputError';
import { setCurrentUser } from '../../../services/users/users.service';
import { signIn, signInWithGoogle } from '../../../services/auth/auth.service';
import { getInputGroupErrorClass } from './form-input-utils';
import { getOrg } from '../../../services/org/orgs.service';
import { logoutUser } from '../../../services/api/api.service';

const GOOGLE_SCRIPT_ID = 'google-identity-services';

function SignIn() {
  const [focusedEmail, setFocusedEmail] = useState(false);
  const [focusedPassword, setFocusedPassword] = useState(false);
  const [error, setError] = useState(null);
  const googleButtonRef = useRef(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  let redirectTo;
  let invitationToken;
  if (searchParams.has('redirectTo')) {
    redirectTo = decodeURI(searchParams.get('redirectTo'));
  }
  if (searchParams.has('invitationToken')) {
    invitationToken = decodeURI(searchParams.get('invitationToken'));
  }

  const validationSchema = Yup.object({
    email: Yup.string()
      .matches(
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        'The email address provided is invalid',
      )
      .required('The email is required'),
    password: Yup.string().required('The password is required'),
  });

  useEffect(() => {
    const redirectIfLoggedIn = async () => {
      // If the user is already logged in, redirect to the dashboard

      if (!localStorage.getItem('currentUserId')) {
        return;
      }

      const currentOrgId = localStorage.getItem('currentUserOrgId');

      const currentOrg = await getOrg();

      const lastVisitedProjectId = localStorage.getItem('lastVisitedProjectId');
      if (
        lastVisitedProjectId &&
        currentOrg.projects.some(
          (project) => project.id === lastVisitedProjectId,
        )
      ) {
        return navigate(
          `/admin/orgs/${currentOrgId}/projects/${lastVisitedProjectId}/active-cycle`,
        );
      }

      return navigate(`/orgs/${currentOrgId}/projects/`);
    };

    redirectIfLoggedIn();
  });

  const handleSuccessfulSignIn = useCallback(async () => {
    await setCurrentUser();

    const currentOrg = await getOrg();

    if (currentOrg.id) {
      if (redirectTo) {
        return navigate(redirectTo);
      }

      const lastVisitedProjectId = localStorage.getItem('lastVisitedProjectId');
      if (
        lastVisitedProjectId &&
        currentOrg.projects.some(
          (project) => project.id === lastVisitedProjectId,
        )
      ) {
        return navigate(
          `/admin/orgs/${currentOrg.id}/projects/${lastVisitedProjectId}/active-cycle`,
        );
      }

      return navigate(`/orgs/${currentOrg.id}/objectives/`);
    }

    // TODO: Remove this when we have a proper way to handle it
    await logoutUser();
    throw new Error('You are not a member of any organization.');
  }, [navigate, redirectTo]);

  const handleGoogleLogin = useCallback(
    async (response) => {
      try {
        setError(null);
        const credential = response?.credential;
        if (!credential) {
          throw new Error('Google sign in failed.');
        }

        await signInWithGoogle(credential, invitationToken);
        await handleSuccessfulSignIn();
      } catch (e) {
        setError(
          e?.message || 'Google sign in failed. Please try another method.',
        );
      }
    },
    [handleSuccessfulSignIn, invitationToken],
  );

  useEffect(() => {
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!googleClientId || !googleButtonRef.current) {
      return;
    }

    let didUnmount = false;
    let existingScript;

    const initializeGoogleButton = () => {
      if (
        didUnmount ||
        !window.google?.accounts?.id ||
        !googleButtonRef.current
      )
        return;

      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleLogin,
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
      });
    };

    if (window.google?.accounts?.id) {
      initializeGoogleButton();
      return () => {
        didUnmount = true;
      };
    }

    existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
    if (!existingScript) {
      existingScript = document.createElement('script');
      existingScript.id = GOOGLE_SCRIPT_ID;
      existingScript.src = 'https://accounts.google.com/gsi/client';
      existingScript.async = true;
      existingScript.defer = true;
      document.body.appendChild(existingScript);
    }

    existingScript.addEventListener('load', initializeGoogleButton);

    return () => {
      didUnmount = true;
      existingScript?.removeEventListener('load', initializeGoogleButton);
    };
  }, [handleGoogleLogin]);

  const onLogin = async (values, { setSubmitting }) => {
    try {
      setError(null);
      setSubmitting(true);

      await signIn(values.email, values.password);
      await handleSuccessfulSignIn();
    } catch (e) {
      setError(e?.message || 'The email or password is incorrect.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AuthHeader
        title="Welcome Back to Floumy!"
        lead="Stop wasting time. Let’s turn your ideas into wins. Get to it!"
      />
      <Container className="mt--8 pb-5">
        <Row className="justify-content-center">
          <Col lg="6" md="8">
            <Card className="bg-secondary border-0">
              <CardHeader className="bg-transparent">
                <div className="text-center">
                  <h3>Sign in</h3>
                </div>
              </CardHeader>
              <CardBody className="px-lg-5 py-lg-5">
                <Formik
                  initialValues={{ email: '', password: '' }}
                  validationSchema={validationSchema}
                  onSubmit={onLogin}
                >
                  {({ isSubmitting, errors, touched }) => (
                    <Form>
                      {error && (
                        <div className="text-center text-danger mb-3">
                          {error}
                        </div>
                      )}
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
                            placeholder="Password"
                            type="password"
                            onFocus={() => setFocusedPassword(true)}
                            onBlur={() => setFocusedPassword(false)}
                            invalid={!!(errors.password && touched.password)}
                            className="px-3"
                          />
                        </InputGroup>
                        <ErrorMessage name="password" component={InputError} />
                      </FormGroup>
                      <div className="text-center">
                        <Button
                          id="login-submit"
                          className="mt-4"
                          color="info"
                          type="submit"
                          disabled={isSubmitting}
                        >
                          Sign in
                        </Button>
                      </div>
                      <div
                        className="d-flex justify-content-center mt-3"
                        ref={googleButtonRef}
                      />
                    </Form>
                  )}
                </Formik>
                <div className="text-center text-muted mt-4">
                  Or sign up <a href="/auth/sign-up">here</a>
                </div>
                <div className="text-center text-muted mt-4">
                  <small>
                    Forgot your password?
                    <a href="/auth/forgot-password"> Reset it here</a>
                  </small>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default SignIn;
