import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Row } from "reactstrap";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import InputError from "../../../components/Errors/InputError";

export default function CreateFeatureRequest({ onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true);
      await onSubmit(values);
      navigate(-1);
      setTimeout(() => toast.success("The feature request has been saved"), 100);
    } catch (e) {
      toast.error("The feature request could not be saved");
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Floumy | Feature Request";
  }, []);

  const validationSchema = Yup.object({
    title: Yup.string()
      .required("The title is required"),
    description: Yup.string()
      .required("The description is required")
  });

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <Card>
        <CardHeader>
          <h3 className="mb-0">New Feature Request</h3>
        </CardHeader>
        <CardBody>
          <Formik
            initialValues={{ title: "", description: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, handleChange, errors, touched }) => (
              <Form
                className="needs-validation"
                noValidate>
                <Row>
                  <Col>
                    <FormGroup>
                      <label
                        className="form-control-label"
                      >
                        Title
                      </label>
                      <Field
                        as={Input}
                        id="title"
                        name="title"
                        placeholder="What feature do you want to request?"
                        type="text"
                        value={values.title}
                        onChange={handleChange}
                        invalid={!!(errors.title && touched.title)}
                        autoComplete="off"
                      />
                      <ErrorMessage name={"title"} component={InputError} />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <FormGroup>
                      <label
                        className="form-control-label"
                      >
                        Description
                      </label>
                      <Field
                        as={Input}
                        id="description"
                        name="description"
                        placeholder="Describe your feature request and its impact ..."
                        type="textarea"
                        rows={5}
                        value={values.description}
                        onChange={handleChange}
                        invalid={!!(errors.description && touched.description)}
                        autoComplete="off"
                      />
                      <ErrorMessage name={"description"} component={InputError} />
                    </FormGroup>
                  </Col>
                </Row>
                <Button
                  id={"save-feature-request"}
                  color="primary"
                  type="submit"
                  className="mt-3"
                  disabled={isSubmitting}
                >
                  Save Request
                </Button>
              </Form>
            )}
          </Formik>
        </CardBody>
      </Card>
    </>
  );
}