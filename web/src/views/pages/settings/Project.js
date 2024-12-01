import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Button, Card, CardHeader, Col, Container, FormGroup, Input, InputGroup, Row } from 'reactstrap';
import React, { useState } from 'react';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import classnames from 'classnames';
import InputError from '../../../components/Errors/InputError';
import { toast } from 'react-toastify';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import { useProjects } from '../../../contexts/ProjectsContext';
import { deleteProject, updateProject } from '../../../services/projects/projects.service';
import DeleteWarning from '../components/DeleteWarning';
import { useNavigate } from 'react-router-dom';

function Project() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedProjectName, setFocusedProjectName] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState(false);
  const { currentProject: project, setCurrentProject, projects, setProjects, loading: loadingProject, orgId } = useProjects();

  const navigate = useNavigate();

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

  async function handleSubmit(values, setErrors) {
    const projectName = values.projectName;
    try {
      setIsSubmitting(true);
      const updatedProject = await updateProject(orgId, project.id, projectName);
      setProjects(projects.map(p => {
        if (p.id === updatedProject.id) {
          return updatedProject;
        }
        return p;
      }));
      setCurrentProject(updatedProject);
      toast.success('Project name saved');
    } catch (e) {
      toast.error('Failed to save project name');
      setErrors({ projectName: 'Please verify that the project name: is unique within your organization, is between 3-50 characters long, contains only letters, numbers, underscores, hyphens and spaces, and is not empty.' });
    }
  }

  async function handleDeleteProject() {
    try {
      setIsSubmitting(true);
      await deleteProject(orgId, project.id);
      setCurrentProject(null);
      const projectsWithoutCurrentProject = projects.filter(p => p.id !== project.id);
      setProjects(projectsWithoutCurrentProject);
      // Redirect to the first project in the list
      const firstProject = projectsWithoutCurrentProject[0];
      setCurrentProject(firstProject);
      toast.success('Project deleted');
      navigate(`/admin/orgs/${orgId}/projects/${firstProject.id}/dashboard`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsSubmitting(false);
      setDeleteWarning(false);
    }
  }

  return (
    <>
      <DeleteWarning
        isOpen={deleteWarning}
        toggle={() => setDeleteWarning(!deleteWarning)}
        entity={"project"}
        onDelete={handleDeleteProject} />
      <SimpleHeader />
      <Container className="mt--6 pb-4" fluid>
        <Card className="shadow">
          <CardHeader>
            <h3 className="mb-0">Project</h3>
          </CardHeader>
          {loadingProject && <LoadingSpinnerBox />}
          {!loadingProject && project && <Row className="p-4">
            <Col>
              <Formik
                initialValues={{ projectName: project.name }}
                validationSchema={validationSchema}
                onSubmit={async (values, { setErrors }) => {
                  try {
                    setIsSubmitting(true);
                    await handleSubmit(values, setErrors);
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
                        Save
                      </Button>
                      {projects && projects.length > 1 &&
                      <Button color="danger" type="button"
                              onClick={() => setDeleteWarning(true)}>
                        Delete Project
                      </Button>}
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
