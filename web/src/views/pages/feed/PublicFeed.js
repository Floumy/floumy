import Feed from "./Feed";
import { fetchPublicFeedItems } from "../../../services/feed/feed.service";
import { useParams } from "react-router-dom";

export default function PublicFeed() {
  const { orgId, productId } = useParams();

  function getLinkUrl(item) {
    if (item.entity === "okr") {
      return `/public/orgs/${orgId}/projects/${productId}/okrs/detail/${item.entityId}`;
    }

    if (item.entity === "workItem") {
      return `/public/orgs/${orgId}/projects/${productId}/work-item/detail/${item.entityId}`;
    }

    if (item.entity === "keyResult") {

      if (item.action === "updated") {
        return `/public/orgs/${orgId}/projects/${productId}/objectives/${item.content.current.objective.id}/kr/detail/${item.entityId}`;
      }

      return `/public/orgs/${orgId}/projects/${productId}/objectives/${item.content.objective.id}/kr/detail/${item.entityId}`;
    }

    if (item.entity === "feature") {
      return `/public/orgs/${orgId}/projects/${productId}/roadmap/features/detail/${item.entityId}`;
    }
  }

  return (
    <>
      <Feed listFeedItems={fetchPublicFeedItems}
            getLinkUrl={getLinkUrl}
            showPageExplanation={false}
            showPostFeedItem={false} />
    </>
  );
}
