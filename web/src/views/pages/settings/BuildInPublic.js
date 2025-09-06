import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Container,
  Row,
} from 'reactstrap';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  getBuildInPublicSettings,
  updateBuildInPublicSettings,
} from '../../../services/bip/build-in-public.service';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import { Link, useParams } from 'react-router-dom';
import { useBuildInPublic } from '../../../contexts/BuidInPublicContext';

function BuildInPublic() {
  const { orgId, projectId } = useParams();
  const [isLoadingBuildInPublicSettings, setIsLoadingBuildInPublicSettings] =
    useState(false);
  const [isBuildInPublicEnabled, setIsBuildInPublicEnabled] = useState(false);

  const [publicLink, setPublicLink] = useState('');
  const {
    settings: buildInPublicSettings,
    setSettings: setBuildInPublicSettings,
  } = useBuildInPublic();

  function createUrl(path) {
    const protocol = window.location.protocol;
    const host = window.location.host;
    return `${protocol}//${host}${path}`;
  }

  useEffect(() => {
    async function fetchData() {
      setIsLoadingBuildInPublicSettings(true);
      try {
        const buildInPublicSettings = await getBuildInPublicSettings(
          orgId,
          projectId,
        );
        setBuildInPublicSettings({
          isObjectivesPagePublic: buildInPublicSettings.isObjectivesPagePublic,
          isRoadmapPagePublic: buildInPublicSettings.isRoadmapPagePublic,
          isSprintsPagePublic: buildInPublicSettings.isSprintsPagePublic,
          isActiveSprintsPagePublic:
            buildInPublicSettings.isActiveSprintsPagePublic,
          isIssuesPagePublic: buildInPublicSettings.isIssuesPagePublic,
          isFeatureRequestsPagePublic:
            buildInPublicSettings.isFeatureRequestsPagePublic,
          isBuildInPublicEnabled: buildInPublicSettings.isBuildInPublicEnabled,
        });
        setIsBuildInPublicEnabled(buildInPublicSettings.isBuildInPublicEnabled);
      } catch (error) {
        toast.error('Failed to fetch build in public settings');
      } finally {
        setIsLoadingBuildInPublicSettings(false);
      }
    }

    fetchData();
  }, []);

  function isBuildInPublicEnabledBasedOnSettings(settings) {
    return (
      settings.isObjectivesPagePublic ||
      settings.isRoadmapPagePublic ||
      settings.isActiveSprintsPagePublic ||
      settings.isSprintsPagePublic ||
      settings.isIssuesPagePublic ||
      settings.isFeatureRequestsPagePublic
    );
  }

  function togglePublicPage(page) {
    return async (e) => {
      try {
        const newSettings = {
          ...buildInPublicSettings,
          [page]: e.target.checked,
        };
        setBuildInPublicSettings({
          ...newSettings,
          isBuildInPublicEnabled:
            isBuildInPublicEnabledBasedOnSettings(newSettings),
        });
        await updateBuildInPublicSettings(orgId, projectId, {
          ...newSettings,
          isBuildInPublicEnabled:
            isBuildInPublicEnabledBasedOnSettings(newSettings),
        });
      } catch (error) {
        toast.error('Failed to update settings');
      }
    };
  }

  useEffect(() => {
    setIsBuildInPublicEnabled(
      isBuildInPublicEnabledBasedOnSettings(buildInPublicSettings),
    );

    if (buildInPublicSettings.isObjectivesPagePublic) {
      setPublicLink(
        createUrl(`/public/orgs/${orgId}/projects/${projectId}/okrs`),
      );
    } else if (buildInPublicSettings.isRoadmapPagePublic) {
      setPublicLink(
        createUrl(`/public/orgs/${orgId}/projects/${projectId}/roadmap`),
      );
    } else if (buildInPublicSettings.isSprintsPagePublic) {
      setPublicLink(
        createUrl(`/public/orgs/${orgId}/projects/${projectId}/sprints`),
      );
    } else if (buildInPublicSettings.isActiveSprintsPagePublic) {
      setPublicLink(
        createUrl(`/public/orgs/${orgId}/projects/${projectId}/active-sprint`),
      );
    } else if (buildInPublicSettings.isIssuesPagePublic) {
      setPublicLink(
        createUrl(`/public/orgs/${orgId}/projects/${projectId}/issues`),
      );
    } else if (buildInPublicSettings.isFeatureRequestsPagePublic) {
      setPublicLink(
        createUrl(
          `/public/orgs/${orgId}/projects/${projectId}/feature-requests`,
        ),
      );
    }
  }, [buildInPublicSettings, orgId]);

  async function toggleBuildInPublic() {
    try {
      const settings = {
        isObjectivesPagePublic: !isBuildInPublicEnabled,
        isRoadmapPagePublic: !isBuildInPublicEnabled,
        isSprintsPagePublic: !isBuildInPublicEnabled,
        isActiveSprintsPagePublic: !isBuildInPublicEnabled,
        isIssuesPagePublic: !isBuildInPublicEnabled,
        isFeatureRequestsPagePublic: !isBuildInPublicEnabled,
      };
      await updateBuildInPublicSettings(orgId, projectId, {
        ...settings,
        isBuildInPublicEnabled: !isBuildInPublicEnabled,
      });
      setIsBuildInPublicEnabled(!isBuildInPublicEnabled);
      setBuildInPublicSettings({
        ...settings,
        isBuildInPublicEnabled: !isBuildInPublicEnabled,
      });
      toast.success('Settings updated successfully');
    } catch (e) {
      toast.error('Failed to update settings');
    }
  }

  return (
    <>
      {isLoadingBuildInPublicSettings && <InfiniteLoadingBar />}
      <SimpleHeader />
      <Container className="mt--6" fluid id="OKRs">
        <Row>
          <Col>
            <Card className="mb-5">
              <CardHeader>
                <Row className="align-items-center">
                  <Col xs={12} md={8}>
                    <CardTitle tag="h2" className="mb-2">
                      Build In Public
                    </CardTitle>
                  </Col>
                  <Col xs={12} md={4} className="mt-3 mt-md-0">
                    {!isLoadingBuildInPublicSettings &&
                      isBuildInPublicEnabled && (
                        <div className="text-xs-left text-sm-right">
                          <Link
                            className="btn btn-icon btn-primary"
                            color="primary"
                            id="tooltipCopyLink"
                            type="button"
                            to={publicLink}
                            target="_blank"
                          >
                            Open the public project page{' '}
                            <i className="fas fa-external-link ml-2" />
                          </Link>
                        </div>
                      )}
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                {isLoadingBuildInPublicSettings && (
                  <Row>
                    <Col className="text-center">
                      <LoadingSpinnerBox />
                    </Col>
                  </Row>
                )}
                {!isLoadingBuildInPublicSettings && (
                  <>
                    <div className="bg-white border rounded p-3 mb-4 d-flex align-items-start">
                      <div
                        className="border rounded-circle d-flex align-items-center justify-content-center mr-3"
                        style={{ width: 36, height: 36 }}
                      >
                        <i className="fas fa-info text-primary" />
                      </div>
                      <div className="flex-fill">
                        <div className="font-weight-bold mb-1">
                          What is Build in Public?
                        </div>
                        <div className="text-muted small">
                          Build in Public lets you share a read-only view of
                          selected project areas with anyone via a public link.
                          It’s great for transparency and community updates.
                        </div>
                      </div>
                    </div>
                    <Row className="mb-3">
                      <Col xs={6} sm={3} md={2}>
                        <h3>Public Pages</h3>
                      </Col>
                      <Col xs={6} sm={9} md={10}>
                        <label className="custom-toggle mr-1">
                          <input
                            checked={isBuildInPublicEnabled}
                            onChange={toggleBuildInPublic}
                            type="checkbox"
                          />
                          <span
                            className="custom-toggle-slider"
                            data-label-off="No"
                            data-label-on="Yes"
                          />
                        </label>
                      </Col>
                    </Row>
                    <hr className="my-4" />
                    <Row className="mb-3">
                      <Col xs={6} sm={3} md={2}>
                        Issues
                      </Col>
                      <Col xs={6} sm={9} md={10}>
                        <label className="custom-toggle">
                          <input
                            checked={buildInPublicSettings.isIssuesPagePublic}
                            onChange={togglePublicPage('isIssuesPagePublic')}
                            type="checkbox"
                          />
                          <span
                            className="custom-toggle-slider"
                            data-label-off="No"
                            data-label-on="Yes"
                          />
                        </label>
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col xs={6} sm={3} md={2}>
                        Feature Requests
                      </Col>
                      <Col xs={6} sm={9} md={10}>
                        <label className="custom-toggle">
                          <input
                            checked={
                              buildInPublicSettings.isFeatureRequestsPagePublic
                            }
                            onChange={togglePublicPage(
                              'isFeatureRequestsPagePublic',
                            )}
                            type="checkbox"
                          />
                          <span
                            className="custom-toggle-slider"
                            data-label-off="No"
                            data-label-on="Yes"
                          />
                        </label>
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col xs={6} sm={3} md={2}>
                        OKRs
                      </Col>
                      <Col xs={6} sm={9} md={10}>
                        <label className="custom-toggle mr-1">
                          <input
                            checked={
                              buildInPublicSettings.isObjectivesPagePublic
                            }
                            onChange={togglePublicPage(
                              'isObjectivesPagePublic',
                            )}
                            type="checkbox"
                          />
                          <span
                            className="custom-toggle-slider"
                            data-label-off="No"
                            data-label-on="Yes"
                          />
                        </label>
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col xs={6} sm={3} md={2}>
                        Roadmap
                      </Col>
                      <Col xs={6} sm={9} md={10}>
                        <label className="custom-toggle  mr-1">
                          <input
                            checked={buildInPublicSettings.isRoadmapPagePublic}
                            onChange={togglePublicPage('isRoadmapPagePublic')}
                            type="checkbox"
                          />
                          <span
                            className="custom-toggle-slider"
                            data-label-off="No"
                            data-label-on="Yes"
                          />
                        </label>
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col xs={6} sm={3} md={2}>
                        Active Sprint
                      </Col>
                      <Col xs={6} sm={9} md={10}>
                        <label className="custom-toggle">
                          <input
                            checked={
                              buildInPublicSettings.isActiveSprintsPagePublic
                            }
                            onChange={togglePublicPage(
                              'isActiveSprintsPagePublic',
                            )}
                            type="checkbox"
                          />
                          <span
                            className="custom-toggle-slider"
                            data-label-off="No"
                            data-label-on="Yes"
                          />
                        </label>
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col xs={6} sm={3} md={2}>
                        Sprints
                      </Col>
                      <Col xs={6} sm={9} md={10}>
                        <label className="custom-toggle mr-1">
                          <input
                            checked={buildInPublicSettings.isSprintsPagePublic}
                            onChange={togglePublicPage('isSprintsPagePublic')}
                            type="checkbox"
                          />
                          <span
                            className="custom-toggle-slider"
                            data-label-off="No"
                            data-label-on="Yes"
                          />
                        </label>
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col xs={6} sm={3} md={2}>
                        Issues
                      </Col>
                      <Col xs={6} sm={9} md={10}>
                        <label className="custom-toggle mr-1">
                          <input
                            checked={buildInPublicSettings.isIssuesPagePublic}
                            onChange={togglePublicPage('isIssuesPagePublic')}
                            type="checkbox"
                          />
                          <span
                            className="custom-toggle-slider"
                            data-label-off="No"
                            data-label-on="Yes"
                          />
                        </label>
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col xs={6} sm={3} md={2}>
                        Feature Requests
                      </Col>
                      <Col xs={6} sm={9} md={10}>
                        <label className="custom-toggle mr-1">
                          <input
                            checked={
                              buildInPublicSettings.isFeatureRequestsPagePublic
                            }
                            onChange={togglePublicPage(
                              'isFeatureRequestsPagePublic',
                            )}
                            type="checkbox"
                          />
                          <span
                            className="custom-toggle-slider"
                            data-label-off="No"
                            data-label-on="Yes"
                          />
                        </label>
                      </Col>
                    </Row>
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default BuildInPublic;
