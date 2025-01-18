import { Card, CardHeader, FormGroup, Input, InputGroup, InputGroupAddon, InputGroupText } from "reactstrap";
import LoadingSpinnerBox from "../components/LoadingSpinnerBox";
import WorkItemsList from "./WorkItemsList";
import React, { useEffect, useState } from "react";
import useDebounceSearch from "../../../hooks/useDebounceSearch";
import { filterWorkItems } from "../../../services/utils/workItemUtils";
import WorkItemsListCardHeader from "./WorkItemsListCardHeader";

function WorkItemsListCard({
                             id = "work-items-list-card",
                             title,
                             workItems,
                             isLoading,
                             onAddWorkItem,
                             onChangeIteration,
                             onChangeStatus,
                             onChangePriority,
                             onChangeAssignee,
                             onSearch,
                             enableContextMenu = true,
                             showFilters = true,
                             showAssignedTo = true,
                             showFeature = true,
                             searchPlaceholder = "Search by title"
                           }) {
  const [filterByPriority, setFilterByPriority] = useState("all");
  const [filterByType, setFilterByType] = useState("all");
  const [filterByStatus, setFilterByStatus] = useState("all");
  const [filteredWorkItems, setFilteredWorkItems] = useState([]);
  const [searchText, handleSearch] = useDebounceSearch(onSearch);

  useEffect(() => {
    setFilteredWorkItems(
      filterWorkItems(workItems, filterByPriority, filterByType, filterByStatus)
        .filter(workItem => {
          if (onSearch) {
            return true;
          }

          return workItem.title.toLowerCase().includes(searchText.toLowerCase());
        })
    );
  }, [onSearch, filterByType, filterByPriority, filterByStatus, workItems, searchText]);


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
        {(!isLoading || filteredWorkItems.length > 0) &&
          <WorkItemsList
            id={id}
            showAssignedTo={showAssignedTo}
            showFeature={showFeature}
            enableContextMenu={enableContextMenu}
            workItems={filteredWorkItems}
            onAddNewWorkItem={onAddWorkItem}
            onChangeIteration={onChangeIteration}
            onChangeStatus={onChangeStatus}
            onChangePriority={onChangePriority}
            onChangeAssignee={onChangeAssignee}
          />}
        {isLoading && <LoadingSpinnerBox />}
      </Card>
    </>
  );
}

export default WorkItemsListCard;
