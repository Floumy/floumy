import { Button, Card, CardBody, CardHeader } from "reactstrap";
import React from "react";
import { getCheckoutSessionUrl } from "../../../../services/payments/payments.service";

function Pricing() {
  const [isSubscribing, setIsSubscribing] = React.useState(false);
  const subscribeTo = (plan) => async () => {
    setIsSubscribing(true);
    const url = await getCheckoutSessionUrl(plan);
    setIsSubscribing(false);
    window.location.href = url;
  };

  return (
    <div className="pricing card-group flex-column flex-md-row mb-6 mx-auto" style={{ maxWidth: "1024px" }}>
      <Card className="card-pricing border-0 text-center mb-4">
        <CardHeader className="bg-transparent">
          <h4 className="text-uppercase ls-1 text-info py-3 mb-0">
            Build in Private
          </h4>
        </CardHeader>
        <CardBody className="px-lg-7">
          <div className="display-2">$8</div>
          <span className="text-muted">per user/month</span>
          <ul className="list-unstyled my-4">
            <li>
              <div className="d-flex align-items-center">
                <div>
                  <div className="icon icon-xs icon-shape bg-info shadow rounded-circle text-white">
                    <i className="fas fa-check" />
                  </div>
                </div>
                <div>
      <span className="pl-2 ">
        Objectives and Key Results (OKRs)
      </span>
                </div>
              </div>
            </li>

            <li>
              <div className="d-flex align-items-center">
                <div>
                  <div className="icon icon-xs icon-shape bg-info shadow rounded-circle text-white">
                    <i className="fas fa-check" />
                  </div>
                </div>
                <div>
      <span className="pl-2 ">
        Project Roadmaps
      </span>
                </div>
              </div>
            </li>

            <li>
              <div className="d-flex align-items-center">
                <div>
                  <div className="icon icon-xs icon-shape bg-info shadow rounded-circle text-white">
                    <i className="fas fa-check" />
                  </div>
                </div>
                <div>
      <span className="pl-2 ">
        Milestone Tracking
      </span>
                </div>
              </div>
            </li>

            <li>
              <div className="d-flex align-items-center">
                <div>
                  <div className="icon icon-xs icon-shape bg-info shadow rounded-circle text-white">
                    <i className="fas fa-check" />
                  </div>
                </div>
                <div>
      <span className="pl-2 ">
        Development Sprints
      </span>
                </div>
              </div>
            </li>

            <li>
              <div className="d-flex align-items-center">
                <div>
                  <div className="icon icon-xs icon-shape bg-info shadow rounded-circle text-white">
                    <i className="fas fa-check" />
                  </div>
                </div>
                <div>
      <span className="pl-2 ">
        Work Item Management
      </span>
                </div>
              </div>
            </li>

            <li>
              <div className="d-flex align-items-center">
                <div>
                  <div className="icon icon-xs icon-shape bg-info shadow rounded-circle text-white">
                    <i className="fas fa-check" />
                  </div>
                </div>
                <div>
      <span className="pl-2 ">
        Initiative Management
      </span>
                </div>
              </div>
            </li>

            <li>
              <div className="d-flex align-items-center">
                <div>
                  <div className="icon icon-xs icon-shape bg-info shadow rounded-circle text-white">
                    <i className="fas fa-check" />
                  </div>
                </div>
                <div>
      <span className="pl-2 ">
        Analytics
      </span>
                </div>
              </div>
            </li>
          </ul>
          <Button className="mb-3" color="info" type="button" onClick={subscribeTo("build-in-private")}
                  disabled={isSubscribing}>
            Subscribe
          </Button>
        </CardBody>
      </Card>
      <Card
        className="card-pricing bg-gradient-success zoom-in shadow-lg rounded border-0 text-center mb-4">
        <CardHeader className="bg-transparent">
          <h4 className="text-uppercase ls-1 text-white py-3 mb-0">
            Build in Public
          </h4>
        </CardHeader>
        <CardBody className="px-lg-7">
          <div className="display-1 text-white">$10</div>
          <span className="text-white">per user/month</span>
          <ul className="list-unstyled my-4 text-sm">
            <li>
              <div className="d-flex align-items-center">
                <div>
                          <span className="text-white font-italic text-lg">
                            All the features to build in private plus:
                          </span>
                </div>
              </div>
            </li>
            <li>
              <div className="d-flex align-items-center">
                <div>
                  <div className="icon icon-xs icon-shape bg-white shadow rounded-circle text-muted">
                    <i className="fas fa-check" />
                  </div>
                </div>
                <div>
      <span className="pl-2 text-white">
        Public Objectives and Key Results (OKRs)
      </span>
                </div>
              </div>
            </li>

            <li>
              <div className="d-flex align-items-center">
                <div>
                  <div className="icon icon-xs icon-shape bg-white shadow rounded-circle text-muted">
                    <i className="fas fa-check" />
                  </div>
                </div>
                <div>
      <span className="pl-2 text-white">
        Public Project Roadmaps
      </span>
                </div>
              </div>
            </li>

            <li>
              <div className="d-flex align-items-center">
                <div>
                  <div className="icon icon-xs icon-shape bg-white shadow rounded-circle text-muted">
                    <i className="fas fa-check" />
                  </div>
                </div>
                <div>
      <span className="pl-2 text-white">
        Public Milestone Updates
      </span>
                </div>
              </div>
            </li>

            <li>
              <div className="d-flex align-items-center">
                <div>
                  <div className="icon icon-xs icon-shape bg-white shadow rounded-circle text-muted">
                    <i className="fas fa-check" />
                  </div>
                </div>
                <div>
      <span className="pl-2 text-white">
        Public Initiative Tracking
      </span>
                </div>
              </div>
            </li>

            <li>
              <div className="d-flex align-items-center">
                <div>
                  <div className="icon icon-xs icon-shape bg-white shadow rounded-circle text-muted">
                    <i className="fas fa-check" />
                  </div>
                </div>
                <div>
      <span className="pl-2 text-white">
        Public Development Sprints
      </span>
                </div>
              </div>
            </li>

            <li>
              <div className="d-flex align-items-center">
                <div>
                  <div className="icon icon-xs icon-shape bg-white shadow rounded-circle text-muted">
                    <i className="fas fa-check" />
                  </div>
                </div>
                <div>
      <span className="pl-2 text-white">
        Public Work Item Tracking
      </span>
                </div>
              </div>
            </li>

            <li>
              <div className="d-flex align-items-center">
                <div>
                  <div className="icon icon-xs icon-shape bg-white shadow rounded-circle text-muted">
                    <i className="fas fa-check" />
                  </div>
                </div>
                <div>
      <span className="pl-2 text-white">
        Public Analytics
      </span>
                </div>
              </div>
            </li>
          </ul>
          <Button className="mb-3" color="secondary" type="button" onClick={subscribeTo("build-in-public")}
                  disabled={isSubscribing}>
            Subscribe
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}

export default Pricing;
