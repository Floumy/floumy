import SimpleHeader from "../../../components/Headers/SimpleHeader";
import { Container, Row } from "reactstrap";
import React from "react";
import CreateUpdateDeleteWorkItem from "./CreateUpdateDeleteWorkItem";
import { addWorkItem } from "../../../services/backlog/backlog.service";

function NewWorkItem() {
  const handleSubmit = async (workItem) => {
    await addWorkItem(workItem);
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
              <CreateUpdateDeleteWorkItem onSubmit={handleSubmit} />
            </div>
          </div>
        </Row>
      </Container>
    </>
  );
}

export default NewWorkItem;
