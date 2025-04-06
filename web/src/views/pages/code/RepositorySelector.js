import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Container, Row } from 'reactstrap';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../../contexts/ProjectsContext';
import { getGithubUrl } from '../../../services/github/github.service';
import { toast } from 'react-toastify';

function RepositorySelector() {

  const { orgId, currentProject } = useProjects();

  const navigate = useNavigate();

  async function handleGitHub() {
    try {
      window.location.href = await getGithubUrl(orgId, currentProject.id);
    } catch (error) {
      toast.error('Failed to connect to Github');
    }
  }

  async function handleGitLab() {
    navigate(`/admin/orgs/${orgId}/projects/${currentProject.id}/code/gitlab`);
  }

  return (
    <>
      <SimpleHeader />
      <Container className="mt--6" fluid id="OKRs">
        <Row>
          <Col>
            <Card className="mb-5">
              <CardHeader>
                <Row>
                  <Col md={12}>
                    <CardTitle tag="h2" className="mb-3"> Code
                    </CardTitle>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="text-center my-2 py-2">
                  <h2 className="mb-4 h2">Choose your repository platform</h2>
                  <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-4">
                    <Button
                      onClick={handleGitHub}
                      color="light"
                      className="p-4 d-flex flex-column align-items-center m-0 mb-4 mr-md-4"
                      style={{
                        minWidth: '300px',
                        border: '2px solid #dee2e6',
                        borderRadius: '12px',
                        transition: 'all 0.2s',
                        backgroundColor: '#f8f9fa',
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="48" height="48" style={{ color: '#333', margin: '4px' }}>
                        <path fill="currentColor"
                              d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      <div style={{ fontSize: '1.25rem', fontWeight: '600' }} className="text-body">GitHub</div>
                    </Button>

                    <Button
                      onClick={handleGitLab}
                      color="light"
                      className="p-4 d-flex flex-column align-items-center m-0 mb-4"
                      style={{
                        minWidth: '300px',
                        border: '2px solid #dee2e6',
                        borderRadius: '12px',
                        transition: 'all 0.2s',
                        backgroundColor: '#f8f9fa',
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="48" height="48"
                           style={{ color: '#fc6d26', margin: '4px'}}>
                        <path fill="currentColor"
                              d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 00-.867 0L16.418 9.45H7.582L4.919 1.263a.455.455 0 00-.867 0L1.386 9.45.044 13.587a.924.924 0 00.331 1.03L12 23.054l11.625-8.436a.92.92 0 00.33-1.031" />
                      </svg>
                      <div style={{ fontSize: '1.25rem', fontWeight: '600' }} className="text-body">GitLab</div>
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default RepositorySelector;