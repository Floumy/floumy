import React, { useEffect, useState } from "react";
import { listWorkItems, searchWorkItems } from "../../../services/backlog/backlog.service";
import { useNavigate, useParams } from "react-router-dom";
import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import SimpleHeader from "../../../components/Headers/SimpleHeader";
import { Container, Row } from "reactstrap";
import WorkItemsListCard from "./WorkItemsListCard";
import InfiniteScroll from "react-infinite-scroll-component";

function WorkItems() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [workItems, setWorkItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMoreWorkItems, setHasMoreWorkItems] = useState(true);
  const [search, setSearch] = useState("");
  const { orgId, projectId } = useParams();

  async function fetchData(page, workItems = []) {
    setIsLoading(true);
    try {
      const workItemsList = await listWorkItems(orgId, projectId, page, 50);
      if (workItemsList.length === 0) {
        setHasMoreWorkItems(false);
      } else {
        setWorkItems([...workItems, ...workItemsList]);
        setPage(page + 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    document.title = "Floumy | Work Items";
    fetchData(1);
  }, []);

  async function loadNextPage() {
    if (search !== "") {
      await searchWorkItemsByText(search, page, workItems);
    } else {
      await fetchData(page, workItems);
    }
  }

  async function handleSearch(searchText) {
    setSearch(searchText);
    setWorkItems([]);
    setPage(1);
    if (searchText === "") {
      await fetchData(1);
    } else {
      await searchWorkItemsByText(searchText, 1);
    }
  }

  async function searchWorkItemsByText(searchText, page, workItems = []) {
    setIsLoading(true);
    try {
      const response = await searchWorkItems(orgId, projectId, searchText, page);
      if (response.length === 0) {
        setHasMoreWorkItems(false);
      } else {
        setWorkItems([...workItems, ...response]);
        setPage(page + 1);
      }
    } catch (e) {
      console.error(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader
        headerButtons={[
          {
            name: "New Work Item",
            shortcut: "w",
            id: "new-work-item",
            action: () => {
              navigate(`/admin/orgs/${orgId}/projects/${projectId}/work-item/new`);
            }
          }
        ]}
      />
      <Container className="mt--6" fluid id="OKRs">
        <Row>
          <div className="col">
            <InfiniteScroll next={loadNextPage}
                            hasMore={hasMoreWorkItems}
                            loader={<></>}
                            dataLength={workItems.length}>
              <WorkItemsListCard workItems={workItems}
                                 title={"All Work Items"}
                                 isLoading={isLoading}
                                 enableContextMenu={false}
                                 showAssignedTo={false}
                                 showFeature={false}
                                 showFilters={false}
                                 onSearch={handleSearch}
                                 searchPlaceholder={"Search by title, description, or reference"}
              />
            </InfiniteScroll>
          </div>
        </Row>
      </Container>
    </>
  );
}

export default WorkItems;
