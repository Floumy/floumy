import { useNavigate, useParams } from 'react-router-dom';
import { Col, Container, Row } from 'reactstrap';
import React, { useEffect, useState } from 'react';
import { searchInitiativesWithOptions } from '../../../services/roadmap/roadmap.service';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import InfiniteScroll from 'react-infinite-scroll-component';
import SearchInitiativesListCard from './SearchInitiativesListCard';

function Initiatives() {
  const { orgId, projectId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [initiatives, setInitiatives] = useState([]);
  const navigate = useNavigate();
  const [hasMoreInitiatives, setHasMoreInitiatives] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState({ text: '' });

  const [filterByPriority, setFilterByPriority] = useState('all');
  const [filterByStatus, setFilterByStatus] = useState('all');

  useEffect(() => {
    document.title = 'Floumy | Initiatives';
  }, []);

  async function searchInitiatives(searchOptions, page, initiatives = []) {
    setIsLoading(true);
    try {
      const response = await searchInitiativesWithOptions(
        orgId,
        projectId,
        searchOptions,
        page,
      );
      if (response.length === 0) {
        setHasMoreInitiatives(false);
      } else {
        setInitiatives([...initiatives, ...response]);
        setPage(page + 1);
      }
    } catch (e) {
      console.error(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadNextPage() {
    await searchInitiatives(search, page, initiatives);
  }

  async function handleSearch(searchOptions) {
    setSearch(searchOptions);
    setInitiatives([]);
    setPage(1);
    await searchInitiatives(searchOptions, 1);
  }

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader
        headerButtons={[
          {
            name: 'New Initiative',
            shortcut: 'i',
            id: 'new-initiative',
            action: () => {
              navigate(
                `/admin/orgs/${orgId}/projects/${projectId}/roadmap/initiatives/new`,
              );
            },
          },
        ]}
      />
      <Container className="mt--6" fluid>
        <Row>
          <Col>
            <InfiniteScroll
              next={loadNextPage}
              hasMore={hasMoreInitiatives}
              loader={<></>}
              dataLength={initiatives.length}
              style={{ minHeight: '500px', overflow: 'visible' }}
            >
              <SearchInitiativesListCard
                title="All Initiatives"
                initiatives={initiatives}
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

export default Initiatives;
