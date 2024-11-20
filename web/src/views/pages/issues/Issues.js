import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import SimpleHeader from "../../../components/Headers/SimpleHeader";
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
  Row
} from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { listIssues, searchIssues } from "../../../services/issues/issues.service";
import InfiniteScroll from "react-infinite-scroll-component";
import { formatHyphenatedString, priorityColor } from "../../../services/utils/utils";
import { toast } from "react-toastify";
import IssueStats from "./IssueStats";

export default function Issues({ isPublic = false }) {
  const { orgId, productId } = useParams();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const navigate = useNavigate();
  const context = window.location.pathname.includes("public") ? "public" : "admin";
  const [issues, setIssues] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [searchText, setSearchText] = useState("");
  const typingTimeoutRef = useRef(null);

  function debounce(func, delay) {
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(func, delay);
  }

  const fetchIssues = useCallback(async (pageNum, isInitial = false, searchTerm = "") => {
    if (isInitial) {
      setIsInitialLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      let newIssues;
      if (searchTerm) {
        newIssues = await searchIssues(orgId, productId, searchTerm, pageNum, 50);
      } else {
        newIssues = await listIssues(orgId, productId, pageNum, 50);
      }
      setIssues(prevIssues => isInitial ? newIssues : [...prevIssues, ...newIssues]);
      setHasMore(newIssues.length > 0);
    } catch (e) {
      console.error(e.message);
      toast.error("Failed to fetch issues");
    } finally {
      if (isInitial) {
        setIsInitialLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, [orgId]);

  function doSearch(event) {
    const searchText = event.target.value;
    setSearchText(searchText);
    debounce(async () => await handleSearch(searchText), 500);
  }

  async function handleSearch(searchText) {
    setSearch(searchText);
    setIssues([]);
    setPage(1);
    setHasMore(true);
    await fetchIssues(1, true, searchText);
  }

  useEffect(() => {
    document.title = "Floumy | Issues";
    fetchIssues(1, true);
  }, [fetchIssues]);

  const loadNextPage = () => {
    if (!isLoadingMore && hasMore) {
      setPage(prevPage => prevPage + 1);
      fetchIssues(page + 1, false, search);
    }
  };

  function navigateToDetailPage(issue) {
    if (isPublic) {
      navigate(`/${context}/orgs/${orgId}/projects/${productId}/issues/${issue.id}`);
      return;
    }

    navigate(`/${context}/orgs/${orgId}/projects/${productId}/issues/edit/${issue.id}`);
  }

  return (
    <>
      {isInitialLoading && <InfiniteLoadingBar />}
      <SimpleHeader
        headerButtons={[
          {
            name: "New Issue",
            shortcut: "n",
            id: "new-issue",
            action: () => {
              navigate(`/${context}/orgs/${orgId}/projects/${productId}/issues/new`);
            }
          }
        ]}
      />
      <Container className="mt--6" fluid>
        <Row className="mb-3">
          <Col>
            <IssueStats issues={issues} />
          </Col>
        </Row>
        <Row>
          <Col>
            <Card className="mb-5">
              <CardHeader className="rounded-lg">
                <CardTitle tag="h2">Issues</CardTitle>
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
                      placeholder="Search by title or description"
                      type="search"
                      value={searchText}
                      onChange={doSearch}
                    />
                  </InputGroup>
                </FormGroup>
              </CardHeader>
              {isInitialLoading ? (
                <LoadingSpinnerBox />
              ) : (
                <InfiniteScroll
                  key={search}
                  next={loadNextPage}
                  hasMore={hasMore}
                  loader={isLoadingMore && <LoadingSpinnerBox />}
                  dataLength={issues.length}
                >
                  <div className="table-responsive border-bottom">
                    <table className="table align-items-center no-select" style={{ minWidth: "700px" }}>
                      <thead className="thead-light">
                      <tr>
                        <th scope="col" width="60%">Title</th>
                        <th scope="col" width="20%">Status</th>
                        <th scope="col" width="20%">Priority</th>
                      </tr>
                      </thead>
                      <tbody className="list">
                      {issues.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="text-center">No issues found.</td>
                        </tr>
                      ) : (
                        issues.map(issue => (
                          <tr key={issue.id}
                              onClick={() => navigateToDetailPage(issue)}
                              style={{ cursor: "pointer" }}>
                            <td>{issue.title}</td>
                            <td>
                              <Badge color="" className="badge-dot mr-4">
                                <i className={`bg-${getStatusColor(issue.status)}`} />
                                <span className="status">{formatHyphenatedString(issue.status)}</span>
                              </Badge>
                            </td>
                            <td>
                              <Badge color={priorityColor(issue.priority)} pill={true}>
                                {issue.priority}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                      </tbody>
                    </table>
                  </div>
                </InfiniteScroll>
              )}
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

function getStatusColor(status) {
  switch (status) {
    case "submitted":
    case "acknowledged":
      return "info";
    case "under-review":
    case "in-progress":
      return "primary";
    case "awaiting-customer-response":
      return "warning";
    case "resolved":
      return "success";
    case "closed":
      return "secondary";
    default:
      return "light";
  }
}