import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import SimpleHeader from "../../../components/Headers/SimpleHeader";
import { Badge, Card, CardHeader, Col, Container, Row } from "reactstrap";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  formatDate,
  formatHyphenatedString,
  getIterationEndDate,
  getIterationStartDate,
  workItemStatusColorClassName
} from "../../../services/utils/utils";
import { getPublicActiveIteration } from "../../../services/iterations/iterations.service";
import DevelopmentStats from "./DevelopmentStats";
import PublicWorkItemsList from "../backlog/PublicWorkItemsList";
import PublicShareButtons from "../../../components/PublicShareButtons/PublicShareButtons";
import { getWorkItemsGroupedByStatus } from "../../../services/utils/workItemUtils";

function PublicActiveIteration() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeIteration, setActiveIteration] = useState(null);
  const [workItemsByStatus, setWorkItemsByStatus] = useState({});
  const { orgId, productId } = useParams();

  const setWorkItemsGroupedByStatus = useCallback((workItems) => {
    const sortedWorkItemsByStatus = getWorkItemsGroupedByStatus(workItems);
    setWorkItemsByStatus(sortedWorkItemsByStatus);
  }, []);

  useEffect(() => {
    document.title = "Floumy | Development";

    async function fetchData() {
      try {
        setIsLoading(true);
        const activeIteration = await getPublicActiveIteration(orgId, productId);
        setActiveIteration(activeIteration);
        if (activeIteration && activeIteration.workItems.length > 0) {
          setWorkItemsGroupedByStatus(activeIteration.workItems);
        }
        setIsLoading(false);
      } catch (e) {
        console.error(e.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [orgId, productId, setWorkItemsGroupedByStatus]);

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader />
      <Container className="mt--6" fluid id="OKRs">
        {isLoading && <Card><CardHeader><h3>Active Sprint</h3></CardHeader><LoadingSpinnerBox /></Card>}
        {!isLoading && activeIteration && activeIteration.workItems && activeIteration.workItems.length > 0 &&
          <DevelopmentStats iteration={activeIteration} />}
        <Row>
          <Col>
            {!isLoading && !activeIteration && (
              <Card>
                <CardHeader>
                  <Row>
                    <Col sm={6}>
                      <h3 className="mb-0">Active Sprint</h3>
                    </Col>
                  </Row>
                </CardHeader>
                <Row>
                  <Col sm={12}>
                    <h3 className="text-center pt-3 py-2">No active sprint found.</h3>
                  </Col>
                </Row>
              </Card>
            )}
            {activeIteration && (
              <Card>
                <CardHeader>
                  <Row>
                    <Col xs={12}>
                      <h3>
                          <span
                            className="text-muted">{formatDate(getIterationStartDate(activeIteration))} - {formatDate(getIterationEndDate(activeIteration))}</span> | {activeIteration.title}
                      </h3>
                      <p className="text-muted mb-0">{activeIteration.goal}</p>
                      {activeIteration &&
                        <div className="py-2"><PublicShareButtons title={activeIteration.title} /></div>}
                    </Col>
                  </Row>
                </CardHeader>
                <div className="pt-3">
                  {Object.keys(workItemsByStatus).length === 0 && !isLoading && (
                    <div className="text-center mb-3">
                      No work items found in this sprint.
                    </div>
                  )}

                  {Object.keys(workItemsByStatus).map((status) => (
                    <div key={status} className="mb-5">
                      <Row className="pl-4 pt-2 pr-4 mb-1">
                        <Col>
                          <Badge color="" className="badge-dot mb-2">
                            <h4 className="mb-0"><i
                              className={workItemStatusColorClassName(status)} /> {formatHyphenatedString(status)}</h4>
                          </Badge>
                        </Col>
                      </Row>
                      <PublicWorkItemsList
                        orgId={orgId}
                        workItems={workItemsByStatus[status]}
                        showFeature={true}
                        headerClassName={"thead"} />
                    </div>
                  ))}
                </div>
                {isLoading && <LoadingSpinnerBox />}
              </Card>)}
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default PublicActiveIteration;
