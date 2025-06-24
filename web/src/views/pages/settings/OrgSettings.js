import SimpleHeader from '../../../components/Headers/SimpleHeader';
import {
  Button,
  Card,
  CardHeader,
  Col,
  Container,
  FormGroup,
  Input,
  InputGroup,
  Row,
} from 'reactstrap';
import React, { useEffect, useState } from 'react';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import classnames from 'classnames';
import InputError from '../../../components/Errors/InputError';
import { toast } from 'react-toastify';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import { getOrg, patchCurrentOrg } from '../../../services/org/orgs.service';
import { useParams } from 'react-router-dom';

function OrgSettings() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedOrgName, setFocusedOrgName] = useState(false);
  const [loadingOrg, setIsLoadingOrg] = useState(false);
  const [org, setOrg] = useState();

  const { orgId } = useParams();

  useEffect(() => {
    async function fetchOrg() {
      try {
        setIsLoadingOrg(true);
        const currentOrg = await getOrg();
        setOrg(currentOrg);
      } catch (e) {
        toast.error('Unable to load organization details');
      } finally {
        setIsLoadingOrg(false);
      }
    }

    fetchOrg();
  }, [orgId]);

  const validationSchema = Yup.object().shape({
    orgName: Yup.string()
      .trim()
      .required('Org name is required')
      .min(3, 'Org name must be at least 3 characters')
      .max(50, 'Org name cannot be longer than 50 characters')
      .matches(
        /^[a-zA-Z0-9_\- ]+$/,
        'Org name can only contain letters, numbers, underscores, hyphens and spaces',
      ),
  });

  async function handleSubmit(values, setErrors) {
    try {
      setIsSubmitting(true);
      await patchCurrentOrg({
        name: values.orgName,
      });
      toast.success('Org name saved');
    } catch (e) {
      toast.error('Failed to save org name');
      setErrors({
        orgName:
          'Please verify that the org name: is unique within your organization, is between 3-50 characters long, contains only letters, numbers, underscores, hyphens and spaces, and is not empty.',
      });
    }
  }

  return (
    <>
      <SimpleHeader />
      <Container className="mt--6 pb-4" fluid>
        <Card className="shadow">
          <CardHeader>
            <h3 className="mb-0">Org</h3>
          </CardHeader>
          {loadingOrg && <LoadingSpinnerBox />}
          {!loadingOrg && org && (
            <Row className="p-4">
              <Col>
                <Formik
                  initialValues={{ orgName: org.name }}
                  validationSchema={validationSchema}
                  onSubmit={async (values, { setErrors }) => {
                    try {
                      setIsSubmitting(true);
                      await handleSubmit(values, setErrors);
                    } catch (e) {
                      setErrors({ orgName: e.message });
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                >
                  {({ values, errors, touched }) => (
                    <Form className="needs-validation" noValidate>
                      <h4>Org Name</h4>
                      <FormGroup
                        className={classnames({
                          focused: focusedOrgName,
                        })}
                      >
                        <InputGroup className="input-group input-group-merge">
                          <Field
                            as={Input}
                            name="orgName"
                            placeholder="The name of your org"
                            type="text"
                            onFocus={() => setFocusedOrgName(true)}
                            onBlur={() => setFocusedOrgName(false)}
                            value={values.orgName}
                            invalid={!!(errors.orgName && touched.orgName)}
                            className="px-3"
                            autoComplete="off"
                          />
                        </InputGroup>
                        <ErrorMessage name="orgName" component={InputError} />
                      </FormGroup>
                      <div>
                        <Button
                          color="primary"
                          type="submit"
                          disabled={isSubmitting}
                        >
                          Save
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </Col>
            </Row>
          )}
        </Card>
      </Container>
    </>
  );
}

export default OrgSettings;
