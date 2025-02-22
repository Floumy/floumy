
import React, { useEffect } from "react";
// nodejs library that concatenates classes
// reactstrap components
import { Container, Row } from "reactstrap";
// core components
import SimpleHeader from "components/Headers/SimpleHeader.js";
import { addOKR } from "../../../services/okrs/okrs.service";
import CreateUpdateDeleteOKR from "./CreateUpdateDeleteOKR";
import { useParams } from "react-router-dom";

function NewOKR() {
  const { orgId, projectId } = useParams();

  useEffect(() => {
    document.title = "Floumy | OKR";
  }, []);

  return (
    <>
      <SimpleHeader/>
      <Container className="mt--6" fluid>
        <Row>
          <div className="col">
            <div className="card-wrapper">
              <CreateUpdateDeleteOKR onSubmit={async (values) => {
                return await addOKR(orgId, projectId, {
                  objective: {
                    title: values.objective,
                    timeline: values.timeline,
                    assignedTo: values.assignedTo
                  },
                  keyResults: values.keyResults
                });
              }} />
            </div>
          </div>
        </Row>
      </Container>
    </>
  );
}

export default NewOKR;
