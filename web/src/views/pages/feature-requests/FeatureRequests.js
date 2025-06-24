import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import {
  Badge,
  Card,
  CardHeader,
  CardTitle,
  Col,
  Container,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Row,
} from 'reactstrap';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  initiativeStatusColorClassName,
  formatHyphenatedString,
} from '../../../services/utils/utils';
import {
  downvoteFeatureRequest,
  listCurrentUserFeatureRequestVotes,
  listFeatureRequests,
  searchFeatureRequests,
  upvoteFeatureRequest,
} from '../../../services/feature-requests/feature-requests.service';
import InfiniteScroll from 'react-infinite-scroll-component';
import { isAuthenticated } from '../../../services/auth/auth.service';
import { toast } from 'react-toastify';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';

export default function FeatureRequests({ isPublic = false }) {
  const { orgId, projectId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [featureRequests, setFeatureRequests] = useState([]);
  const [hasMoreFeatureRequests, setHasMoreFeatureRequests] = useState(true);
  const [featureRequestVotesMap, setFeatureRequestVotesMap] = useState({});
  const navigate = useNavigate();
  const context = isPublic ? 'public' : 'admin';
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchText, setSearchText] = useState('');

  const typingTimeoutRef = useRef(null);

  function debounce(func, delay) {
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(func, delay);
  }

  function doSearch(event) {
    const searchText = event.target.value;
    setSearchText(searchText);
    debounce(async () => await handleSearch(searchText), 500);
  }

  async function fetchFeatureRequests(page = 1, searchTerm = '') {
    setIsLoading(true);
    try {
      let featureRequestsData;
      if (searchTerm) {
        featureRequestsData = await searchFeatureRequests(
          orgId,
          projectId,
          searchTerm,
          page,
          50,
        );
      } else {
        featureRequestsData = await listFeatureRequests(
          orgId,
          projectId,
          page,
          50,
        );
      }
      if (featureRequestsData.length === 0) {
        setHasMoreFeatureRequests(false);
      } else {
        setFeatureRequests((prevRequests) => [
          ...prevRequests,
          ...featureRequestsData,
        ]);
      }
    } catch (e) {
      toast.error('Failed to fetch feature requests');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSearch(searchText) {
    setSearch(searchText);
    setFeatureRequests([]);
    setPage(1);
    setHasMoreFeatureRequests(true);
    await fetchFeatureRequests(1, searchText);
  }

  async function fetchCurrentUserFeatureRequestVotes() {
    if (await isAuthenticated()) {
      const featureRequestVotes = await listCurrentUserFeatureRequestVotes(
        orgId,
        projectId,
      );
      let featureRequestVotesMap = {};
      featureRequestVotes.forEach((featureRequestVote) => {
        featureRequestVotesMap[featureRequestVote.featureRequest.id] =
          featureRequestVote.vote;
      });
      setFeatureRequestVotesMap(featureRequestVotesMap);
    }
  }

  useEffect(() => {
    document.title = 'Floumy | Feature Requests';
    fetchFeatureRequests(1);
    fetchCurrentUserFeatureRequestVotes();
  }, []);

  async function loadNextPage() {
    await fetchFeatureRequests(page + 1, search);
    setPage(page + 1);
  }

  function getDetailPage(context, orgId, projectId, featureRequestId) {
    if (context === 'admin') {
      return `/admin/orgs/${orgId}/projects/${projectId}/feature-requests/edit/${featureRequestId}/`;
    }

    return `/public/orgs/${orgId}/projects/${projectId}/feature-requests/${featureRequestId}/`;
  }

  function upVote(featureRequest) {
    return async () => {
      if (featureRequestVotesMap[featureRequest.id] === 1) {
        return;
      }
      await upvoteFeatureRequest(orgId, projectId, featureRequest.id);
      featureRequestVotesMap[featureRequest.id] = 1;
      setFeatureRequestVotesMap({ ...featureRequestVotesMap });
      featureRequests.forEach((fr) => {
        if (fr.id === featureRequest.id) {
          fr.votesCount++;
        }
      });
      setFeatureRequests([...featureRequests]);
      toast.success('You voted up the feature request');
    };
  }

  function downVote(featureRequest) {
    return async () => {
      if (featureRequestVotesMap[featureRequest.id] === -1) {
        return;
      }
      await downvoteFeatureRequest(orgId, projectId, featureRequest.id);
      featureRequestVotesMap[featureRequest.id] = -1;
      setFeatureRequestVotesMap({ ...featureRequestVotesMap });
      featureRequests.forEach((fr) => {
        if (fr.id === featureRequest.id) {
          fr.votesCount--;
        }
      });
      setFeatureRequests([...featureRequests]);
      toast.success('You voted down the feature request');
    };
  }

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader
        headerButtons={[
          {
            name: 'New Request',
            shortcut: 'r',
            id: 'new-feature-request',
            action: () => {
              navigate(
                `/${context}/orgs/${orgId}/projects/${projectId}/feature-requests/new`,
              );
            },
          },
        ]}
      />
      <Container className="mt--6" fluid>
        <Row>
          <Col>
            <Card className="mb-5">
              <CardHeader className="rounded-lg">
                <CardTitle tag="h2">Feature Requests</CardTitle>
              </CardHeader>
              <CardHeader className="py-0">
                <FormGroup className="mb-0">
                  <InputGroup className="input-group-lg input-group-flush">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <span className="fas fa-search" />
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder={'Search by title or description'}
                      type="search"
                      value={searchText}
                      onChange={doSearch}
                    />
                  </InputGroup>
                </FormGroup>
              </CardHeader>
              <InfiniteScroll
                next={loadNextPage}
                hasMore={hasMoreFeatureRequests}
                loader={<></>}
                dataLength={featureRequests.length}
                key={search}
              >
                {(!isLoading || featureRequests?.length > 0) && (
                  <div className="table-responsive border-bottom">
                    <table
                      className="table align-items-center no-select"
                      style={{ minWidth: '700px' }}
                    >
                      <thead className="thead-light">
                        <tr>
                          <th scope="col" width="10%">
                            Votes
                          </th>
                          <th scope="col" width="55%">
                            Feature
                          </th>
                          <th scope="col" width="10%">
                            Est.
                          </th>
                          <th scope="col" width="25%">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="list">
                        {featureRequests.length === 0 && (
                          <tr>
                            <td colSpan={4} className="text-center">
                              No feature requests found.
                            </td>
                          </tr>
                        )}
                        {featureRequests &&
                          featureRequests.map((featureRequest) => (
                            <tr key={featureRequest.id}>
                              <td>
                                <div
                                  className="vote badge badge-lg badge-secondary p-2 text-dark"
                                  style={{
                                    fontSize: 'small',
                                    border: '1px solid #cecece',
                                  }}
                                >
                                  <i
                                    className="fa fa-arrow-up"
                                    style={{
                                      cursor: 'pointer',
                                      color:
                                        featureRequestVotesMap[
                                          featureRequest.id
                                        ] === 1
                                          ? '#81b8fc'
                                          : '#cecece',
                                    }}
                                    role="button"
                                    tabIndex="0"
                                    aria-pressed="false"
                                    aria-expanded="false"
                                    onClick={upVote(featureRequest)}
                                  />
                                  <span className="px-3">
                                    {featureRequest.votesCount}
                                  </span>
                                  <i
                                    className="fa fa-arrow-down"
                                    style={{
                                      cursor: 'pointer',
                                      color:
                                        featureRequestVotesMap[
                                          featureRequest.id
                                        ] === -1
                                          ? '#81b8fc'
                                          : '#cecece',
                                    }}
                                    role="button"
                                    tabIndex="0"
                                    aria-pressed="false"
                                    aria-expanded="false"
                                    onClick={downVote(featureRequest)}
                                  />
                                </div>
                              </td>
                              <td
                                className="title-cell"
                                style={{ maxWidth: '300px' }}
                              >
                                <Link
                                  to={getDetailPage(
                                    context,
                                    orgId,
                                    projectId,
                                    featureRequest.id,
                                  )}
                                >
                                  {featureRequest.title}
                                </Link>
                              </td>
                              <td>
                                {featureRequest.estimation &&
                                featureRequest.estimation > 0
                                  ? featureRequest.estimation
                                  : '-'}
                              </td>
                              <td>
                                <Badge color="" className="badge-dot mr-4">
                                  <i
                                    className={initiativeStatusColorClassName(
                                      featureRequest.status,
                                    )}
                                  />
                                  <span className="status">
                                    {formatHyphenatedString(
                                      featureRequest.status,
                                    )}
                                  </span>
                                </Badge>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {isLoading && <LoadingSpinnerBox />}
              </InfiniteScroll>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}
