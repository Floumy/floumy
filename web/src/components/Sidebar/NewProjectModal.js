import { Button, FormGroup, Input, InputGroup, Modal } from 'reactstrap';
import React, { useState } from 'react';
import { useProjects } from '../../contexts/ProjectsContext';
import { createProject } from '../../services/projects/projects.service';
import { useNavigate } from 'react-router-dom';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import classnames from 'classnames';
import InputError from '../Errors/InputError';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

export default function NewProjectModal({ isOpen, toggleModal }) {
  const { orgId, currenProject, setCurrentProject, projects } = useProjects();
  const navigate = useNavigate();
  const [focusedProjectName, setFocusedProjectName] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(values) {
    const projectName = values.projectName;
    try {
      setIsSubmitting(true);
      const createdProject = await createProject(orgId, projectName);
      setCurrentProject(createdProject);
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
          return !projects.some(project => project.name === value);
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
          initialValues={{ projectName: currenProject?.name }}
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