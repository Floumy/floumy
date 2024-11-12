import Feed from "./Feed";
import { fetchPublicFeedItems } from "../../../services/feed/feed.service";
import { useParams } from "react-router-dom";

export default function PublicFeed() {
  const { orgId } = useParams();

  function getLinkUrl(item) {
    if (item.entity === "okr") {
      return `/public/org/${orgId}/okrs/detail/${item.entityId}`;
    }

    if (item.entity === "workItem") {
      return `/public/org/${orgId}/work-item/detail/${item.entityId}`;
    }

    if (item.entity === "keyResult") {

      if (item.action === "updated") {
        return `/public/org/${orgId}/objectives/${item.content.current.objective.id}/kr/detail/${item.entityId}`;
      }

      return `/public/org/${orgId}/objectives/${item.content.objective.id}/kr/detail/${item.entityId}`;
    }

    if (item.entity === "feature") {
      return `/public/org/${orgId}/roadmap/features/detail/${item.entityId}`;
    }
  }

  return (
    <>
      <Feed listFeedItems={async (page) => await fetchPublicFeedItems(orgId, page)}
            getLinkUrl={getLinkUrl}
            showPageExplanation={false}
            showPostFeedItem={false} />
    </>
  );
}
