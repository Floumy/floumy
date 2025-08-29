import React, { useEffect, useState } from 'react';
// javascript plugin that creates a sortable object from a dom object
// reactstrap components
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
// core components
import SimpleHeader from 'components/Headers/SimpleHeader.js';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getOkrStats, listOKRs } from '../../../services/okrs/okrs.service';
import Select2 from 'react-select2-wrapper';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import OKR from './OKR';

function OKRs() {
  let location = useLocation();
  const { orgId, projectId } = useParams();
  const searchParams = new URLSearchParams(location.search);
  const timelineQueryFilter = searchParams.get('timeline') || 'this-quarter';
  const navigate = useNavigate();
  const okrTemplate = {
    id: 0,
    reference: '',
    title: '',
    status: '',
    progress: 0,
    timeline: '',
  };
  const [okrs, setOKRs] = useState([okrTemplate]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);

  useEffect(() => {
    document.title = 'Floumy | OKRs';

    async function fetchData() {
      setIsLoading(true);
      try {
        const okrs = await listOKRs(orgId, projectId, timelineQueryFilter);
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
        const statsData = await getOkrStats(
          orgId,
          projectId,
          timelineQueryFilter,
        );
        setStats(statsData);
      } catch (e) {
        setStatsError('Could not load stats');
      } finally {
        setStatsLoading(false);
      }
    }

    fetchData();
    fetchStats();
  }, [orgId, projectId, timelineQueryFilter]);

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader
        headerButtons={[
          {
            name: 'New Objective',
            id: 'new-objective',
            shortcut: 'o',
            action: () => {
              navigate(`/admin/orgs/${orgId}/projects/${projectId}/okrs/new`);
            },
          },
        ]}
      />
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
                    <CardTitle tag="h2">OKRs</CardTitle>
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
              {!isLoading && okrs.length === 0 && (
                <div className="p-4">
                  <div>
                    <div
                      style={{ maxWidth: '600px' }}
                      className="mx-auto font-italic"
                    >
                      <h3>Objectives</h3>
                      <p>
                        Objectives are your high-level goals that you want to
                        achieve with your project. They provide direction and
                        purpose, helping your team stay focused on what matters
                        most. Start by defining your main objectives to give
                        your project a clear path forward.
                        <br />
                      </p>
                      <br />
                      <h3>Key Results</h3>
                      <p>
                        Key Results are specific, measurable outcomes that
                        indicate progress towards your objectives. They help you
                        track your success and ensure you're on the right track.
                        Think of them as targets that show how close you are to
                        achieving your goals. .
                        <br />
                        <Link
                          to={`/admin/orgs/${orgId}/projects/${projectId}/okrs/new`}
                          className="text-blue font-weight-bold"
                        >
                          Create an Objective with Key Results
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="py-4 px-4">
                {!isLoading &&
                  okrs &&
                  okrs.map((okr) => (
                    <OKR
                      key={okr.id}
                      okr={okr}
                      orgId={orgId}
                      projectId={projectId}
                    />
                  ))}
              </div>
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
}

export default OKRs;
