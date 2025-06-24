import { Link } from 'react-router-dom';
import { Badge, UncontrolledTooltip } from 'reactstrap';
import {
  formatHyphenatedString,
  initiativeStatusColorClassName,
  memberNameInitials,
  priorityColor,
  sortByPriority,
  textToColor,
} from '../../../services/utils/utils';
import React, { useEffect, useState } from 'react';

function PublicInitiativesList({
  orgId,
  projectId,
  initiatives,
  headerClassName = 'thead-light',
  showAssignedTo = false,
}) {
  const [sortedInitiatives, setSortedInitiatives] = useState([]);

  useEffect(() => {
    const sortedInitiatives = sortByPriority(initiatives);
    setSortedInitiatives(sortedInitiatives);
  }, [initiatives]);

  return (
    <>
      <div className="table-responsive border-bottom">
        <table
          className="table align-items-center no-select"
          style={{ minWidth: '700px' }}
        >
          <thead className={headerClassName}>
            <tr>
              <th scope="col" width="5%">
                Reference
              </th>
              <th scope="col" width="40%">
                Initiative
              </th>
              <th scope="col" width="10%">
                Status
              </th>
              {showAssignedTo && (
                <th scope="col" width={'10%'}>
                  Assigned To
                </th>
              )}
              <th scope="col" width="10%">
                Priority
              </th>
            </tr>
          </thead>
          <tbody className="list">
            {sortedInitiatives.length === 0 && (
              <tr>
                <td colSpan={7} className={'text-center'}>
                  No initiatives found.
                </td>
              </tr>
            )}
            {sortedInitiatives.map((initiative) => (
              <tr key={initiative.id}>
                <td>
                  <Link
                    to={`/public/orgs/${orgId}/projects/${projectId}/roadmap/initiatives/detail/${initiative.id}`}
                    className={'initiative-detail'}
                  >
                    {initiative.reference}
                  </Link>
                </td>
                <td className="title-cell">
                  <Link
                    to={`/public/orgs/${orgId}/projects/${projectId}/roadmap/initiatives/detail/${initiative.id}`}
                    className={'initiative-detail'}
                  >
                    {initiative.title}
                  </Link>
                </td>
                <td>
                  <Badge color="" className="badge-dot mr-4">
                    <i
                      className={initiativeStatusColorClassName(
                        initiative.status,
                      )}
                    />
                    <span className="status">
                      {formatHyphenatedString(initiative.status)}
                    </span>
                  </Badge>
                </td>
                {showAssignedTo && (
                  <td>
                    {initiative.assignedTo && initiative.assignedTo.name && (
                      <>
                        <UncontrolledTooltip
                          target={'assigned-to-' + initiative.id}
                          placement="top"
                        >
                          {initiative.assignedTo.name}
                        </UncontrolledTooltip>
                        <span
                          className="avatar avatar-xs rounded-circle"
                          style={{
                            backgroundColor: textToColor(
                              initiative.assignedTo.name,
                            ),
                          }}
                          id={'assigned-to-' + initiative.id}
                        >
                          {memberNameInitials(initiative.assignedTo.name)}
                        </span>
                      </>
                    )}
                    {!initiative.assignedTo && '-'}
                  </td>
                )}
                <td>
                  <Badge color={priorityColor(initiative.priority)} pill={true}>
                    {initiative.priority}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default PublicInitiativesList;
