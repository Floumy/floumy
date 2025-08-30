import { Badge, Table } from 'reactstrap';
import {
  formatHyphenatedString,
  priorityColor,
  workItemStatusColorClassName,
  workItemTypeIcon,
} from '../../../services/utils/utils';
import { Link, useParams } from 'react-router-dom';
import React from 'react';
import 'react-contexify/ReactContexify.css';

function PublicWorkItemsList({
  orgId,
  workItems,
  showInitiative = true,
  showStatus = true,
  headerClassName = 'thead-light',
}) {
  const { projectId } = useParams();
  return (
    <>
      <div className="table-responsive">
        <Table
          className="align-items-center table-flush border-bottom no-select"
          style={{ minWidth: '700px' }}
        >
          <thead className={headerClassName}>
            <tr>
              <th scope="col" width={'5%'}>
                Reference
              </th>
              <th scope="col" width={'40%'}>
                Work Item
              </th>
              {showInitiative && (
                <th scope="col" width={'20%'}>
                  Initiative
                </th>
              )}
              <th scope="col" width={'5%'}>
                Est.
              </th>
              {showStatus && (
                <th scope="col" width={'10%'}>
                  Status
                </th>
              )}
              <th scope="col" width={'5%'}>
                Priority
              </th>
            </tr>
          </thead>
          <tbody className="list">
            {workItems.length === 0 && (
              <tr>
                <td colSpan={showInitiative ? 7 : 6} className="text-center">
                  No work items added yet
                </td>
              </tr>
            )}
            {workItems.map((workItem) => (
              <tr key={workItem.id}>
                <td>
                  <Link
                    className={'edit-work-item'}
                    color={'muted'}
                    to={`/public/orgs/${orgId}/projects/${projectId}/work-item/detail/${workItem.id}`}
                  >
                    {workItem.reference}
                  </Link>
                </td>
                <td className={'title-cell'}>
                  {workItemTypeIcon(workItem.type)}
                  <Link
                    className={'edit-work-item'}
                    color={'muted'}
                    to={`/public/orgs/${orgId}/projects/${projectId}/work-item/detail/${workItem.id}`}
                  >
                    {workItem.title}
                  </Link>
                </td>
                {showInitiative && (
                  <td className="title-cell">
                    {workItem.initiative && (
                      <Link
                        to={`/public/orgs/${orgId}/projects/${projectId}/roadmap/initiatives/detail/${workItem.initiative.id}`}
                        className="text-gray"
                      >
                        {workItem.initiative.title}
                      </Link>
                    )}
                    {!workItem.initiative}
                  </td>
                )}
                <td>{workItem?.estimation}</td>
                {showStatus && (
                  <td>
                    <Badge color="" className="badge-dot mr-4">
                      <i
                        className={workItemStatusColorClassName(
                          workItem.status,
                        )}
                      />
                      <span className="status">
                        {formatHyphenatedString(workItem.status)}
                      </span>
                    </Badge>
                  </td>
                )}
                <td>
                  <Badge color={priorityColor(workItem.priority)} pill={true}>
                    {workItem.priority}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}

export default PublicWorkItemsList;
