import SimpleHeader from "../../../components/Headers/SimpleHeader";
import { Container, Row } from "reactstrap";
import React from "react";
import { addInitiative } from "../../../services/roadmap/roadmap.service";
import CreateUpdateDeleteInitiative from "../initiatives/CreateUpdateDeleteInitiative";
import { useParams } from "react-router-dom";

function NewInitiative() {
  const { orgId, projectId } = useParams();
  const handleSubmit = async (initiative) => {
    await addInitiative(orgId, projectId, initiative);
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
          <div className="col">
            <div className="card-wrapper">
              <CreateUpdateDeleteInitiative onSubmit={handleSubmit} />
            </div>
          </div>
        </Row>
      </Container>
    </>
  );
}

export default NewInitiative;
