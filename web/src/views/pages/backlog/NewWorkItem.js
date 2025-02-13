import SimpleHeader from "../../../components/Headers/SimpleHeader";
import { Container, Row } from "reactstrap";
import React from "react";
import CreateUpdateDeleteWorkItem from "./CreateUpdateDeleteWorkItem";
import { addWorkItem } from "../../../services/backlog/backlog.service";
import { useParams } from "react-router-dom";

function NewWorkItem() {
  const { orgId, projectId } = useParams();
  const handleSubmit = async (workItem) => {
    return await addWorkItem(orgId, projectId, workItem);
  };

  return (
    <>
      <SimpleHeader/>
      <Container className="mt--6" fluid>
        <Row>
          <div className="col">
            <div className="card-wrapper">
              <CreateUpdateDeleteWorkItem onSubmit={handleSubmit} />
            </div>
          </div>
        </Row>
      </Container>
    </>
  );
}

export default NewWorkItem;
