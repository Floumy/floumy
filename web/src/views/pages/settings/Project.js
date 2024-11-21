import SimpleHeader from "../../../components/Headers/SimpleHeader";
import { Button, Card, CardHeader, Col, Container, FormGroup, Input, InputGroup, Row } from "reactstrap";
import React, { useEffect, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import classnames from "classnames";
import InputError from "../../../components/Errors/InputError";
import { getOrg, patchCurrentOrg, setCurrentOrg } from "../../../services/org/orgs.service";
import { toast } from "react-toastify";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";

function Project() {
  const [projectName, setProjectName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedProjectName, setFocusedProjectName] = useState(false);
  const [isLoadingProjectName, setIsLoadingProjectName] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoadingProjectName(true);
      try {
        const org = await getOrg();
        setProjectName(org.name);
      } catch (e) {
        toast.error("Failed to fetch project name");
      } finally {
        setIsLoadingProjectName(false);
      }
    }

    fetchData();
  }, []);

  const validationSchema = Yup.object().shape({
    projectName: Yup.string().trim()
      .required("Project name is required")
      .min(2, "Project name must be at least 3 characters")
  });

  async function handleSubmit(values) {
    setProjectName(values.projectName);
    await patchCurrentOrg({ name: values.projectName });
    await setCurrentOrg();
    toast.success("Project name saved");

    // TODO: This is a hack to refresh the local storage data. We should find a better way to do this.
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  return (
    <>
      <SimpleHeader />
      <Container className="mt--6 pb-4" fluid>
        <Card className="shadow">
          <CardHeader>
            <h3 className="mb-0">Project</h3>
          </CardHeader>
          {isLoadingProjectName && <LoadingSpinnerBox />}
          {!isLoadingProjectName && <Row className="p-4">
            <Col>
              <Formik
                initialValues={{ projectName: projectName }}
                validationSchema={validationSchema}
                onSubmit={async (values, { setErrors }) => {
                  try {
                    setIsSubmitting(true);
                    await handleSubmit(values);
                  } catch (e) {
                    setErrors({ projectName: e.message });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                {({ values, handleChange, errors, touched }) => (
                  <Form
                    className="needs-validation"
                    noValidate>
                    <h4>Project Name</h4>
                    <FormGroup
                      className={classnames({
                        focused: focusedProjectName
                      })}
                    >
                      <InputGroup className="input-group input-group-merge">
                        <Field
                          as={Input}
                          name="projectName"
                          placeholder="The name of your project"
                          type="text"
                          onFocus={() => setFocusedProjectName(true)}
                          onBlur={() => setFocusedProjectName(false)}
                          value={values.projectName}
                          invalid={!!(errors.projectName && touched.projectName)}
                          className="px-3"
                          autoComplete="off"
                        />
                        <ErrorMessage name="projectName" component={InputError} />
                      </InputGroup>
                    </FormGroup>
                    <div>
                      <Button color="primary" type="submit"
                              disabled={isSubmitting}>
                        Save Settings
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Col>
          </Row>}
        </Card>
      </Container>
    </>
  );
}

export default Project;
