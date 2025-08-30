import React, { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Container,
  Progress,
  Row,
} from 'reactstrap';
import SimpleHeader from 'components/Headers/SimpleHeader.js';
import Select2 from 'react-select2-wrapper';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getOkrStats, listOKRs } from '../../../services/okrs/org-okrs.service';
import OKR from './OKR';
import { formatTimeline } from '../../../services/utils/utils';

function OrgOKRs() {
  let location = useLocation();
  const { orgId } = useParams();
  const searchParams = new URLSearchParams(location.search);
  const timelineQueryFilter = searchParams.get('timeline') || 'this-quarter';
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [okrs, setOKRs] = useState([]);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);

  useEffect(() => {
    document.title = 'Floumy | OKRs';

    async function fetchData() {
      setIsLoading(true);
      try {
        const okrs = await listOKRs(orgId, timelineQueryFilter);
        setOKRs(okrs.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
      } catch (e) {
        console.error(e.message);
      } finally {
        setIsLoading(false);
      }
    }

    async function fetchStats() {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const statsData = await getOkrStats(orgId, timelineQueryFilter);
        setStats(statsData);
      } catch (e) {
        setStatsError('Could not load stats');
      } finally {
        setStatsLoading(false);
      }
    }

    fetchData();
    fetchStats();
  }, [orgId, timelineQueryFilter]);

  return (
    <>
      <SimpleHeader
        headerButtons={[
          {
            name: 'New Objective',
            id: 'new-objective',
            shortcut: 'o',
            action: () => {
              navigate(`/orgs/${orgId}/okrs/new`);
            },
          },
        ]}
      />
      {isLoading && <InfiniteLoadingBar />}
      <Container className="mt--6" fluid id="OKRs">
        {!statsLoading && !statsError && stats && (
          <Row className="my-4">
            <Col lg="4" sm="12">
              <Card className="card-stats">
                <CardBody>
                  <Row>
                    <Col>
                      <h5 className="card-title text-uppercase text-muted mb-0">
                        Total Objectives
                      </h5>
                      <span className="h2 font-weight-bold mb-0">
                        {stats.objectives.total}
                      </span>
                    </Col>
                  </Row>
                  <p className="mt-3 mb-0 text-sm">
                    <span className="text-success">
                      {stats.objectives.completed} completed
                    </span>
                    <span className="text-nowrap ml-2">
                      {stats.objectives.inProgress} in progress
                    </span>
                  </p>
                </CardBody>
              </Card>
            </Col>
            <Col lg="4" sm="12">
              <Card className="card-stats">
                <CardBody>
                  <Row>
                    <Col>
                      <h5 className="card-title text-uppercase text-muted mb-0">
                        Key Results
                      </h5>
                      <span className="h2 font-weight-bold mb-0">
                        {stats.keyResults.total}
                      </span>
                    </Col>
                  </Row>
                  <p className="mt-3 mb-0 text-sm">
                    <span className="text-success">
                      {stats.keyResults.completed} completed
                    </span>
                    <span className="text-nowrap ml-2">
                      {stats.keyResults.inProgress} in progress
                    </span>
                  </p>
                </CardBody>
              </Card>
            </Col>
            <Col lg="4" sm="12">
              <Card className="card-stats">
                <CardBody>
                  <Row>
                    <Col>
                      <h5 className="card-title text-uppercase text-muted mb-0">
                        Average Progress
                      </h5>
                      <span className="h2 font-weight-bold mb-0">
                        {stats.progress.current}%
                      </span>
                    </Col>
                  </Row>
                  <div className="mt-3">
                    <Progress
                      value={stats.progress.current}
                      color="success"
                      style={{ height: '6px' }}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}

        <Row>
          <div className="col">
            <Card>
              <CardHeader>
                <Row>
                  <Col xs={12} sm={8}>
                    <CardTitle tag="h2">Org OKRs</CardTitle>
                  </Col>
                  <Col xs={12} sm={4}>
                    <Select2
                      className="form-control"
                      defaultValue={'this-quarter'}
                      data={[
                        { id: 'past', text: 'Past' },
                        { id: 'this-quarter', text: 'This Quarter' },
                        { id: 'next-quarter', text: 'Next Quarter' },
                        { id: 'later', text: 'Later' },
                      ]}
                      options={{
                        placeholder: 'Filter by timeline',
                      }}
                      value={timelineQueryFilter}
                      onSelect={(e) => {
                        navigate(`?timeline=${e.target.value}`);
                      }}
                    ></Select2>
                  </Col>
                </Row>
              </CardHeader>
              {isLoading && <LoadingSpinnerBox />}
              {!isLoading &&
                okrs.length === 0 &&
                timelineQueryFilter !== 'past' && (
                  <div className="p-5 text-center">
                    <div className="mx-auto" style={{ maxWidth: '680px' }}>
                      <h3 className="mb-3">
                        No OKRs for {formatTimeline(timelineQueryFilter).toLowerCase()} yet
                      </h3>
                      <p className="text-muted">
                        Add an Objective to align your team and track measurable outcomes with Key Results.
                      </p>
                      <div className="my-4">
                        <Link
                          to={`/orgs/${orgId}/okrs/new`}
                          className="btn btn-primary"
                        >
                          Create a new OKR
                        </Link>
                      </div>
                      <Row className="mt-4 text-left">
                        <Col md="6" className="mb-3">
                          <Card>
                            <CardBody>
                              <h5 className="mb-2">What is an Objective?</h5>
                              <p className="mb-0 text-sm text-muted">
                                A concise, qualitative goal that provides direction for the quarter.
                              </p>
                            </CardBody>
                          </Card>
                        </Col>
                        <Col md="6" className="mb-3">
                          <Card>
                            <CardBody>
                              <h5 className="mb-2">What is a Key Result?</h5>
                              <p className="mb-0 text-sm text-muted">
                                A measurable outcome that indicates progress toward the Objective.
                              </p>
                            </CardBody>
                          </Card>
                        </Col>
                      </Row>
                    </div>
                  </div>
                )}
              {!isLoading &&
                okrs.length === 0 &&
                timelineQueryFilter === 'past' && (
                  <div className="p-5 text-center">
                    <div className="mx-auto" style={{ maxWidth: '680px' }}>
                      <h3 className="mb-3">No OKRs in the past</h3>
                      <p className="text-muted mb-0">
                        There are no OKRs recorded for past timelines.
                      </p>
                    </div>
                  </div>
                )}
              {!isLoading && (
                <div className="py-4 px-4">
                  {!isLoading &&
                    okrs &&
                    okrs.map((okr) => (
                      <OKR key={okr.id} okr={okr} orgId={orgId} />
                    ))}
                </div>
              )}
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
}

export default OrgOKRs;
