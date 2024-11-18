import { Card, CardHeader, Col, Container, Row } from "reactstrap";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublicFeature } from "../../../services/roadmap/roadmap.service";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";
import SimpleHeader from "../../../components/Headers/SimpleHeader";
import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import { sortByPriority } from "../../../services/utils/utils";
import NotFoundCard from "../components/NotFoundCard";
import ExecutionStats from "../components/stats/ExecutionStats";
import PublicFeature from "./PublicFeature";
import PublicWorkItemsList from "../backlog/PublicWorkItemsList";
import { toast } from "react-toastify";
import Comments from "../../../components/Comments/Comments";
import useFeatureComments from "../../../hooks/useFeatureComments";

export function PublicDetailFeature() {
  const [feature, setFeature] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { orgId, productId, featureId } = useParams();
  const {
    addComment,
    updateComment,
    deleteComment
  } = useFeatureComments(feature, setFeature, toast);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const feature = await getPublicFeature(orgId, productId, featureId);
        setFeature(feature);
      } catch (e) {
        console.error(e.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [orgId, productId, featureId]);

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader
        headerButtons={[
          {
            name: "Back",
            shortcut: "←",
            action: () => {
              window.history.back();
            }
          }
        ]}
      />
      <Container className="mt--6" fluid id="OKRs">
        {feature && feature.workItems && feature.workItems.length > 0 &&
          <ExecutionStats workItems={feature.workItems} dueDate={feature?.milestone?.dueDate} />}
        <Row>
          <Col>
            {!isLoading && !feature && <NotFoundCard message="Initiative not found" />}
            {!isLoading && feature && <PublicFeature feature={feature} />}
            <Card>
              {isLoading && <LoadingSpinnerBox />}
              {!isLoading && feature &&
                <>
                  <CardHeader className="border-1">
                    <div className="row">
                      <div className="col-12">
                        <h3 className="mb-0">Related Work Items</h3>
                      </div>
                    </div>
                  </CardHeader>
                  <PublicWorkItemsList
                    orgId={orgId}
                    workItems={sortByPriority(feature.workItems)}
                    showFeature={false}
                  />
                </>
              }
            </Card>
          </Col>
        </Row>
        <Row>
          {!isLoading &&
            <Col>
              <Comments comments={feature?.comments}
                        onCommentAdd={addComment}
                        onCommentEdit={updateComment}
                        onCommentDelete={deleteComment} />
            </Col>
          }
        </Row>
      </Container>
    </>
  );
}
