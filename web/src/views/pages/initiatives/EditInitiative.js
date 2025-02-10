import { useParams } from "react-router-dom";
import { getInitiative, updateInitiative } from "../../../services/roadmap/roadmap.service";
import SimpleHeader from "../../../components/Headers/SimpleHeader";
import { Card, Container, Row } from "reactstrap";
import CreateUpdateDeleteInitiative from "./CreateUpdateDeleteInitiative";
import React, { useEffect, useState } from "react";
import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";
import NotFoundCard from "../components/NotFoundCard";

function EditInitiative() {
  const { orgId, projectId, id } = useParams();
  const [initiative, setInitiative] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const initiative = await getInitiative(orgId, projectId, id);
        setInitiative(initiative);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleSubmit = async (initiative) => {
    await updateInitiative(orgId, projectId, id, initiative);
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
          <div className="col">
            <div className="card-wrapper">
              {loading && <Card><LoadingSpinnerBox /></Card>}
              {initiative && <CreateUpdateDeleteInitiative onSubmit={handleSubmit} initiative={initiative} />}
              {!initiative && !loading && <NotFoundCard message={"Initiative not found"} />}
            </div>
          </div>
        </Row>
      </Container>
    </>
  );
}

export default EditInitiative;
