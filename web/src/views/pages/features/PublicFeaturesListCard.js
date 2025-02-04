import React from "react";
import PublicFeaturesList from "./PublicFeaturesList";
import BaseFeatureListCard from "./BaseFeatureListCard";

function PublicFeaturesListCard({
                                  orgId,
                                  title,
                                  features,
                                  isLoading,
                                  showFilters = true
                                }) {
  function renderFeatureList(filteredFeatures) {
    return (
      <PublicFeaturesList
        orgId={orgId}
        id={"initiatives-list-card"}
        features={filteredFeatures}
      />
    );
  }

  return (
    <BaseFeatureListCard
      title={title}
      features={features}
      isLoading={isLoading}
      showFilters={showFilters}
      renderFeatureList={renderFeatureList}
    />
  );
}

export default PublicFeaturesListCard;
