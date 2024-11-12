/*!

=========================================================
* Argon Dashboard PRO React - v1.2.4
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-pro-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { useEffect } from 'react';
// nodejs library that concatenates classes
// reactstrap components
import { Container, Row } from 'reactstrap';
// core components
import SimpleHeader from 'components/Headers/SimpleHeader.js';
import { addOKR } from '../../../services/okrs/okrs.service';
import CreateUpdateDeleteOKR from './CreateUpdateDeleteOKR';

function NewOKR() {
  useEffect(() => {
    document.title = 'Floumy | OKR';
  }, []);
  return (
    <>
      <SimpleHeader
        headerButtons={[
          {
            name: 'Back',
            shortcut: '←',
            action: () => {
              window.history.back();
            },
          },
        ]}
      />
      <Container className="mt--6" fluid>
        <Row>
          <div className="col">
            <div className="card-wrapper">
              <CreateUpdateDeleteOKR onSubmit={async (values) => {
                await addOKR({
                  objective: {
                    title: values.objective,
                    timeline: values.timeline,
                    assignedTo: values.assignedTo,
                  },
                  keyResults: values.keyResults,
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
