import React, { useEffect, useState } from 'react';
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
  onChangePriority,
  onChangeStatus,
  onChangeAssignedTo,
  onDelete,
  onSearch,
  showFilters = true,
  showAssignedTo = true,
  searchPlaceholder = 'Search by title',
  extraButtonLabel,
  extraButtonId,
  onExtraButtonClick,
}) {
  const [localInitiatives, setLocalInitiatives] = useState(
    sortByPriority(initiatives),
  );

  useEffect(() => {
    setLocalInitiatives(sortByPriority(initiatives));
  }, [initiatives]);

  function updateInitiativesStatus(updatedInitiatives, status) {
    const updatedInitiativesIds = updatedInitiatives.map(
      (initiative) => initiative.id,
    );
    setLocalInitiatives((currentInitiatives) =>
      sortByPriority(
        currentInitiatives.map((initiative) =>
          updatedInitiativesIds.includes(initiative.id)
            ? { ...initiative, status }
            : initiative,
        ),
      ),
    );
    if (onChangeStatus) {
      onChangeStatus(updatedInitiatives, status);
    }
  }

  function handleBacklogInitiativeChangePriority(updatedInitiatives, priority) {
    const updatedInitiativesIds = updatedInitiatives.map(
      (initiative) => initiative.id,
    );
    setLocalInitiatives((currentInitiatives) =>
      sortByPriority(
        currentInitiatives.map((initiative) =>
          updatedInitiativesIds.includes(initiative.id)
            ? { ...initiative, priority }
            : initiative,
        ),
      ),
    );
    if (onChangePriority) {
      onChangePriority(updatedInitiatives, priority);
    }
  }

  async function handleInitiativesAssignedTo(updatedInitiatives, assignedTo) {
    let resolvedAssignedTo = assignedTo;

    if (onChangeAssignedTo) {
      const callbackResult = await onChangeAssignedTo(
        updatedInitiatives,
        assignedTo,
      );
      if (callbackResult !== undefined) {
        resolvedAssignedTo = callbackResult;
      }
    }

    const updatedInitiativesIds = updatedInitiatives.map(
      (initiative) => initiative.id,
    );
    setLocalInitiatives((currentInitiatives) =>
      sortByPriority(
        currentInitiatives.map((initiative) =>
          updatedInitiativesIds.includes(initiative.id)
            ? { ...initiative, assignedTo: resolvedAssignedTo }
            : initiative,
        ),
      ),
    );
  }

  function handleDelete(deletedInitiatives) {
    const deletedIds = deletedInitiatives.map((initiative) => initiative.id);
    setLocalInitiatives((currentInitiatives) =>
      currentInitiatives.filter(
        (initiative) => !deletedIds.includes(initiative.id),
      ),
    );
    if (onDelete) {
      onDelete(deletedInitiatives);
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
        onChangeAssignedTo={handleInitiativesAssignedTo}
        onChangeStatus={updateInitiativesStatus}
        onChangePriority={handleBacklogInitiativeChangePriority}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <BaseInitiativeListCard
      title={title}
      initiatives={localInitiatives}
      isLoading={isLoading}
      showFilters={showFilters}
      onSearch={onSearch}
      searchPlaceholder={searchPlaceholder}
      renderInitiativeList={renderInitiativeList}
      extraButtonLabel={extraButtonLabel}
      extraButtonId={extraButtonId}
      onExtraButtonClick={onExtraButtonClick}
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
  onChangePriority: PropTypes.func,
  onChangeStatus: PropTypes.func,
  onChangeAssignedTo: PropTypes.func,
  onDelete: PropTypes.func,
  enableContextMenu: PropTypes.bool,
  extraButtonLabel: PropTypes.string,
  extraButtonId: PropTypes.string,
  onExtraButtonClick: PropTypes.func,
};
