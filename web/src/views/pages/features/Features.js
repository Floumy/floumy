import { useNavigate, useParams } from 'react-router-dom';
import { Col, Container, Row } from 'reactstrap';
import React, { useEffect, useState } from 'react';
import { searchFeaturesWithOptions } from '../../../services/roadmap/roadmap.service';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import InfiniteScroll from 'react-infinite-scroll-component';
import SearchFeaturesListCard from './SearchFeaturesListCard';

function Features() {
  const { orgId, projectId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [features, setFeatures] = useState([]);
  const navigate = useNavigate();
  const [hasMoreFeatures, setHasMoreFeatures] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState({ text: '' });

  const [filterByPriority, setFilterByPriority] = useState('all');
  const [filterByStatus, setFilterByStatus] = useState('all');

  useEffect(() => {
    document.title = 'Floumy | Initiatives';
  }, []);

  async function searchFeatures(searchOptions, page, features = []) {
    setIsLoading(true);
    try {
      const response = await searchFeaturesWithOptions(orgId, projectId, searchOptions, page);
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
    await searchFeatures(search, page, features);
  }

  async function handleSearch(searchOptions) {
    setSearch(searchOptions);
    setFeatures([]);
    setPage(1);
    await searchFeatures(searchOptions, 1);
  }

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader headerButtons={[
        {
          name: 'New Initiative',
          shortcut: 'i',
          id: 'new-feature',
          action: () => {
            navigate(`/admin/orgs/${orgId}/projects/${projectId}/roadmap/features/new`);
          },
        },
      ]} />
      <Container className="mt--6" fluid>
        <Row>
          <Col>
            <InfiniteScroll next={loadNextPage}
                            hasMore={hasMoreFeatures}
                            loader={<></>}
                            dataLength={features.length}
                            style={{ minHeight: '500px', overflow: 'visible' }}>
              <SearchFeaturesListCard title="All Initiatives"
                                      features={features}
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

export default Features;
