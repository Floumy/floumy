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
  formatHyphenatedString,
  initiativeStatusColorClassName,
} from '../../../services/utils/utils';
import {
  downvoteRequest,
  listCurrentUserRequestVotes,
  listPublicRequests,
  listRequests,
  searchPublicRequests,
  searchRequests,
  upvoteRequest,
} from '../../../services/requests/requests.service';
import InfiniteScroll from 'react-infinite-scroll-component';
import { isAuthenticated } from '../../../services/auth/auth.service';
import { toast } from 'react-toastify';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';

export default function Requests({ isPublic = false }) {
  const { orgId, projectId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [hasMoreRequests, setHasMoreRequests] = useState(true);
  const [requestVotesMap, setRequestVotesMap] = useState({});
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

  async function fetchRequests(page = 1, searchTerm = '') {
    setIsLoading(true);
    try {
      let requestsData;
      if (searchTerm) {
        requestsData = isPublic
          ? await searchPublicRequests(orgId, projectId, searchTerm, page, 50)
          : await searchRequests(orgId, projectId, searchTerm, page, 50);
      } else {
        requestsData = isPublic
          ? await listPublicRequests(orgId, projectId, page, 50)
          : await listRequests(orgId, projectId, page, 50);
      }
      if (requestsData.length === 0) {
        setHasMoreRequests(false);
      } else {
        setRequests((prevRequests) => [...prevRequests, ...requestsData]);
      }
    } catch (e) {
      toast.error('Failed to fetch requests');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSearch(searchText) {
    setSearch(searchText);
    setRequests([]);
    setPage(1);
    setHasMoreRequests(true);
    await fetchRequests(1, searchText);
  }

  async function fetchCurrentUserRequestVotes() {
    if (await isAuthenticated()) {
      const requestVotes = await listCurrentUserRequestVotes(orgId, projectId);
      let votesMap = {};
      requestVotes.forEach((requestVote) => {
        votesMap[requestVote.request.id] = requestVote.vote;
      });
      setRequestVotesMap(votesMap);
    }
  }

  useEffect(() => {
    document.title = 'Floumy | Requests';
    fetchRequests(1);
    fetchCurrentUserRequestVotes();
  }, [isPublic]);

  async function loadNextPage() {
    await fetchRequests(page + 1, search);
    setPage(page + 1);
  }

  function getDetailPage(context, orgId, projectId, requestId) {
    if (context === 'admin') {
      return `/admin/orgs/${orgId}/projects/${projectId}/requests/edit/${requestId}/`;
    }

    return `/public/orgs/${orgId}/projects/${projectId}/requests/${requestId}/`;
  }

  function upVote(request) {
    return async () => {
      if (requestVotesMap[request.id] === 1) {
        return;
      }
      await upvoteRequest(orgId, projectId, request.id);
      requestVotesMap[request.id] = 1;
      setRequestVotesMap({ ...requestVotesMap });
      requests.forEach((r) => {
        if (r.id === request.id) {
          r.votesCount++;
        }
      });
      setRequests([...requests]);
      toast.success('You voted up the request');
    };
  }

  function downVote(request) {
    return async () => {
      if (requestVotesMap[request.id] === -1) {
        return;
      }
      await downvoteRequest(orgId, projectId, request.id);
      requestVotesMap[request.id] = -1;
      setRequestVotesMap({ ...requestVotesMap });
      requests.forEach((r) => {
        if (r.id === request.id) {
          r.votesCount--;
        }
      });
      setRequests([...requests]);
      toast.success('You voted down the request');
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
                `/${context}/orgs/${orgId}/projects/${projectId}/requests/new`,
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
                <CardTitle tag="h2">Requests</CardTitle>
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
                hasMore={hasMoreRequests}
                loader={<></>}
                dataLength={requests.length}
                key={search}
              >
                {(!isLoading || requests?.length > 0) && (
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
                            Request
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
                        {requests.length === 0 && (
                          <tr>
                            <td colSpan={4} className="text-center">
                              No requests yet
                            </td>
                          </tr>
                        )}
                        {requests &&
                          requests.map((request) => (
                            <tr key={request.id}>
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
                                        requestVotesMap[request.id] === 1
                                          ? '#81b8fc'
                                          : '#cecece',
                                    }}
                                    role="button"
                                    tabIndex="0"
                                    aria-pressed="false"
                                    aria-expanded="false"
                                    onClick={upVote(request)}
                                  />
                                  <span className="px-3">
                                    {request.votesCount}
                                  </span>
                                  <i
                                    className="fa fa-arrow-down"
                                    style={{
                                      cursor: 'pointer',
                                      color:
                                        requestVotesMap[request.id] === -1
                                          ? '#81b8fc'
                                          : '#cecece',
                                    }}
                                    role="button"
                                    tabIndex="0"
                                    aria-pressed="false"
                                    aria-expanded="false"
                                    onClick={downVote(request)}
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
                                    request.id,
                                  )}
                                >
                                  {request.title}
                                </Link>
                              </td>
                              <td>{request?.estimation}</td>
                              <td>
                                <Badge color="" className="badge-dot mr-4">
                                  <i
                                    className={initiativeStatusColorClassName(
                                      request.status,
                                    )}
                                  />
                                  <span className="status">
                                    {formatHyphenatedString(request.status)}
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
