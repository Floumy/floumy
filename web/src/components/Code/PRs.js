import { Col, Row, Table } from 'reactstrap';
import { Link } from 'react-router-dom';
import {
  displayDateDifferenceFromNow,
  workItemTypeIcon,
} from '../../services/utils/utils';
import React from 'react';

export default function PRs({
  prs,
  orgId,
  projectId,
  entity = 'pull requests',
}) {
  return (
    <>
      <Row className="mb-5">
        <Col>
          <h3>
            <i className="fa fa-code-pull-request mr-2 text-success" />
            Open PRs
          </h3>
          <div className="table-responsive">
            <Table
              className="align-items-center table-flush border-bottom no-select"
              style={{ minWidth: '700px' }}
            >
              <thead className="thead">
                <tr>
                  <th scope="col" width={'45%'}>
                    Title
                  </th>
                  <th scope="col" width={'45%'}>
                    Work Item
                  </th>
                  <th scope="col" width={'10%'}>
                    Created
                  </th>
                  <th scope="col" width={'10%'}>
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody className="list">
                {prs.list.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center">
                      No {entity}
                    </td>
                  </tr>
                )}
                {prs.list.map((pr, index) => (
                  <tr key={index}>
                    <td>
                      <a
                        href={pr.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary"
                      >
                        {pr.title}
                        <i
                          className="fa fa-external-link-alt ml-2"
                          style={{ fontSize: '0.75rem' }}
                        />
                      </a>
                    </td>
                    <td>
                      {pr.workItem ? (
                        <Link
                          to={`/admin/orgs/${orgId}/projects/${projectId}/work-item/edit/${pr.workItem.id}`}
                          className="text-gray"
                        >
                          {workItemTypeIcon(pr.workItem.type)}
                          {pr.workItem.title}
                          <i className="fa fa-link ml-2" />
                        </Link>
                      ) : (
                        <span className="text-gray">No work item</span>
                      )}
                    </td>
                    <td>{displayDateDifferenceFromNow(pr.createdAt)}</td>
                    <td>{displayDateDifferenceFromNow(pr.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
    </>
  );
}
