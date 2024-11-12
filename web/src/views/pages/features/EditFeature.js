import { useParams } from "react-router-dom";
import { getFeature, updateFeature } from "../../../services/roadmap/roadmap.service";
import SimpleHeader from "../../../components/Headers/SimpleHeader";
import { Card, Container, Row } from "reactstrap";
import CreateUpdateDeleteFeature from "./CreateUpdateDeleteFeature";
import React, { useEffect, useState } from "react";
import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";
import NotFoundCard from "../components/NotFoundCard";

function EditFeature() {
  const { id } = useParams();
  const [feature, setFeature] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const feature = await getFeature(id);
        setFeature(feature);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleSubmit = async (feature) => {
    await updateFeature(id, feature);
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
              {feature && <CreateUpdateDeleteFeature onSubmit={handleSubmit} feature={feature} />}
              {!feature && !loading && <NotFoundCard message={"Initiative not found"} />}
            </div>
          </div>
        </Row>
      </Container>
    </>
  );
}

export default EditFeature;
