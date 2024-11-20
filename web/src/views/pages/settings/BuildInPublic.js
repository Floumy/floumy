import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import SimpleHeader from "../../../components/Headers/SimpleHeader";
import { Card, CardBody, CardHeader, CardTitle, Col, Container, Row } from "reactstrap";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getBuildInPublicSettings, updateBuildInPublicSettings } from "../../../services/bip/build-in-public.service";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";
import { Link, useParams } from "react-router-dom";
import { clearCache } from "../../../services/cache/cache.service";
import { useBuildInPublic } from "../../../contexts/BuidInPublicContext";

function BuildInPublic() {
  const { orgId, productId } = useParams();
  const [isLoadingBuildInPublicSettings, setIsLoadingBuildInPublicSettings] = useState(false);
  const [isBuildInPublicEnabled, setIsBuildInPublicEnabled] = useState(false);

  const [publicLink, setPublicLink] = useState("");
  const { settings: buildInPublicSettings, setSettings: setBuildInPublicSettings } = useBuildInPublic();

  function createUrl(path) {
    const protocol = window.location.protocol;
    const host = window.location.host;
    return `${protocol}//${host}${path}`;
  }

  const paymentPlan = localStorage.getItem("paymentPlan");

  useEffect(() => {
    async function fetchData() {
      setIsLoadingBuildInPublicSettings(true);
      try {
        const buildInPublicSettings = await getBuildInPublicSettings(orgId, productId);
        setBuildInPublicSettings({
          isObjectivesPagePublic: buildInPublicSettings.isObjectivesPagePublic,
          isRoadmapPagePublic: buildInPublicSettings.isRoadmapPagePublic,
          isIterationsPagePublic: buildInPublicSettings.isIterationsPagePublic,
          isActiveIterationsPagePublic: buildInPublicSettings.isActiveIterationsPagePublic,
          isFeedPagePublic: buildInPublicSettings.isFeedPagePublic,
          isIssuesPagePublic: buildInPublicSettings.isIssuesPagePublic,
          isFeatureRequestsPagePublic: buildInPublicSettings.isFeatureRequestsPagePublic,
          isBuildInPublicEnabled: buildInPublicSettings.isBuildInPublicEnabled
        });
        setIsBuildInPublicEnabled(buildInPublicSettings.isBuildInPublicEnabled);
      } catch (error) {
        toast.error("Failed to fetch build in public settings");
      } finally {
        setIsLoadingBuildInPublicSettings(false);
      }
    }

    fetchData();
  }, []);

  function isBuildInPublicEnabledBasedOnSettings(settings) {
    return Object.values(settings).some((value) => value === true);
  }

  function togglePublicPage(page) {
    return async (e) => {
      try {
        const newSettings = {
          ...buildInPublicSettings,
          [page]: e.target.checked
        };
        setBuildInPublicSettings({
          ...newSettings,
          isBuildInPublicEnabled: isBuildInPublicEnabledBasedOnSettings(newSettings)
        });
        await updateBuildInPublicSettings(orgId, productId, {
          ...newSettings,
          isBuildInPublicEnabled: isBuildInPublicEnabledBasedOnSettings(newSettings)
        });
        clearCache(`${orgId}-settings`);
      } catch (error) {
        toast.error("Failed to update settings");
      }
    };
  }

  useEffect(() => {
    setIsBuildInPublicEnabled(isBuildInPublicEnabledBasedOnSettings(buildInPublicSettings));

    if (buildInPublicSettings.isFeedPagePublic) {
      setPublicLink(createUrl(`/public/orgs/${orgId}/projects/${productId}/feed`));
    } else if (buildInPublicSettings.isObjectivesPagePublic) {
      setPublicLink(createUrl(`/public/orgs/${orgId}/projects/${productId}/okrs`));
    } else if (buildInPublicSettings.isRoadmapPagePublic) {
      setPublicLink(createUrl(`/public/orgs/${orgId}/projects/${productId}/roadmap`));
    } else if (buildInPublicSettings.isIterationsPagePublic) {
      setPublicLink(createUrl(`/public/orgs/${orgId}/projects/${productId}/iterations`));
    } else if (buildInPublicSettings.isActiveIterationsPagePublic) {
      setPublicLink(createUrl(`/public/orgs/${orgId}/projects/${productId}/active-iteration`));
    } else if (buildInPublicSettings.isIssuesPagePublic) {
      setPublicLink(createUrl(`/public/orgs/${orgId}/projects/${productId}/issues`));
    } else if (buildInPublicSettings.isFeatureRequestsPagePublic) {
      setPublicLink(createUrl(`/public/orgs/${orgId}/projects/${productId}/feature-requests`));
    }
  }, [buildInPublicSettings, orgId]);

  async function toggleBuildInPublic() {
    try {
      const settings = {
        isObjectivesPagePublic: !isBuildInPublicEnabled,
        isRoadmapPagePublic: !isBuildInPublicEnabled,
        isIterationsPagePublic: !isBuildInPublicEnabled,
        isActiveIterationsPagePublic: !isBuildInPublicEnabled,
        isFeedPagePublic: !isBuildInPublicEnabled,
        isIssuesPagePublic: !isBuildInPublicEnabled,
        isFeatureRequestsPagePublic: !isBuildInPublicEnabled
      };
      await updateBuildInPublicSettings(orgId, productId, {
        ...settings,
        isBuildInPublicEnabled: !isBuildInPublicEnabled
      });
      setIsBuildInPublicEnabled(!isBuildInPublicEnabled);
      setBuildInPublicSettings({
        ...settings,
        isBuildInPublicEnabled: !isBuildInPublicEnabled
      });
      clearCache(`${orgId}-settings`);
      toast.success("Settings updated successfully");
    } catch (e) {
      toast.error("Failed to update settings");
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
                <Row>
                  <Col xs={12} md={8}>
                    <CardTitle tag="h2" className="mb-3">Build In Public</CardTitle>
                  </Col>
                  <Col xs={12} md={4}>
                    {!isLoadingBuildInPublicSettings && isBuildInPublicEnabled &&
                      <div className="text-xs-left text-sm-right">
                        <Link className="btn btn-icon btn-primary" color="primary" id="tooltipCopyLink" type="button"
                              to={publicLink} target="_blank">
                          Open the public product page <i className="fas fa-external-link ml-2" />
                        </Link>

                      </div>}
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                {isLoadingBuildInPublicSettings &&
                  <Row>
                    <Col className="text-center">
                      <LoadingSpinnerBox />
                    </Col>
                  </Row>}
                {!isLoadingBuildInPublicSettings &&
                  <>
                    <Row className="mb-3">
                      <Col xs={6} sm={3} md={2}>
                        <h3>Public Pages</h3>
                      </Col>
                      <Col xs={6} sm={9} md={10}>
                        <label className="custom-toggle mr-1">
                          <input checked={isBuildInPublicEnabled} onChange={toggleBuildInPublic} type="checkbox" />
                          <span
                            className="custom-toggle-slider"
                            data-label-off="No"
                            data-label-on="Yes"
                          />
                        </label>
                      </Col>
                    </Row>
                    <Row className="mb-3" hidden={paymentPlan !== "premium"}>
                      <Col xs={6} sm={3} md={2}>
                        Issues
                      </Col>
                      <Col xs={6} sm={9} md={10}>
                        <label className="custom-toggle">
                          <input checked={buildInPublicSettings.isIssuesPagePublic}
                                 onChange={togglePublicPage("isIssuesPagePublic")} type="checkbox" />
                          <span
                            className="custom-toggle-slider"
                            data-label-off="No"
                            data-label-on="Yes"
                          />
                        </label>
                      </Col>
                    </Row>
                    <Row className="mb-3" hidden={paymentPlan !== "premium"}>
                      <Col xs={6} sm={3} md={2}>
                        Feature Requests
                      </Col>
                      <Col xs={6} sm={9} md={10}>
                        <label className="custom-toggle">
                          <input checked={buildInPublicSettings.isFeatureRequestsPagePublic}
                                 onChange={togglePublicPage("isFeatureRequestsPagePublic")} type="checkbox" />
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
                        Feed
                      </Col>
                      <Col xs={6} sm={9} md={10}>
                        <label className="custom-toggle">
                          <input checked={buildInPublicSettings.isFeedPagePublic}
                                 onChange={togglePublicPage("isFeedPagePublic")} type="checkbox" />
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
                        Objectives
                      </Col>
                      <Col xs={6} sm={9} md={10}>
                        <label className="custom-toggle mr-1">
                          <input checked={buildInPublicSettings.isObjectivesPagePublic}
                                 onChange={togglePublicPage("isObjectivesPagePublic")}
                                 type="checkbox" />
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
                          <input checked={buildInPublicSettings.isRoadmapPagePublic}
                                 onChange={togglePublicPage("isRoadmapPagePublic")}
                                 type="checkbox" />
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
                          <input checked={buildInPublicSettings.isIterationsPagePublic}
                                 onChange={togglePublicPage("isIterationsPagePublic")}
                                 type="checkbox" />
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
                          <input checked={buildInPublicSettings.isActiveIterationsPagePublic}
                                 onChange={togglePublicPage("isActiveIterationsPagePublic")} type="checkbox" />
                          <span
                            className="custom-toggle-slider"
                            data-label-off="No"
                            data-label-on="Yes"
                          />
                        </label>
                      </Col>
                    </Row>
                  </>}

              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default BuildInPublic;
