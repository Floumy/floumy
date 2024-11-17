import { useNavigate } from "react-router-dom";
import { Col, Container, Row } from "reactstrap";
import React, { useEffect, useState } from "react";
import { listFeatures, searchFeatures } from "../../../services/roadmap/roadmap.service";
import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import SimpleHeader from "../../../components/Headers/SimpleHeader";
import FeaturesListCard from "./FeaturesListCard";
import InfiniteScroll from "react-infinite-scroll-component";

function Features() {
  const [isLoading, setIsLoading] = useState(true);
  const [features, setFeatures] = useState([]);
  const navigate = useNavigate();
  const [hasMoreFeatures, setHasMoreFeatures] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  async function fetchData(page, features = []) {
    setIsLoading(true);
    try {
      const featuresList = await listFeatures(page);
      if (featuresList.length === 0) {
        setHasMoreFeatures(false);
      } else {
        setFeatures([...features, ...featuresList]);
        setPage(page + 1);
      }
    } catch (e) {
      console.error(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    document.title = "Floumy | Initiatives";
    fetchData(1);
  }, []);

  async function searchFeaturesByText(searchText, page, features = []) {
    setIsLoading(true);
    try {
      const response = await searchFeatures(searchText, page);
      if (response.length === 0) {
        setHasMoreFeatures(false);
      } else {
        setFeatures([...features, ...response]);
        setPage(page + 1);
      }
    } catch (e) {
      console.error(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadNextPage() {
    if (search !== "") {
      await searchFeaturesByText(search, page, features);
    } else {
      await fetchData(page, features);
    }
  }

  async function handleSearch(searchText) {
    setSearch(searchText);
    setFeatures([]);
    setPage(1);
    if (searchText === "") {
      await fetchData(1);
    } else {
      await searchFeaturesByText(searchText, 1);
    }
  }

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader headerButtons={[
        {
          name: "New Initiative",
          shortcut: "i",
          id: "new-feature",
          action: () => {
            navigate("/admin/roadmap/features/new");
          }
        }
      ]} />
      <Container className="mt--6" fluid>
        <Row>
          <Col>
            <InfiniteScroll next={loadNextPage}
                            hasMore={hasMoreFeatures}
                            loader={<></>}
                            dataLength={features.length}>
              <FeaturesListCard title="All Initiatives"
                                features={features}
                                isLoading={isLoading}
                                showFilters={false}
                                enableContextMenu={false}
                                showAssignedTo={false}
                                onSearch={handleSearch}
                                searchPlaceholder={"Search by title, description, or reference"}
              />
            </InfiniteScroll>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Features;
