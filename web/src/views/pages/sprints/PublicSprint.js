import SimpleHeader from "../../../components/Headers/SimpleHeader";
import { Card, Col, Container, Row } from "reactstrap";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";
import { getPublicSprint } from "../../../services/sprints/sprints.service";
import NotFoundCard from "../components/NotFoundCard";
import PublicSprintDetail from "./PublicSprintDetail";

function PublicSprint() {
  const { orgId, projectId, sprintId } = useParams();
  const [sprint, setSprint] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchSprint() {
      setIsLoading(true);
      try {
        const sprint = await getPublicSprint(orgId, projectId, sprintId);
        setSprint(sprint);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSprint();
  }, [orgId, projectId, sprintId]);

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader/>
      <Container className="mt--6" fluid>
        <Row>
          <Col>
            <div className="card-wrapper">
              {isLoading && <Card><LoadingSpinnerBox /></Card>}
              {sprint && <PublicSprintDetail
                orgId={orgId}
                sprint={sprint} />}
              {!sprint && !isLoading && <NotFoundCard message={"Sprint not found"} />}
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default PublicSprint;
