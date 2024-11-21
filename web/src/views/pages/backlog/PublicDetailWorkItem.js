import { useParams } from "react-router-dom";
import SimpleHeader from "../../../components/Headers/SimpleHeader";
import { Card, Container, Row } from "reactstrap";
import React, { useEffect, useState } from "react";
import { getPublicWorkItem } from "../../../services/backlog/backlog.service";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";
import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import NotFoundCard from "../components/NotFoundCard";
import PublicWorkItem from "./PublicWorkItem";

function PublicDetailWorkItem() {
  const [loading, setLoading] = useState(true);
  const [workItem, setWorkItem] = useState(null);
  const { orgId, projectId, workItemId } = useParams();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const workItem = await getPublicWorkItem(orgId, projectId, workItemId);
        setWorkItem(workItem);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    }

    fetchData();
  }, [orgId, projectId, workItemId]);

  return (
    <>
      {loading && <InfiniteLoadingBar />}
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
              {loading && <Card><LoadingSpinnerBox /></Card>}
              {workItem && <PublicWorkItem workItem={workItem} />}
              {!workItem && !loading && <NotFoundCard message={"Work item not found"} />}
            </div>
          </div>
        </Row>
      </Container>
    </>
  );
}

export default PublicDetailWorkItem;
