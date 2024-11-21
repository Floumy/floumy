
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
import { resetPassword } from "../../../services/auth/auth.service";
import { getInputGroupErrorClass } from "./form-input-utils";

function ResetPassword() {
  const [focusedPassword, setFocusedPassword] = React.useState(false);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const resetToken = params.get("token");

  const validationSchema = Yup.object({
    password: Yup.string()
      .required("The password is required")
  });

  return (
    <>
      <AuthHeader title="Reset Your Password, Reset Your Journey"
                  lead="Time for a fresh start! Enter your new password below. Make it strong, make it memorable, and most importantly, make it yours. Ready to unlock your next adventure?" />
      <Container className="mt--8 pb-5">
        <Row className="justify-content-center">
          <Col lg="6" md="8">
            <Card className="bg-secondary border-0">
              <CardHeader className="bg-transparent">
                <div className="text-center">
                  <h3>Reset your password</h3>
                </div>
              </CardHeader>
              <CardBody className="px-lg-5 py-lg-5">
                <Formik
                  initialValues={{ password: "" }}
                  validationSchema={validationSchema}
                  onSubmit={async (values, { setSubmitting }) => {
                    try {
                      setError(null);
                      setSubmitting(true);

                      await resetPassword(values.password, resetToken);

                      setSubmitting(false);

                      navigate("/auth/password-reset");
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
                          Secure My Account
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

export default ResetPassword;
