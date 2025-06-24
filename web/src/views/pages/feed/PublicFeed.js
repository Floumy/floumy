import Feed from './Feed';
import { fetchPublicFeedItems } from '../../../services/feed/feed.service';
import { useParams } from 'react-router-dom';

export default function PublicFeed() {
  const { orgId, projectId } = useParams();

  function getLinkUrl(item) {
    if (item.entity === 'okr') {
      return `/public/orgs/${orgId}/projects/${projectId}/okrs/detail/${item.entityId}`;
    }

    if (item.entity === 'workItem') {
      return `/public/orgs/${orgId}/projects/${projectId}/work-item/detail/${item.entityId}`;
    }

    if (item.entity === 'keyResult') {
      return `/public/orgs/${orgId}/projects/${projectId}/kr/detail/${item.entityId}`;
    }

    if (item.entity === 'initiative') {
      return `/public/orgs/${orgId}/projects/${projectId}/roadmap/initiatives/detail/${item.entityId}`;
    }
  }

  return (
    <>
      <Feed
        listFeedItems={fetchPublicFeedItems}
        getLinkUrl={getLinkUrl}
        showPageExplanation={false}
        showPostFeedItem={false}
      />
    </>
  );
}
