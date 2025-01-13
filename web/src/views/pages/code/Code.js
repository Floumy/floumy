import React, { useState } from 'react';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Card, CardBody, CardHeader, CardTitle, Col, Container, Row } from 'reactstrap';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';

function Code() {
  const [isLoadingIntegration, setIsLoadingIntegration] = useState(false);

  return (
    <>
      {isLoadingIntegration && <InfiniteLoadingBar />}
      <SimpleHeader />
      <Container className="mt--6" fluid id="OKRs">
        <Row>
          <Col>
            <Card className="mb-5">
              <CardHeader>
                <Row>
                  <Col md={12}>
                    <CardTitle tag="h2" className="mb-3">Code</CardTitle>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                {isLoadingIntegration &&
                  <Row>
                    <Col className="text-center">
                      <LoadingSpinnerBox />
                    </Col>
                  </Row>}
                {!isLoadingIntegration &&
                  <Row>
                    <Col>
                      <div>
                        <button className="btn btn-success" type="button" onClick={() => {
                        }}>
                          Connect GitHub
                        </button>
                      </div>
                    </Col>
                  </Row>}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Code;