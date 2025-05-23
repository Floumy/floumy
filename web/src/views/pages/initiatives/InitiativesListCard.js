import React, { useState } from 'react';
import InitiativesList from './InitiativesList';
import { sortByPriority } from '../../../services/utils/utils';
import PropTypes from 'prop-types';
import BaseInitiativeListCard from './BaseInitiativeListCard';

function InitiativesListCard({
                               title,
                               initiatives,
                               isLoading,
                               enableContextMenu,
                               onAddInitiative,
                               onChangeMilestone,
                               onChangeStatus,
                               onChangeAssignedTo,
                               onSearch,
                               showFilters = true,
                               showAssignedTo = true,
                               searchPlaceholder = 'Search by title',
                             }) {
  const [filteredInitiatives, setFilteredInitiatives] = useState([]);

  function updateInitiativesStatus(updatedInitiatives, status) {
    const updatedInitiativesIds = updatedInitiatives.map(initiative => initiative.id);
    const updatedInitiativesStatus = filteredInitiatives.map(initiative => {
      if (updatedInitiativesIds.includes(initiative.id)) {
        initiative.status = status;
      }
      return initiative;
    });
    setFilteredInitiatives(sortByPriority(updatedInitiativesStatus));
    if (onChangeStatus) {
      onChangeStatus(updatedInitiatives, status);
    }
  }

  function handleBacklogInitiativeChangePriority(initiatives, priority) {
    const updatedInitiatives = initiatives.map(initiative => {
      if (initiative.priority !== priority) {
        initiative.priority = priority;
      }
      return initiative;
    });
    setFilteredInitiatives(sortByPriority(updatedInitiatives));
    if (onChangeStatus) {
      onChangeStatus(updatedInitiatives, priority);
    }
  }

  function renderInitiativeList(filteredInitiatives) {
    return (
      <InitiativesList
        id={'initiatives-list-card'}
        initiatives={filteredInitiatives}
        onAddInitiative={onAddInitiative}
        showAssignedTo={showAssignedTo}
        enableContextMenu={enableContextMenu}
        onChangeMilestone={onChangeMilestone}
        onChangeAssignedTo={onChangeAssignedTo}
        onChangeStatus={updateInitiativesStatus}
        onChangePriority={handleBacklogInitiativeChangePriority}
      />
    );
  }

  return (
    <BaseInitiativeListCard
      title={title}
      initiatives={initiatives}
      isLoading={isLoading}
      showFilters={showFilters}
      onSearch={onSearch}
      searchPlaceholder={searchPlaceholder}
      renderInitiativeList={renderInitiativeList}
    />
  );
}

export default InitiativesListCard;

InitiativesListCard.propTypes = {
  title: PropTypes.string.isRequired,
  initiatives: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  showFilters: PropTypes.bool,
  showAssignedTo: PropTypes.bool,
  searchPlaceholder: PropTypes.string,
  onSearch: PropTypes.func,
  onAddInitiative: PropTypes.func,
  onChangeMilestone: PropTypes.func,
  onChangeStatus: PropTypes.func,
  enableContextMenu: PropTypes.bool,
};