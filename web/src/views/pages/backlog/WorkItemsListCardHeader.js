import { CardTitle, Col, Row } from 'reactstrap';
import Select2 from 'react-select2-wrapper';
import React from 'react';

export default function WorkItemsListCardHeader({
  title,
  showFilters = true,
  filterByPriority,
  setFilterByPriority,
  filterByType,
  setFilterByType,
  filterByStatus,
  setFilterByStatus,
  extraButtonLabel,
  extraButtonId,
  onExtraButtonClick,
}) {
  return (
    <Row className="align-items-center">
      <Col xs={12} sm={3} className="pb-2">
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
              defaultValue={filterByType}
              data={[
                { id: 'all', text: 'All Types' },
                { id: 'deliverable', text: 'Deliverable' },
                { id: 'defect', text: 'Defect' },
                { id: 'task', text: 'Task' },
                { id: 'improvement', text: 'Improvement' },
                { id: 'research', text: 'Research' },
              ]}
              options={{
                placeholder: 'Filter by type',
              }}
              onSelect={(e) => {
                setFilterByType(e.target.value);
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
                { id: 'blocked', text: 'Blocked' },
                { id: 'review', text: 'Review' },
                { id: 'testing', text: 'Testing' },
                { id: 'revisions', text: 'Revisions' },
                { id: 'ready-to-ship', text: 'Ready to Ship' },
                { id: 'shipped', text: 'Shipped' },
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
        </>
      )}
    </Row>
  );
}
