import SimpleHeader from "../../../components/Headers/SimpleHeader";
import { Container, Row } from "reactstrap";
import React from "react";
import { addFeature } from "../../../services/roadmap/roadmap.service";
import CreateUpdateDeleteFeature from "../features/CreateUpdateDeleteFeature";
import { useParams } from "react-router-dom";

function NewFeature() {
  const { orgId, projectId } = useParams();
  const handleSubmit = async (feature) => {
    await addFeature(orgId, projectId, feature);
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
              <CreateUpdateDeleteFeature onSubmit={handleSubmit} />
            </div>
          </div>
        </Row>
      </Container>
    </>
  );
}

export default NewFeature;
