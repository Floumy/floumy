import CreateUpdateDeleteMilestone from "./CreateUpdateDeleteMilestone";
import { addMilestone } from "../../../services/roadmap/roadmap.service";
import SimpleHeader from "../../../components/Headers/SimpleHeader";
import React from "react";
import { Col, Container, Row } from "reactstrap";

function NewMilestone() {
  const handleSubmit = async (milestone) => {
    await addMilestone(milestone);
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
              <CreateUpdateDeleteMilestone onSubmit={handleSubmit} />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default NewMilestone;
