import { Button, FormGroup, Input, InputGroup, Modal } from 'reactstrap';
import React, { useState } from 'react';
import { createProject } from '../../services/projects/projects.service';
import { useNavigate } from 'react-router-dom';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import classnames from 'classnames';
import InputError from '../Errors/InputError';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useOrg } from '../../contexts/OrgContext';

export default function NewProjectModal({ isOpen, toggleModal }) {
  const { orgId, currentOrg } = useOrg();
  const navigate = useNavigate();
  const [focusedProjectName, setFocusedProjectName] = useState(false);
  const [focusedProjectDescription, setFocusedProjectDescription] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(values) {
    const projectName = values.projectName;
    const projectDescription = values.projectDescription;

    try {
      setIsSubmitting(true);
      const createdProject = await createProject(orgId, projectName, projectDescription);
      toast.success('Project created');
      toggleModal();
      navigate(`/admin/orgs/${orgId}/projects/${createdProject.id}/dashboard`);
    } catch (e) {
      toast.error('Failed to create project');
    }
  }

  const validationSchema = Yup.object().shape({
    projectName: Yup.string().trim()
      .required('Project name is required')
      .min(3, 'Project name must be at least 3 characters')
      .max(50, 'Project name cannot be longer than 50 characters')
      .matches(
        /^[a-zA-Z0-9_\- ]+$/,
        'Project name can only contain letters, numbers, underscores, hyphens and spaces'
      )
      .test(
        'unique',
        'Project name already exists',
        function(value) {
          return !currentOrg?.projects?.some(project => project.name === value);
        }
      ),
  });

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggleModal}
      className="modal-dialog-centered"
      fade={false}
    >
      <div className="modal-header">
        <h5 className="modal-title">Create New Project</h5>
        <button
          aria-label="Close"
          className="close"
          onClick={toggleModal}
          type="button"
        >
          <span aria-hidden={true}>×</span>
        </button>
      </div>
      <div className="modal-body">
        <Formik
          initialValues={{ projectName: '', projectDescription: '' }}
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
          {({ values, errors, touched }) => (
            <Form
              className="needs-validation"
              noValidate>
              <h4>Project Name</h4>
              <FormGroup
                className={classnames({
                  focused: focusedProjectName,
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
                </InputGroup>
                <ErrorMessage name="projectName" component={InputError} />
              </FormGroup>
              <FormGroup
                className={classnames({
                  focused: focusedProjectDescription,
                })}
              >
                <InputGroup className="input-group input-group-merge">
                  <Field
                    as={Input}
                    name="projectDescription"
                    placeholder="Describe your project's goals, scope, and key features (e.g., 'A web application for automated task management with team collaboration features')"
                    type="textarea"
                    onFocus={() => setFocusedProjectDescription(true)}
                    onBlur={() => setFocusedProjectDescription(false)}
                    value={values.projectDescription}
                    rows={6}
                    invalid={!!(errors.projectDescription && touched.projectDescription)}
                    className="px-3"
                    autoComplete="off"
                  />
                </InputGroup>
                <ErrorMessage name="projectDescription" component={InputError} />
              </FormGroup>
              <div>
                <Button color="primary" type="submit"
                        disabled={isSubmitting}>
                  Create Project
                </Button>
                <Button color="secondary" type="button"
                        onClick={toggleModal}>
                  Close
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
}