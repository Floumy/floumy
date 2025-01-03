import { Link, useParams } from 'react-router-dom';
import {
  Badge, Card,
  CardHeader,
  CardTitle,
  Col,
  FormGroup, Input,
  InputGroup, InputGroupAddon, InputGroupText,
  Progress,
  Row,
  UncontrolledTooltip,
} from 'reactstrap';
import {
  featureStatusColorClassName,
  formatHyphenatedString,
  formatProgress,
  memberNameInitials,
  priorityColor,
  textToColor,
} from '../../../services/utils/utils';
import React from 'react';
import Select2 from 'react-select2-wrapper';
import useDebounceSearch from '../../../hooks/useDebounceSearch';

function SearchFeaturesListCard({ features,
                                  title,
                                  onSearch,
                                  searchPlaceholder = 'Search by title',
                                  filterByPriority,
                                  setFilterByPriority,
                                  filterByStatus,
                                  setFilterByStatus }) {
  const { orgId, projectId } = useParams();
  const [searchText, handleSearch] = useDebounceSearch(onSearch);

  return (
    <Card>
      <CardHeader className="rounded-lg">
        <Row>
          <Col className="pb-2">
            <CardTitle tag="h2">{title}</CardTitle>
          </Col>
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
      <div className="table-responsive border-bottom">
        <table className="table align-items-center no-select" style={{ minWidth: '700px' }}>
          <thead className="thead-light">
          <tr>
            <th scope="col" width="5%">Reference</th>
            <th scope="col" width="40%">Initiative</th>
            <th scope="col" width="20%">Progress</th>
            <th scope="col" width="5%">W.I. Count</th>
            <th scope="col" width="10%">Status</th>
            <th scope="col" width={'10%'}>Assigned To</th>
            <th scope="col" width="10%">Priority</th>
          </tr>
          </thead>
          <tbody className="list">
          {features.length === 0 &&
            <tr>
              <td colSpan={7} className={'text-center'}>
                No initiatives found.
              </td>
            </tr>
          }
          {features.map((feature) => (
            <tr key={feature.id}>
              <td>
                <Link to={`/admin/orgs/${orgId}/projects/${projectId}/roadmap/features/detail/${feature.id}`}
                      className={'feature-detail'}>
                  {feature.reference}
                </Link>
              </td>
              <td className="title-cell">
                <Link to={`/admin/orgs/${orgId}/projects/${projectId}/roadmap/features/detail/${feature.id}`}
                      className={'feature-detail'}>
                  {feature.title}
                </Link>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <span className="mr-2">{formatProgress(feature.progress)}%</span>
                  <div>
                    <Progress style={{ maxWidth: '80px' }} max="100" value={feature.progress} color="primary" />
                  </div>
                </div>
              </td>
              <td>
                {feature.workItemsCount}
              </td>
              <td>
                <Badge color="" className="badge-dot mr-4">
                  <i className={featureStatusColorClassName(feature.status)} />
                  <span className="status">{formatHyphenatedString(feature.status)}</span>
                </Badge>
              </td>
              <td>
                {feature.assignedTo && feature.assignedTo.name &&
                  <>
                    <UncontrolledTooltip target={'assigned-to-' + feature.id} placement="top">
                      {feature.assignedTo.name}
                    </UncontrolledTooltip>
                    <span
                      className="avatar avatar-xs rounded-circle"
                      style={{ backgroundColor: textToColor(feature.assignedTo.name) }}
                      id={'assigned-to-' + feature.id}>{memberNameInitials(feature.assignedTo.name)}
                </span>
                  </>}
                {!feature.assignedTo && '-'}
              </td>
              <td>
                <Badge color={priorityColor(feature.priority)} pill={true}>
                  {feature.priority}
                </Badge>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default SearchFeaturesListCard;