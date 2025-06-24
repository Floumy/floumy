import {
  Card,
  CardHeader,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from 'reactstrap';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import WorkItemsList from './WorkItemsList';
import React, { useEffect, useState } from 'react';
import useDebounceSearch from '../../../hooks/useDebounceSearch';
import { filterWorkItems } from '../../../services/utils/workItemUtils';
import WorkItemsListCardHeader from './WorkItemsListCardHeader';

function WorkItemsListCard({
  id = 'work-items-list-card',
  title,
  workItems,
  isLoading,
  onAddWorkItem,
  onChangeSprint,
  onChangeStatus,
  onChangePriority,
  onChangeAssignee,
  onDelete,
  onSearch,
  enableContextMenu = true,
  showFilters = true,
  showAssignedTo = true,
  showInitiative = true,
  searchPlaceholder = 'Search by title',
}) {
  const [filterByPriority, setFilterByPriority] = useState('all');
  const [filterByType, setFilterByType] = useState('all');
  const [filterByStatus, setFilterByStatus] = useState('all');
  const [filteredWorkItems, setFilteredWorkItems] = useState([]);
  const [searchText, handleSearch] = useDebounceSearch(onSearch);

  useEffect(() => {
    setFilteredWorkItems(
      filterWorkItems(
        workItems,
        filterByPriority,
        filterByType,
        filterByStatus,
      ).filter((workItem) => {
        if (onSearch) {
          return true;
        }

        return workItem.title.toLowerCase().includes(searchText.toLowerCase());
      }),
    );
  }, [
    onSearch,
    filterByType,
    filterByPriority,
    filterByStatus,
    workItems,
    searchText,
  ]);

  function handleDelete(deletedWorkItems) {
    const deletedIds = deletedWorkItems.map((workItem) => workItem.id);
    const remainingWorkItems = filteredWorkItems.filter(
      (workItem) => !deletedIds.includes(workItem.id),
    );
    setFilteredWorkItems(remainingWorkItems);
    if (onDelete) {
      onDelete(deletedWorkItems);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <WorkItemsListCardHeader
            title={title}
            showFilters={showFilters}
            filterByPriority={filterByPriority}
            setFilterByPriority={setFilterByPriority}
            filterByType={filterByType}
            setFilterByType={setFilterByType}
            filterByStatus={filterByStatus}
            setFilterByStatus={setFilterByStatus}
          />
        </CardHeader>
        <CardHeader className="py-0">
          <FormGroup className="mb-0">
            <InputGroup className="input-group-lg input-group-flush">
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <span className="fas fa-search" />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                placeholder={searchPlaceholder}
                type="search"
                value={searchText}
                onChange={handleSearch}
              />
            </InputGroup>
          </FormGroup>
        </CardHeader>
        {(!isLoading || filteredWorkItems.length > 0) && (
          <WorkItemsList
            id={id}
            showAssignedTo={showAssignedTo}
            showInitiative={showInitiative}
            enableContextMenu={enableContextMenu}
            workItems={filteredWorkItems}
            onAddNewWorkItem={onAddWorkItem}
            onChangeSprint={onChangeSprint}
            onChangeStatus={onChangeStatus}
            onChangePriority={onChangePriority}
            onChangeAssignee={onChangeAssignee}
            onDelete={handleDelete}
          />
        )}
        {isLoading && <LoadingSpinnerBox />}
      </Card>
    </>
  );
}

export default WorkItemsListCard;
