import { Card, CardBody, Container } from 'reactstrap';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import React, { useEffect, useState } from 'react';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import InfiniteScroll from 'react-infinite-scroll-component';
import { formatDateWithTime } from '../../../services/utils/utils';
import { Link, useParams } from 'react-router-dom';
import {
  getInitiativeTitle,
  getInitiativeUpdates,
  getKeyResultUpdates,
  getOkrTitle,
  getOkrUpdates,
  getTitle,
  getWorkItemUpdates,
} from './feed.service';
import AutoResizeTextArea from '../../../components/AutoResizeTextArea/AutoResizeTextArea';

export default function Feed({
  listFeedItems,
  getLinkUrl,
  showPageExplanation = true,
}) {
  const { orgId, projectId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [feedItems, setFeedItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMoreFeedItems, setHasMoreFeedItems] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    listFeedItems(orgId, projectId, page)
      .then((response) => {
        setFeedItems([...feedItems, ...response]);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
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
    if (item.entity === 'workItem') {
      return getTitle(item);
    }

    if (item.entity === 'okr') {
      return getOkrTitle(item);
    }

    if (item.entity === 'keyResult') {
      return getTitle(item);
    }

    if (item.entity === 'initiative') {
      return getInitiativeTitle(item);
    }

    return '';
  }

  function getFeedItemIcon(item) {
    switch (item.action) {
      case 'created':
        return (
          <span className="timeline-step badge-success">
            <i className="fa fa-plus" />
          </span>
        );
      case 'updated':
        return (
          <span className="timeline-step badge-info">
            <i className="fa fa-edit" />
          </span>
        );
      case 'deleted':
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
    if (item.entity === 'workItem') {
      return getWorkItemUpdates(item);
    }
    if (item.entity === 'okr') {
      return getOkrUpdates(item);
    }

    if (item.entity === 'keyResult') {
      return getKeyResultUpdates(item);
    }

    if (item.entity === 'initiative') {
      return getInitiativeUpdates(item);
    }

    return [];
  }

  return (
    <>
      {isLoading && <InfiniteLoadingBar />}
      <SimpleHeader />
      <Container className="mt--6" fluid id="Feed">
        <Card>
          <CardBody>
            {!isLoading && feedItems?.length === 0 && showPageExplanation && (
              <div className="p-4">
                <div
                  className="mx-auto font-italic"
                  style={{ maxWidth: '600px' }}
                >
                  <h3>Feed</h3>
                  <p>
                    This is the feed page. Here you can see the latest updates
                    on everything that is happening in the system. You can see
                    the latest changes on work items, initiatives and sprints.
                    Go ahead and create, update or delete some items to see them
                    in the feed.
                  </p>
                </div>
              </div>
            )}

            {!isLoading && feedItems?.length === 0 && !showPageExplanation && (
              <h3 className="text-center text-lg">
                There are no updates in the feed
              </h3>
            )}

            <div className="mx-auto" style={{ maxWidth: '600px' }}>
              {feedItems?.length > 0 && (
                <div
                  className="timeline timeline-one-side my-5"
                  data-timeline-axis-style="dashed"
                  data-timeline-content="axis"
                >
                  <InfiniteScroll
                    next={loadNextPage}
                    hasMore={hasMoreFeedItems}
                    loader={<></>}
                    dataLength={feedItems.length}
                  >
                    {feedItems.map((item) => (
                      <div className="timeline-block" key={item.id}>
                        {getFeedItemIcon(item)}
                        <div className="timeline-content">
                          <small className="text-muted font-weight-bold">
                            {formatDateWithTime(item.createdAt)}
                          </small>
                          <h3 className="mt-3 mb-0 italic">
                            {item.action !== 'deleted' && (
                              <Link to={getLinkUrl(item)}>
                                {getItemTitle(item)}
                              </Link>
                            )}
                            {item.action === 'deleted' && getItemTitle(item)}
                          </h3>
                          {item.action === 'created' &&
                            item.entity === 'text' && (
                              <AutoResizeTextArea value={item.content.text} />
                            )}
                          {item.action === 'updated' && (
                            <p className="mt-1 mb-0 text-sm">
                              {getItemUpdates(item).map((update, index) => (
                                <span key={item.id + index}>
                                  {update}
                                  <br />
                                </span>
                              ))}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </InfiniteScroll>
                </div>
              )}
            </div>
          </CardBody>
          {isLoading && <LoadingSpinnerBox className="m-0 p-0" />}
        </Card>
      </Container>
    </>
  );
}
