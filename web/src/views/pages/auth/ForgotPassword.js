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
import React from "react";
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
import { useNavigate } from "react-router-dom";
import InputError from "../../../components/Errors/InputError";
import { sendResetPasswordLink } from "../../../services/auth/auth.service";
import { getInputGroupErrorClass } from "./form-input-utils";

function ForgotPassword() {
  const [focusedEmail, setFocusedEmail] = React.useState(false);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    email: Yup.string()
      .matches(
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        "The email address provided is invalid")
      .required("The email field is required")
  });

  return (
    <>
      <AuthHeader title="Lost Your Password?"
                  lead="No Big Deal. It happens. Drop your email below, and we’ll shoot you a reset link. Let’s get you back in the game!" />
      <Container className="mt--8 pb-5">
        <Row className="justify-content-center">
          <Col lg="6" md="8">
            <Card className="bg-secondary border-0">
              <CardHeader className="bg-transparent">
                <div className="text-center">
                  <h3>Reset password</h3>
                </div>
              </CardHeader>
              <CardBody className="px-lg-5 py-lg-5">
                <Formik
                  initialValues={{ email: "" }}
                  validationSchema={validationSchema}
                  onSubmit={async (values, { setSubmitting }) => {
                    try {
                      setError(null);
                      setSubmitting(true);

                      await sendResetPasswordLink(values.email);

                      setSubmitting(false);

                      navigate("/auth/reset-email-sent");
                    } catch (e) {
                      setError(e.message);
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
                      <div className="text-center">
                        <Button id="login-submit" className="mt-4" color="info" type="submit"
                                disabled={isSubmitting}>
                          Reset and Roll!
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

export default ForgotPassword;
