import SimpleHeader from "../../../components/Headers/SimpleHeader";
import { Col, Container, Row } from "reactstrap";
import React from "react";
import CreateUpdateDeleteIteration from "./CreateUpdateDeleteIteration";
import { addIteration } from "../../../services/iterations/iterations.service";

function NewIteration() {
  const handleSubmit = async (iteration) => {
    await addIteration(iteration);
  };

  return (
    <>
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
              <CreateUpdateDeleteIteration onSubmit={handleSubmit} />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default NewIteration;
