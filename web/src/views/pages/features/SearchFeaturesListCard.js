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
import React, { useEffect, useState } from 'react';
import Select2 from 'react-select2-wrapper';
import useDebounceSearch from '../../../hooks/useDebounceSearch';
import ReactDatetime from 'react-datetime';
import { getOrg } from '../../../services/org/orgs.service';

function SearchFeaturesListCard({
                                  features,
                                  title,
                                  onSearch,
                                  searchPlaceholder = 'Search by title',
                                }) {

  const { orgId, projectId } = useParams();
  const [searchText, handleSearch] = useDebounceSearch((text) => {
    onSearch({
      text,
      assignee: filterByAssignee,
      priority: filterByPriority,
      status: filterByStatus,
      completedAt: {
        start: startDate,
        end: endDate,
      },
    });
  });
  const [filterByAssignee, setFilterByAssignee] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filterByPriority, setFilterByPriority] = useState('all');
  const [filterByStatus, setFilterByStatus] = useState('all');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const handleFilterChange = () => {
      onSearch({
        text: searchText,
        assignee: filterByAssignee,
        priority: filterByPriority,
        status: filterByStatus,
        completedAt: {
          start: startDate,
          end: endDate,
        },
      });
    };

    handleFilterChange();
  }, [filterByAssignee, filterByPriority, filterByStatus, startDate, endDate]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const org = await getOrg();
        const usersOptions = [
          { id: 'all', text: 'All Assignees' },
          ...org.members.map(user => ({ id: user.id, text: user.name })),
        ];
        setUsers(usersOptions);
      } catch (e) {
        console.error(e.message);
      }
    }

    fetchUsers();
  }, [orgId, projectId]);

  return (
    <Card>
      <CardHeader className="rounded-lg">
        <Row>
          <Col className="pb-2">
            <CardTitle tag="h2">{title}</CardTitle>
          </Col>
        </Row>
        <Row className="pb-2">
          <Col xs={12} sm={2} className="pb-2">
            <ReactDatetime
              inputProps={{
                placeholder: 'Completed from',
                className: 'form-control mr-2',
              }}
              closeOnSelect={true}
              timeFormat={false}
              dateFormat={'YYYY-MM-DD'}
              value={startDate}
              onChange={(value) => {
                if (value._isAMomentObject) {
                  setStartDate(value.format('YYYY-MM-DD'));
                } else {
                  setStartDate(null);
                }
              }}
            />
          </Col>
          <Col xs={12} sm={2} className="pb-2">
            <ReactDatetime
              inputProps={{
                placeholder: 'Completed to',
                className: 'form-control',
              }}
              className="datetime-left"
              closeOnSelect={true}
              timeFormat={false}
              dateFormat={'YYYY-MM-DD'}
              value={endDate}
              onChange={(value) => {
                if (value._isAMomentObject) {
                  setEndDate(value.format('YYYY-MM-DD'));
                } else {
                  setEndDate(null);
                }
              }}
            />
          </Col>
          <Col xs={12} sm={4} className="pb-2">
            <Select2
              className="form-control"
              defaultValue={filterByAssignee}
              data={users}
              options={{
                placeholder: 'Filter by assignee',
              }}
              onSelect={(e) => {
                setFilterByAssignee(e.target.value);
              }}
            />
          </Col>
          <Col xs={12} sm={2} className="pb-2">
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
          <Col xs={12} sm={2} className="pb-2">
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