import { useNavigate, useParams } from 'react-router-dom';
import { Col, Container, Row } from 'reactstrap';
import React, { useEffect, useState } from 'react';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import InfiniteScroll from 'react-infinite-scroll-component';
import SearchWorkItemsListCard from './SearchWorkItemsListCard';
import { searchWorkItemsWithOptions } from '../../../services/backlog/backlog.service';

function WorkItems() {
  const { orgId, projectId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [workItems, setWorkItems] = useState([]);
  const navigate = useNavigate();
  const [hasMoreWorkItems, setHasMoreWorkItems] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState({ text: '' });

  const [filterByPriority, setFilterByPriority] = useState('all');
  const [filterByStatus, setFilterByStatus] = useState('all');

  useEffect(() => {
    document.title = 'Floumy | Work Items';
  }, []);

  async function searchWorkItems(searchOptions, page, workItems = []) {
    setIsLoading(true);
    try {
      const response = await searchWorkItemsWithOptions(
        orgId,
        projectId,
        searchOptions,
        page,
      );

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

  async function loadNextPage() {
    await searchWorkItems(search, page, workItems);
  }

  async function handleSearch(searchOptions) {
    setSearch(searchOptions);
    setWorkItems([]);
    setPage(1);
    setHasMoreWorkItems(true);
    await searchWorkItems(searchOptions, 1);
  }

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader
        headerButtons={[
          {
            name: 'New Work Item',
            shortcut: 'w',
            id: 'new-work-item',
            action: () => {
              navigate(`/admin/orgs/${orgId}/projects/${projectId}/work-item/new`);
            },
          },
        ]}
      />
      <Container className="mt--6" fluid>
        <Row>
          <Col>
            <InfiniteScroll
              next={loadNextPage}
              hasMore={hasMoreWorkItems}
              loader={<></>}
              dataLength={workItems.length}
              style={{ minHeight: '500px', overflow: 'visible' }}
            >
              <SearchWorkItemsListCard
                title="All Work Items"
                workItems={workItems}
                isLoading={isLoading}
                onSearch={handleSearch}
                searchPlaceholder={'Search by title, description, or reference'}
                filterByPriority={filterByPriority}
                setFilterByPriority={setFilterByPriority}
                filterByStatus={filterByStatus}
                setFilterByStatus={setFilterByStatus}
              />
            </InfiniteScroll>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default WorkItems;