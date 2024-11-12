import SimpleHeader from "../../../components/Headers/SimpleHeader";
import { Card, Col, Container, Row } from "reactstrap";
import React, { useEffect, useState } from "react";
import CreateUpdateDeleteIteration from "./CreateUpdateDeleteIteration";
import { useParams } from "react-router-dom";
import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";
import { getIteration, updateIteration } from "../../../services/iterations/iterations.service";
import NotFoundCard from "../components/NotFoundCard";

function EditIteration() {
  const { id } = useParams();
  const [iteration, setIteration] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchIteration() {
      setIsLoading(true);
      try {
        const iteration = await getIteration(id);
        setIteration(iteration);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchIteration();
  }, [id]);

  const handleSubmit = async (iteration) => {
    await updateIteration(id, iteration);
  };

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
              {iteration && <CreateUpdateDeleteIteration iteration={iteration} onSubmit={handleSubmit} />}
              {!iteration && !isLoading && <NotFoundCard message={"Sprint not found"} />}
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default EditIteration;
