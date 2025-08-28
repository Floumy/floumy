import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  Col,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Row,
} from 'reactstrap';
import Select2 from 'react-select2-wrapper';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import { sortByPriority } from '../../../services/utils/utils';
import useDebounceSearch from '../../../hooks/useDebounceSearch';

function BaseInitiativeListCard({
  title,
  initiatives,
  isLoading,
  showFilters = true,
  onSearch,
  searchPlaceholder = 'Search by title',
  renderInitiativeList,
  extraButtonLabel,
  extraButtonId,
  onExtraButtonClick,
}) {
  const [filterByPriority, setFilterByPriority] = useState('all');
  const [filterByStatus, setFilterByStatus] = useState('all');
  const [searchText, handleSearch] = useDebounceSearch(onSearch);
  const [filteredInitiatives, setFilteredInitiatives] = useState([]);

  useEffect(() => {
    setFilteredInitiatives(
      initiatives
        .filter((initiative) => {
          if (filterByPriority === 'all') return true;
          return initiative.priority === filterByPriority;
        })
        .filter((initiative) => {
          if (filterByStatus === 'all') return true;
          return initiative.status === filterByStatus;
        })
        .filter((initiative) => {
          if (onSearch) return true;
          return initiative.title
            .toLowerCase()
            .includes(searchText.toLowerCase());
        }),
    );
  }, [onSearch, searchText, filterByPriority, filterByStatus, initiatives]);

  useEffect(() => {
    setFilteredInitiatives(sortByPriority(initiatives));
  }, [initiatives]);

  return (
    <Card>
      <CardHeader className="rounded-lg">
        <Row className="align-items-center">
          <Col className="pb-2">
            <div className="d-flex align-items-center justify-content-between">
              <CardTitle tag="h2" className="mb-0">
                {title}
              </CardTitle>
              {extraButtonLabel && (
                <button
                  id={extraButtonId}
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={onExtraButtonClick}
                >
                  {extraButtonLabel}
                </button>
              )}
            </div>
          </Col>
          {showFilters && (
            <>
              <Col xs={12} sm={3} className="pb-2">
                <Select2
                  className="form-control"
                  defaultValue={filterByPriority}
                  data={[
                    { id: 'all', text: 'All Priorities' },
                    { id: 'high', text: 'High' },
                    { id: 'medium', text: 'Medium' },
                    { id: 'low', text: 'Low' },
                  ]}
                  options={{
                    placeholder: 'Filter by priority',
                  }}
                  onSelect={(e) => {
                    setFilterByPriority(e.target.value);
                  }}
                />
              </Col>
              <Col xs={12} sm={3} className="pb-2">
                <Select2
                  className="form-control"
                  defaultValue={filterByStatus}
                  data={[
                    { id: 'all', text: 'All Statuses' },
                    { id: 'planned', text: 'Planned' },
                    { id: 'ready-to-start', text: 'Ready to Start' },
                    { id: 'in-progress', text: 'In Progress' },
                    { id: 'completed', text: 'Completed' },
                    { id: 'closed', text: 'Closed' },
                  ]}
                  options={{
                    placeholder: 'Filter by status',
                  }}
                  onSelect={(e) => {
                    setFilterByStatus(e.target.value);
                  }}
                />
              </Col>
            </>
          )}
        </Row>
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
      <div>
        {(!isLoading || filteredInitiatives.length > 0) &&
          renderInitiativeList(filteredInitiatives)}
        {isLoading && <LoadingSpinnerBox />}
      </div>
    </Card>
  );
}

export default BaseInitiativeListCard;
