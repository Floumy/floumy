import React, { useState } from "react";
import FeaturesList from "./FeaturesList";
import { sortByPriority } from "../../../services/utils/utils";
import PropTypes from "prop-types";
import BaseFeatureListCard from "./BaseFeatureListCard";

function FeaturesListCard({
                            title,
                            features,
                            isLoading,
                            enableContextMenu,
                            onAddFeature,
                            onChangeMilestone,
                            onChangeStatus,
                            onSearch,
                            showFilters = true,
                            showAssignedTo = true,
                            searchPlaceholder = "Search by title"
                          }) {
  const [filteredFeatures, setFilteredFeatures] = useState([]);

  function updateFeaturesStatus(updatedFeatures, status) {
    const updatedFeaturesIds = updatedFeatures.map(feature => feature.id);
    const updatedFeaturesStatus = filteredFeatures.map(feature => {
      if (updatedFeaturesIds.includes(feature.id)) {
        feature.status = status;
      }
      return feature;
    });
    setFilteredFeatures(sortByPriority(updatedFeaturesStatus));
    if (onChangeStatus) {
      onChangeStatus(updatedFeatures, status);
    }
  }

  function handleBacklogFeatureChangePriority(featureId, newPriority) {
    const feature = filteredFeatures.find(feature => feature.id === featureId);
    feature.priority = newPriority;
    setFilteredFeatures(sortByPriority(filteredFeatures));
  }

  function renderFeatureList(filteredFeatures) {
    return (
      <FeaturesList
        id={"initiatives-list-card"}
        features={filteredFeatures}
        onAddFeature={onAddFeature}
        showAssignedTo={showAssignedTo}
        enableContextMenu={enableContextMenu}
        onChangeMilestone={onChangeMilestone}
        onChangeStatus={updateFeaturesStatus}
        onChangePriority={handleBacklogFeatureChangePriority}
      />
    );
  }

  return (
    <BaseFeatureListCard
      title={title}
      features={features}
      isLoading={isLoading}
      showFilters={showFilters}
      onSearch={onSearch}
      searchPlaceholder={searchPlaceholder}
      renderFeatureList={renderFeatureList}
    />
  );
}

export default FeaturesListCard;

FeaturesListCard.propTypes = {
  title: PropTypes.string.isRequired,
  features: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  showFilters: PropTypes.bool,
  showAssignedTo: PropTypes.bool,
  searchPlaceholder: PropTypes.string,
  onSearch: PropTypes.func,
  onAddFeature: PropTypes.func,
  onChangeMilestone: PropTypes.func,
  onChangeStatus: PropTypes.func,
  enableContextMenu: PropTypes.bool
};