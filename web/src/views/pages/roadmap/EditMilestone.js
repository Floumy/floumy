import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import CreateUpdateDeleteMilestone from "./CreateUpdateDeleteMilestone";
import { getMilestone, updateMilestone } from "../../../services/roadmap/roadmap.service";
import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import SimpleHeader from "../../../components/Headers/SimpleHeader";
import { Card, Col, Container, Row } from "reactstrap";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";
import NotFoundCard from "../components/NotFoundCard";

function EditMilestone() {
  const { orgId, productId, id } = useParams();
  const [milestone, setMilestone] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const milestone = await getMilestone(orgId, productId, id);
        setMilestone(milestone);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleSubmit = async (values) => {
    await updateMilestone(orgId, productId, id, values);
  };

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
          <Col>
            <div className="card-wrapper">
              {loading && <Card><LoadingSpinnerBox /></Card>}
              {milestone && <CreateUpdateDeleteMilestone onSubmit={handleSubmit} milestone={milestone} />}
              {!milestone && !loading && <NotFoundCard message={"Milestone not found"} />}
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default EditMilestone;
