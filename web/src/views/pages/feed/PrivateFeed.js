import Feed from "./Feed";
import { fetchFeedItems } from "../../../services/feed/feed.service";

export default function PrivateFeed() {

  function getLinkUrl(item) {
    if (item.entity === "okr") {
      return `/admin/okrs/detail/${item.entityId}`;
    }

    if (item.entity === "workItem") {
      return `/admin/work-item/edit/${item.entityId}`;
    }

    if (item.entity === "keyResult") {

      if (item.action === "updated") {
        return `/admin/okrs/${item.content.current.objective.id}/kr/detail/${item.entityId}`;
      }

      return `/admin/okrs/${item.content.objective.id}/kr/detail/${item.entityId}`;
    }

    if (item.entity === "feature") {
      return `/admin/roadmap/features/detail/${item.entityId}`;
    }
  }

  return (
    <>
      <Feed listFeedItems={fetchFeedItems}
            getLinkUrl={getLinkUrl} />
    </>
  );
}
