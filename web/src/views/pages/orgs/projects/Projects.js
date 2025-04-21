import { Card, CardBody, CardText, Col, Container, Row } from 'reactstrap';
import SimpleHeader from '../../../../components/Headers/SimpleHeader';
import { useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import NewProjectModal from '../../../../components/Sidebar/NewProjectModal';
import { useParams } from 'react-router-dom';
import { listProjects } from '../../../../services/projects/projects.service';
import { toast } from 'react-toastify';

const Projects = () => {
  const { orgId } = useParams();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);

        const orgProjects = await listProjects(orgId);
        setProjects(orgProjects);

      } catch (e) {
        toast.error(`Couldn't retrieve the list of projects`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [orgId]);

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  useHotkeys('n', () => setIsNewProjectModalOpen(true));

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
              setIsNewProjectModalOpen(true);
            },
          },
        ]} />
      <Container fluid>
        <Row className="mt--6">
          {projects.length > 0 ? (
            projects.map((project) => (
              <Col key={project.id} xs={12} md={6} lg={4} className="mb-4">
                <Card className="h-100">
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">{project.name}</h5>
                    </div>
                    <CardText>{project.description}</CardText>
                  </CardBody>
                </Card>
              </Col>
            ))
          ) : (
            <Col xs={12}>
              <Card className="text-center py-5">
                <div className="empty-state">
                  <div className="empty-state-icon mb-4">
                    <i className="fa fa-folder-open fa-3x text-muted"></i>
                  </div>
                  <h3 className="empty-state-title">No Projects Yet</h3>
                  <p className="empty-state-description text-muted mx-auto" style={{ maxWidth: '500px' }}>
                    Get started by creating your first project. Projects help you organize and track your work
                    effectively.
                  </p>
                  <button
                    className="btn btn-primary mt-3"
                    onClick={() => setIsNewProjectModalOpen(true)}
                  >
                    <i className="fa fa-plus mr-2"></i>
                    Create New Project
                  </button>
                  <div className="mt-3">
                    <small className="text-muted">
                      Pro tip: Press 'N' to quickly create a new project
                    </small>
                  </div>
                </div>
              </Card>
            </Col>
          )}
        </Row>
      </Container>
      <NewProjectModal toggleModal={() => setIsNewProjectModalOpen(!isNewProjectModalOpen)}
                       isOpen={isNewProjectModalOpen} />
    </>
  );

};

export default Projects;