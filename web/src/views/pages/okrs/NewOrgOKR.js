import React, { useEffect } from 'react';
// nodejs library that concatenates classes
// reactstrap components
import { Container, Row } from 'reactstrap';
// core components
import SimpleHeader from 'components/Headers/SimpleHeader.js';
import { useParams } from 'react-router-dom';
import { addOKR } from '../../../services/okrs/org-okrs.service';
import CreateUpdateDeleteOrgOKR from './CreateUpdateDeleteOrgOKR';

function NewOrgOkr() {
  const { orgId } = useParams();

  useEffect(() => {
    document.title = 'Floumy | OKR';
  }, []);

  return (
    <>
      <SimpleHeader />
      <Container className="mt--6" fluid>
        <Row>
          <div className="col">
            <div className="card-wrapper">
              <CreateUpdateDeleteOrgOKR
                onSubmit={async (values) => {
                  return await addOKR(orgId, {
                    objective: {
                      title: values.objective,
                      timeline: values.timeline,
                      assignedTo: values.assignedTo,
                    },
                    keyResults: values.keyResults,
                  });
                }}
              />
            </div>
          </div>
        </Row>
      </Container>
    </>
  );
}

export default NewOrgOkr;
