import {
  Badge,
  Card,
  CardBody,
  CardText,
  Col,
  Container,
  Row,
} from 'reactstrap';
import SimpleHeader from '../../../../components/Headers/SimpleHeader';
import React, { useEffect, useState } from 'react';
import NewProjectModal from '../../../../components/Sidebar/NewProjectModal';
import { Link, useParams } from 'react-router-dom';
import { listProjects } from '../../../../services/projects/projects.service';
import { toast } from 'react-toastify';
import InfiniteLoadingBar from '../../components/InfiniteLoadingBar';
import LoadingSpinnerBox from '../../components/LoadingSpinnerBox';
import moment from 'moment';

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

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
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
        ]}
      />
      <Container fluid>
        {isLoading && <LoadingSpinnerBox />}
        {!isLoading && (
          <Row className="mt--6">
            {projects.length > 0 ? (
              projects.map((project) => (
                <Col key={project.id} xs={12} md={6} lg={4} className="mb-4">
                  <Card className="h-100 d-flex flex-column">
                    <CardBody className="d-flex flex-column">
                      {/* Header Section */}
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-2 text-xl text-truncate">
                          <Link
                            to={`/admin/orgs/${orgId}/projects/${project.id}/dashboard`}
                          >
                            {project.name}
                          </Link>
                        </h5>
                        <div className="repository-badges">
                          {project.githubRepositoryUrl && (
                            <Link
                              to={project.githubRepositoryUrl}
                              target="_blank"
                            >
                              <Badge className="mr-2" pill>
                                <i className="fa fa-code mr-1" />
                                GitHub
                              </Badge>
                            </Link>
                          )}
                          {project.gitlabProjectUrl && (
                            <Link to={project.gitlabProjectUrl} target="_blank">
                              <Badge pill>
                                <i className="fa fa-code mr-1" />
                                GitLab
                              </Badge>
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Description Section */}
                      <CardText
                        className="text-muted mb-3"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxHeight: '3em',
                          minHeight: '3em',
                          lineHeight: '1.5em',
                        }}
                      >
                        {project.description}
                      </CardText>

                      {/* Footer Section */}
                      <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
                        <small className="text-muted">
                          <i className="fa fa-clock mr-1" />
                          Created {moment(project.createdAt).fromNow()}
                        </small>
                        <div className="d-flex gap-2">
                          {project?.isBuildInPublicEnabled && (
                            <Link
                              to={`/public/orgs/${orgId}/projects/${project.id}/active-sprint`}
                              target="_blank"
                            >
                              <Badge color="success" className="mr-2" pill>
                                <i className="fa fa-eye mr-1" />
                                Public
                              </Badge>
                            </Link>
                          )}
                        </div>
                      </div>
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
                    <p
                      className="empty-state-description text-muted mx-auto"
                      style={{ maxWidth: '500px' }}
                    >
                      Get started by creating your first project. Projects help
                      you organize and track your work effectively.
                    </p>
                    <button
                      className="btn btn-primary mt-3"
                      onClick={() => setIsNewProjectModalOpen(true)}
                    >
                      Create a new Project
                    </button>
                  </div>
                </Card>
              </Col>
            )}
          </Row>
        )}
      </Container>
      <NewProjectModal
        toggleModal={() => setIsNewProjectModalOpen(!isNewProjectModalOpen)}
        isOpen={isNewProjectModalOpen}
      />
    </>
  );
};

export default Projects;
