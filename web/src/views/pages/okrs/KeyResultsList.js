import { Link } from 'react-router-dom';
import {
  formatHyphenatedString,
  formatOKRsProgress,
  okrStatusColorClassName,
} from '../../../services/utils/utils';
import { Badge, Progress, Table } from 'reactstrap';
import React, { useCallback } from 'react';

export default function KeyResultsList({
  orgId,
  keyResults,
  isPublic = false,
  projectId = null,
}) {
  if (!keyResults) {
    return;
  }

  const getKeyResultUrl = useCallback(
    (keyResultId) => {
      if (isPublic) {
        return `/public/orgs/${orgId}/projects/${projectId}/kr/detail/${keyResultId}`;
      }

      if (projectId) {
        return `/admin/orgs/${orgId}/projects/${projectId}/kr/detail/${keyResultId}`;
      }

      return `/orgs/${orgId}/kr/detail/${keyResultId}`;
    },
    [projectId, orgId, isPublic],
  );

  return (
    <Table
      className="table align-items-center no-select"
      style={{ minWidth: '700px' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <thead className="thead">
        <tr>
          <th className="sort" scope="col" width="5%">
            Reference
          </th>
          <th className="sort" scope="col" width="50%">
            Key Result
          </th>
          <th className="sort" scope="col" width="30%">
            Progress
          </th>
          <th className="sort" scope="col" width="10%">
            Status
          </th>
        </tr>
      </thead>
      <tbody className="list border-bottom">
        {keyResults && keyResults.length === 0 && (
          <tr>
            <td colSpan={4}>
              <div className="text-center text-muted">
                No key results have been added yet
              </div>
            </td>
          </tr>
        )}
        {keyResults &&
          keyResults.map((keyResult) => (
            <tr key={keyResult.id}>
              <td>
                <Link
                  to={getKeyResultUrl(keyResult.id)}
                  className={'okr-detail'}
                >
                  {keyResult.reference}
                </Link>
              </td>
              <td className="title-cell">
                <Link
                  to={getKeyResultUrl(keyResult.id)}
                  className={'okr-detail'}
                >
                  {keyResult.title}
                </Link>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <span className="mr-2">
                    {formatOKRsProgress(keyResult.progress)}%
                  </span>
                  <div>
                    <Progress
                      max="100"
                      value={formatOKRsProgress(keyResult.progress)}
                      color="primary"
                    />
                  </div>
                </div>
              </td>
              <td>
                <Badge color="" className="badge-dot mr-4">
                  <i className={okrStatusColorClassName(keyResult.status)} />
                  <span className="status">
                    {formatHyphenatedString(keyResult.status)}
                  </span>
                </Badge>
              </td>
            </tr>
          ))}
      </tbody>
    </Table>
  );
}
