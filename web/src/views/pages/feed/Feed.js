import { Button, Card, CardBody, Container, Input } from "reactstrap";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";
import React, { useEffect, useState } from "react";
import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import SimpleHeader from "../../../components/Headers/SimpleHeader";
import InfiniteScroll from "react-infinite-scroll-component";
import { formatDateWithTime } from "../../../services/utils/utils";
import { Link, useParams } from "react-router-dom";
import {
  addTextFeedItem,
  getFeatureTitle,
  getFeatureUpdates,
  getKeyResultUpdates,
  getOkrTitle,
  getOkrUpdates,
  getTitle,
  getWorkItemUpdates
} from "./feed.service";
import { toast } from "react-toastify";
import AutoResizeTextArea from "../../../components/AutoResizeTextArea/AutoResizeTextArea";

export default function Feed({ listFeedItems, getLinkUrl, showPageExplanation = true, showPostFeedItem = true }) {
  const { orgId, projectId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [feedItems, setFeedItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMoreFeedItems, setHasMoreFeedItems] = useState(true);
  const [postText, setPostText] = useState("");

  useEffect(() => {
    setIsLoading(true);
    listFeedItems(orgId, projectId, page).then((response) => {
      setFeedItems([...feedItems, ...response]);
      setIsLoading(false);
    }).catch((error) => {
      console.error(error);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const loadNextPage = () => {
    setIsLoading(true);
    const nextPage = page + 1;
    setPage(nextPage);
    listFeedItems(orgId, projectId, nextPage)
      .then((response) => {
        if (response.length === 0) {
          setHasMoreFeedItems(false);
        }
        setFeedItems([...feedItems, ...response]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  function getItemTitle(item) {
    if (item.entity === "workItem") {
      return getTitle(item);
    }

    if (item.entity === "okr") {
      return getOkrTitle(item);
    }

    if (item.entity === "keyResult") {
      return getTitle(item);
    }

    if (item.entity === "feature") {
      return getFeatureTitle(item);
    }

    return "";
  }

  function getFeedItemIcon(item) {
    switch (item.action) {
      case "created":
        return (
          <span className="timeline-step badge-success">
          <i className="fa fa-plus" />
        </span>
        );
      case "updated":
        return (
          <span className="timeline-step badge-info">
          <i className="fa fa-edit" />
        </span>
        );
      case "deleted":
        return (
          <span className="timeline-step badge-danger">
          <i className="fa fa-trash" />
        </span>
        );
      default:
        return null;
    }
  }

  function getItemUpdates(item) {
    if (item.entity === "workItem") {
      return getWorkItemUpdates(item);
    }
    if (item.entity === "okr") {
      return getOkrUpdates(item);
    }

    if (item.entity === "keyResult") {
      return getKeyResultUpdates(item);
    }

    if (item.entity === "feature") {
      return getFeatureUpdates(item);
    }

    return [];
  }

  async function postFeedItem(postText) {
    try {
      const feedItem = await addTextFeedItem(orgId, projectId, postText);
      setFeedItems([feedItem, ...feedItems]);
      setPostText("");
    } catch (e) {
      toast.error("The feed item could not be posted");
    }
  }

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader />
      <Container className="mt--6" fluid id="Feed">
        <Card>
          <CardBody>
            {!isLoading && feedItems?.length === 0 && showPageExplanation &&
              <div className="p-4">
                <div className="mx-auto font-italic" style={{ "maxWidth": "600px" }}><h3>Feed</h3><p>
                  This is the feed page. Here you can see the latest updates on everything that is happening in the
                  system. You can see the latest changes on work items, initiatives and sprints. Go ahead and create,
                  update or delete some items to see them
                  in the feed.
                </p>
                </div>
              </div>
            }

            {!isLoading && feedItems?.length === 0 && !showPageExplanation &&
              <h3 className="text-center text-lg">There are no updates in the feed</h3>
            }

            <div className="mx-auto" style={{ maxWidth: "600px" }}>
              {showPostFeedItem && feedItems?.length > 0 &&
                <div className="py-4 border-bottom border-gray-200">
                  <Input type="textarea" placeholder="What's new?" value={postText}
                         onChange={(e) => setPostText(e.target.value)}
                         maxLength={500}
                         style={{ height: "100px" }} />
                  <span className="text-muted text-sm">
                  <small>{postText.length} / 500 characters</small>
                </span>
                  <br />
                  <Button type="submit"
                          className="btn btn-primary bg-primary text-white my-2 shadow-none shadow-none--hover"
                          onClick={async () => {
                            await postFeedItem(postText);
                            setPostText("");
                          }}>
                    Post Update
                  </Button>
                </div>}
              {feedItems?.length > 0 && <div
                className="timeline timeline-one-side my-5"
                data-timeline-axis-style="dashed"
                data-timeline-content="axis"
              >
                <InfiniteScroll next={loadNextPage}
                                hasMore={hasMoreFeedItems}
                                loader={<></>}
                                dataLength={feedItems.length}>
                  {feedItems.map((item) => (
                    <div className="timeline-block" key={item.id}>
                      {getFeedItemIcon(item)}
                      <div className="timeline-content">
                        <small className="text-muted font-weight-bold">
                          {formatDateWithTime(item.createdAt)}
                        </small>
                        <h3 className="mt-3 mb-0 italic">
                          {item.action !== "deleted" &&
                            <Link to={getLinkUrl(item)}>{getItemTitle(item)}</Link>}
                          {item.action === "deleted" && getItemTitle(item)}
                        </h3>
                        {item.action === "created" && item.entity === "text" &&
                          <AutoResizeTextArea value={item.content.text} />}
                        {item.action === "updated" && <p className="mt-1 mb-0 text-sm">
                          {getItemUpdates(item).map((update, index) => (
                            <span key={item.id + index}>{update}<br /></span>
                          ))}
                        </p>}
                      </div>
                    </div>
                  ))}
                </InfiniteScroll>
              </div>}
            </div>
          </CardBody>
          {isLoading && <LoadingSpinnerBox className="m-0 p-0" />}
        </Card>
      </Container>
    </>
  );
}
