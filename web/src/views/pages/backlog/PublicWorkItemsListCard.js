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
import React, { useEffect, useState } from 'react';
import PublicWorkItemsList from './PublicWorkItemsList';
import { filterWorkItems } from '../../../services/utils/workItemUtils';
import WorkItemsListCardHeader from './WorkItemsListCardHeader';

function PublicWorkItemsListCard({
  id = 'work-items-list-card',
  orgId,
  title,
  workItems,
  isLoading,
  showFilters = true,
  showInitiative = true,
  searchPlaceholder = 'Search by title',
}) {
  const [filterByPriority, setFilterByPriority] = useState('all');
  const [filterByType, setFilterByType] = useState('all');
  const [filterByStatus, setFilterByStatus] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [filteredWorkItems, setFilteredWorkItems] = useState([]);

  useEffect(() => {
    setFilteredWorkItems(
      filterWorkItems(
        workItems,
        filterByPriority,
        filterByType,
        filterByStatus,
      ).filter((workItem) => {
        if (searchText === '') {
          return true;
        }

        return workItem.title.toLowerCase().includes(searchText.toLowerCase());
      }),
    );
  }, [filterByType, filterByPriority, filterByStatus, workItems, searchText]);

  function searchWorkItems(event) {
    const searchText = event.target.value;
    setSearchText(searchText);
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
                onChange={searchWorkItems}
              />
            </InputGroup>
          </FormGroup>
        </CardHeader>
        {(!isLoading || filteredWorkItems.length > 0) && (
          <PublicWorkItemsList
            id={id}
            showInitiative={showInitiative}
            workItems={filteredWorkItems}
            orgId={orgId}
          />
        )}
        {isLoading && <LoadingSpinnerBox />}
      </Card>
    </>
  );
}

export default PublicWorkItemsListCard;
