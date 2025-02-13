import { useParams } from "react-router-dom";
import SimpleHeader from "../../../components/Headers/SimpleHeader";
import { Card, Container, Row } from "reactstrap";
import React, { useEffect, useState } from "react";
import CreateUpdateDeleteWorkItem from "./CreateUpdateDeleteWorkItem";
import { getWorkItem, updateWorkItem } from "../../../services/backlog/backlog.service";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";
import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import NotFoundCard from "../components/NotFoundCard";

function EditWorkItem() {
  const [loading, setLoading] = useState(true);
  const [workItem, setWorkItem] = useState(null);
  const { orgId, projectId, id } = useParams();
  const handleSubmit = async (workItem) => {
    return await updateWorkItem(orgId, projectId, id, workItem);
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const workItem = await getWorkItem(orgId, projectId, id);
        setWorkItem(workItem);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, orgId, projectId]);

  return (
    <>
      {loading && <InfiniteLoadingBar />}
      <SimpleHeader/>
      <Container className="mt--6" fluid>
        <Row>
          <div className="col">
            <div className="card-wrapper">
              {loading && <Card><LoadingSpinnerBox /></Card>}
              {workItem && <CreateUpdateDeleteWorkItem onSubmit={handleSubmit} workItem={workItem} />}
              {!workItem && !loading && <NotFoundCard message={"Work item not found"} />}
            </div>
          </div>
        </Row>
      </Container>
    </>
  );
}

export default EditWorkItem;
