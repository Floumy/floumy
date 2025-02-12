import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { getPublicMilestone } from "../../../services/roadmap/roadmap.service";
import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import SimpleHeader from "../../../components/Headers/SimpleHeader";
import { Card, Col, Container, Row } from "reactstrap";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";
import NotFoundCard from "../components/NotFoundCard";
import PublicMilestoneDetail from "./PublicMilestoneDetail.";

function PublicMilestone() {
  const { orgId, projectId, milestoneId } = useParams();
  const [milestone, setMilestone] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const milestone = await getPublicMilestone(orgId, projectId, milestoneId);
        setMilestone(milestone);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    }

    fetchData();
  }, [orgId, milestoneId, projectId]);

  return (
    <>
      {loading && <InfiniteLoadingBar />}
      <SimpleHeader/>
      <Container className="mt--6" fluid>
        <Row>
          <Col>
            <div className="card-wrapper">
              {loading && <Card><LoadingSpinnerBox /></Card>}
              {milestone && <PublicMilestoneDetail milestone={milestone} />}
              {!milestone && !loading && <NotFoundCard message={"Milestone not found"} />}
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default PublicMilestone;
