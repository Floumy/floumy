/*!

=========================================================
* Argon Dashboard PRO React - v1.2.4
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-pro-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { useEffect, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
// nodejs library that concatenates classes
import classnames from "classnames";
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
  Row
} from "reactstrap";
// core components
import AuthHeader from "../../../components/Headers/AuthHeader.js";
import { useNavigate, useSearchParams } from "react-router-dom";
import InputError from "../../../components/Errors/InputError";
import { setCurrentUser } from "../../../services/users/users.service";
import { signIn } from "../../../services/auth/auth.service";
import { getInputGroupErrorClass } from "./form-input-utils";
import { setCurrentOrg } from "../../../services/org/orgs.service";
import { logoutUser } from "../../../services/api/api.service";

function SignIn() {
  const [focusedEmail, setFocusedEmail] = useState(false);
  const [focusedPassword, setFocusedPassword] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  let redirectTo = "/admin/dashboard";
  if (searchParams.has("redirectTo")) {
    redirectTo = decodeURI(searchParams.get("redirectTo"));
  }

  const validationSchema = Yup.object({
    email: Yup.string()
      .matches(
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        "The email address provided is invalid")
      .required("The email is required"),
    password: Yup.string()
      .required("The password is required")
  });

  useEffect(() => {
    // If the user is already logged in, redirect to the dashboard
    if (localStorage.getItem("currentUser") && localStorage.getItem("currentUserOrgId")) {
      navigate("/admin/dashboard");
    }
  });

  return (
    <>
      <AuthHeader title="Welcome Back to Floumy!"
                  lead="Stop wasting time. Let’s turn your ideas into wins. Get to it!" />
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
                  initialValues={{ email: "", password: "" }}
                  validationSchema={validationSchema}
                  onSubmit={async (values, { setSubmitting }) => {
                    try {
                      setError(null);
                      setSubmitting(true);

                      await signIn(values.email, values.password);
                      await setCurrentUser();
                      const orgId = localStorage.getItem("currentUserOrgId");

                      if (orgId) {
                        await setCurrentOrg();

                        setSubmitting(false);

                        navigate(redirectTo);
                        return;
                      }

                      // TODO: Remove this when we have a proper way to handle it
                      logoutUser();
                      setError("You are not a member of any organization.");
                    } catch (e) {
                      setError(e.message);
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {({ isSubmitting, errors, touched }) => (
                    <Form>
                      {error && <div className="text-center text-danger mb-3">{error}</div>}
                      <FormGroup
                        className={classnames({
                          focused: focusedEmail
                        })}
                      >
                        <InputGroup className={getInputGroupErrorClass(errors.email && touched.email)}>
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
                          focused: focusedPassword
                        })}
                      >
                        <InputGroup className={getInputGroupErrorClass(errors.password && touched.password)}>
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
                        <Button id="login-submit" className="mt-4" color="info" type="submit"
                                disabled={isSubmitting}>
                          Sign in
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
                <div className="text-center text-muted mt-4">
                  Or sign up <a href="/auth/sign-up">here</a>
                </div>
                <div className="text-center text-muted mt-4">
                  <small>Forgot your password?<a href="/auth/forgot-password"> Reset it here</a></small>

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
