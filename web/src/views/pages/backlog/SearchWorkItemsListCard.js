import { Link, useParams } from 'react-router-dom';
import {
  Badge,
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
  UncontrolledTooltip,
} from 'reactstrap';
import {
  formatHyphenatedString,
  memberNameInitials,
  priorityColor,
  textToColor,
  workItemStatusColorClassName, workItemTypeIcon,
} from '../../../services/utils/utils';
import React, { useEffect, useState } from 'react';
import Select2 from 'react-select2-wrapper';
import useDebounceSearch from '../../../hooks/useDebounceSearch';
import ReactDatetime from 'react-datetime';
import { getOrg } from '../../../services/org/orgs.service';

function SearchWorkItemsListCard({
                                   workItems,
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
      type: filterByType,
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
  const [filterByType, setFilterByType] = useState('all');

  useEffect(() => {
    const handleFilterChange = () => {
      onSearch({
        text: searchText,
        assignee: filterByAssignee,
        priority: filterByPriority,
        status: filterByStatus,
        type: filterByType,
        completedAt: {
          start: startDate,
          end: endDate,
        },
      });
    };

    handleFilterChange();
  }, [filterByAssignee, filterByPriority, filterByStatus, startDate, endDate, filterByType]);

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
          <Col xs={12} sm={2} className="pb-2">
            <Select2
              className="form-control"
              defaultValue={filterByType}
              data={[
                { id: 'all', text: 'All Types' },
                { id: 'user-story', text: 'User Story' },
                { id: 'task', text: 'Task' },
                { id: 'bug', text: 'Bug' },
                { id: 'spike', text: 'Spike' },
                { id: 'technical-debt', text: 'Technical Debt' },
              ]}
              options={{
                placeholder: 'Filter by type',
              }}
              onSelect={(e) => {
                setFilterByType(e.target.value);
              }}
            />
          </Col>
          <Col xs={12} sm={2} className="pb-2">
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
                { id: 'blocked', text: 'Blocked' },
                { id: 'code-review', text: 'Code Review' },
                { id: 'testing', text: 'Testing' },
                { id: 'revisions', text: 'Revisions' },
                { id: 'ready-for-deployment', text: 'Ready for Deployment' },
                { id: 'deployed', text: 'Deployed' },
                { id: 'done', text: 'Done' },
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
            <th scope="col" width="40%">Title</th>
            <th scope="col" width="15%">Feature</th>
            <th scope="col" width="10%">Status</th>
            <th scope="col" width="10%">Assigned To</th>
            <th scope="col" width="10%">Priority</th>
          </tr>
          </thead>
          <tbody className="list">
          {workItems.length === 0 &&
            <tr>
              <td colSpan={7} className={'text-center'}>
                No work items found.
              </td>
            </tr>
          }
          {workItems.map((workItem) => (
            <tr key={workItem.id}>
              <td>
                <Link to={`/admin/orgs/${orgId}/projects/${projectId}/backlog/work-items/detail/${workItem.id}`}>
                  {workItem.reference}
                </Link>
              </td>
              <td className="title-cell">
                {workItemTypeIcon(workItem.type)}
                <Link className={"edit-work-item"} color={"muted"}
                      to={`/admin/orgs/${orgId}/projects/${projectId}/work-item/edit/${workItem.id}`}>
                  {workItem.title}
                </Link>
              </td>
              <td>
                {workItem.feature ? (
                  <Link to={`/admin/orgs/${orgId}/projects/${projectId}/roadmap/features/detail/${workItem.feature.id}`}>
                    {workItem.feature.reference}
                  </Link>
                ) : '-'}
              </td>
              <td>
                <Badge color="" className="badge-dot mr-4">
                  <i className={workItemStatusColorClassName(workItem.status)} />
                  <span className="status">{formatHyphenatedString(workItem.status)}</span>
                </Badge>
              </td>
              <td>
                {workItem.assignedTo && workItem.assignedTo.name &&
                  <>
                    <UncontrolledTooltip target={'assigned-to-' + workItem.id} placement="top">
                      {workItem.assignedTo.name}
                    </UncontrolledTooltip>
                    <span
                      className="avatar avatar-xs rounded-circle"
                      style={{ backgroundColor: textToColor(workItem.assignedTo.name) }}
                      id={'assigned-to-' + workItem.id}>{memberNameInitials(workItem.assignedTo.name)}
                    </span>
                  </>}
                {!workItem.assignedTo && '-'}
              </td>
              <td>
                <Badge color={priorityColor(workItem.priority)} pill={true}>
                  {workItem.priority}
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

export default SearchWorkItemsListCard;