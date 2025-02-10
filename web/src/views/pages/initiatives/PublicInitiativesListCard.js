import React from "react";
import PublicInitiativesList from "./PublicInitiativesList";
import BaseInitiativeListCard from "./BaseInitiativeListCard";

function PublicInitiativesListCard({
                                  orgId,
                                  title,
                                  initiatives,
                                  isLoading,
                                  showFilters = true
                                }) {
  function renderInitiativeList(filteredInitiatives) {
    return (
      <PublicInitiativesList
        orgId={orgId}
        id={"initiatives-list-card"}
        initiatives={filteredInitiatives}
      />
    );
  }

  return (
    <BaseInitiativeListCard
      title={title}
      initiatives={initiatives}
      isLoading={isLoading}
      showFilters={showFilters}
      renderInitiativeList={renderInitiativeList}
    />
  );
}

export default PublicInitiativesListCard;
