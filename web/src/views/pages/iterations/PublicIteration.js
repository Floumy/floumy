import SimpleHeader from "../../../components/Headers/SimpleHeader";
import { Card, Col, Container, Row } from "reactstrap";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";
import { getPublicIteration } from "../../../services/iterations/iterations.service";
import NotFoundCard from "../components/NotFoundCard";
import PublicIterationDetail from "./PublicIterationDetail";

function PublicIteration() {
  const { orgId, iterationId } = useParams();
  const [iteration, setIteration] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchIteration() {
      setIsLoading(true);
      try {
        const iteration = await getPublicIteration(orgId, iterationId);
        setIteration(iteration);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchIteration();
  }, [orgId, iterationId]);

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader headerButtons={[
        {
          name: "Back",
          shortcut: "←",
          action: () => {
            window.history.back();
          }
        }
      ]} />
      <Container className="mt--6" fluid>
        <Row>
          <Col>
            <div className="card-wrapper">
              {isLoading && <Card><LoadingSpinnerBox /></Card>}
              {iteration && <PublicIterationDetail
                orgId={orgId}
                iteration={iteration} />}
              {!iteration && !isLoading && <NotFoundCard message={"Sprint not found"} />}
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default PublicIteration;
