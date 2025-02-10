import Feed from "./Feed";
import { fetchFeedItems } from "../../../services/feed/feed.service";
import { useParams } from "react-router-dom";

export default function PrivateFeed() {
  const { orgId, projectId } = useParams();

  function getLinkUrl(item) {
    if (item.entity === "okr") {
      return `/admin/orgs/${orgId}/projects/${projectId}/okrs/detail/${item.entityId}`;
    }

    if (item.entity === "workItem") {
      return `/admin/orgs/${orgId}/projects/${projectId}/work-item/edit/${item.entityId}`;
    }

    if (item.entity === "keyResult") {

      if (item.action === "updated") {
        return `/admin/orgs/${orgId}/projects/${projectId}/okrs/${item.content.current.objective.id}/kr/detail/${item.entityId}`;
      }

      return `/admin/orgs/${orgId}/projects/${projectId}/okrs/${item.content.objective.id}/kr/detail/${item.entityId}`;
    }

    if (item.entity === "initiative") {
      return `/admin/orgs/${orgId}/projects/${projectId}/roadmap/initiatives/detail/${item.entityId}`;
    }
  }

  return (
    <>
      <Feed listFeedItems={fetchFeedItems}
            getLinkUrl={getLinkUrl} />
    </>
  );
}
