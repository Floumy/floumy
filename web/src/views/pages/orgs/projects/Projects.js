import {
  Button,
  Card,
  CardBody,
  CardText,
  Col,
  Container,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';
import SimpleHeader from '../../../../components/Headers/SimpleHeader';
import { Form } from 'formik';
import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

const Projects = () => {
  const [projects, setProjects] = useState([
    {
      id: '1',
      title: 'Project Alpha',
      description: 'A cutting-edge application with modern architecture',
      status: 'active',
      tags: ['React', 'JavaScript'],
    },
  ]);

  const [modal, setModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    status: 'planning',
    tags: '',
  });

  // Add hotkey for new project
  useHotkeys('n', () => setModal(true));

  const toggleModal = () => {
    setModal(!modal);
    if (!modal) {
      setNewProject({
        title: '',
        description: '',
        status: 'planning',
        tags: '',
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const projectToAdd = {
      id: Date.now().toString(),
      ...newProject,
      tags: newProject.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
    };

    setProjects(prev => [...prev, projectToAdd]);
    toggleModal();
  };

  return (
    <>
      <SimpleHeader
        title={'Projects'}
        headerButtons={[
          {
            name: 'New Project',
            shortcut: 'n',
            id: 'new-project',
            action: () => {
            },
          },
        ]} />
      <Container fluid>
        <Row className="mt--6">
          {projects.map((project) => (
            <Col key={project.id} xs={12} md={6} lg={4} className="mb-4">
              <Card className="shadow-sm h-100">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">{project.title}</h5>
                  </div>
                  <CardText>{project.description}</CardText>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
      <Modal isOpen={modal} toggle={toggleModal}>
        <Form onSubmit={handleSubmit}>
          <ModalHeader toggle={toggleModal}>Create New Project</ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label for="title">Project Title</Label>
              <Input
                id="title"
                name="title"
                value={newProject.title}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="description">Description</Label>
              <Input
                id="description"
                name="description"
                type="textarea"
                value={newProject.description}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="status">Status</Label>
              <Input
                id="status"
                name="status"
                type="select"
                value={newProject.status}
                onChange={handleInputChange}
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
                <option value="completed">Completed</option>
              </Input>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={toggleModal}>Cancel</Button>
            <Button color="primary" type="submit">Create Project</Button>
          </ModalFooter>
        </Form>
      </Modal>
    </>
  );

};

export default Projects;