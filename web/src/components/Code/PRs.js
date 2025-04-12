import { Col, Row, Table } from 'reactstrap';
import { Link } from 'react-router-dom';
import { formatDate, workItemTypeIcon } from '../../services/utils/utils';
import React from 'react';

export default function PRs({prs, orgId, projectId, entity = 'pull requests'}) {
  return (
    <>
      <Row className="mb-5">
        <Col>
          <h3>
            <i className="fa fa-code-pull-request mr-2 text-success" />
            Open For Less Than 1 Day
          </h3>
          <div className="table-responsive">
            <Table className="align-items-center table-flush border-bottom no-select"
                   style={{ minWidth: '700px' }}>
              <thead className="thead">
              <tr>
                <th scope="col" width={'45%'}>Title</th>
                <th scope="col" width={'45%'}>Work Item</th>
                <th scope="col" width={'10%'}>Created at</th>
              </tr>
              </thead>
              <tbody className="list">
              {prs.openForOneDay.length === 0 && <tr>
                <td colSpan={3} className="text-center">No {entity}</td>
              </tr>}
              {prs.openForOneDay.map((pr, index) => (
                <tr key={index}>
                  <td>{pr.title}</td>
                  <td>
                    <Link
                      to={`/admin/orgs/${orgId}/projects/${projectId}/work-item/edit/${pr.workItem.id}`}
                      className="text-gray">
                      {workItemTypeIcon(pr.workItem.type)}{pr.workItem.title}
                      <i className="fa fa-link ml-2"/>
                    </Link>
                  </td>
                  <td>{formatDate(pr.createdAt)}</td>
                </tr>
              ))}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
      <Row className="mb-5">
        <Col>
          <h3>
            <i className="fa fa-code-pull-request mr-2 text-warning" />
            Open For Less Than 3 Days
          </h3>
          <div className="table-responsive">
            <Table className="align-items-center table-flush border-bottom no-select"
                   style={{ minWidth: '700px' }}>
              <thead className="thead">
              <tr>
                <th scope="col" width={'45%'}>Title</th>
                <th scope="col" width={'45%'}>Work Item</th>
                <th scope="col" width={'10%'}>Created at</th>
              </tr>
              </thead>
              <tbody className="list">
              {prs.openForThreeDays.length === 0 && <tr>
                <td colSpan={3} className="text-center">No {entity}</td>
              </tr>}
              {prs.openForThreeDays.map((pr, index) => (
                <tr key={index}>
                  <td>
                    <a href={pr.url} target="_blank" rel="noreferrer">
                      <span className="mr-2">{pr.title}</span>
                      <i className="fa fa-external-link-alt mr-1" />
                    </a>
                  </td>
                  <td>
                    <Link
                      to={`/admin/orgs/${orgId}/projects/${projectId}/work-item/edit/${pr.workItem.id}`}
                      className="text-gray">
                      {workItemTypeIcon(pr.workItem.type)}{pr.workItem.title}
                    </Link>
                  </td>
                  <td>{formatDate(pr.createdAt)}</td>
                </tr>
              ))}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
      <Row className="mb-5">
        <Col>
          <h3 className>
            <i className="fa fa-code-pull-request mr-2 text-danger" />
            Open For More Than 3 Days
          </h3>
          <div className="table-responsive">
            <Table className="align-items-center table-flush border-bottom no-select"
                   style={{ minWidth: '700px' }}>
              <thead className="thead">
              <tr>
                <th scope="col" width={'45%'}>Title</th>
                <th scope="col" width={'45%'}>Work Item</th>
                <th scope="col" width={'10%'}>Created at</th>
              </tr>
              </thead>
              <tbody className="list">
              {prs.openForMoreThanThreeDays.length === 0 && <tr>
                <td colSpan={3} className="text-center">No {entity}</td>
              </tr>}
              {prs.openForMoreThanThreeDays.map((pr, index) => (
                <tr key={index}>
                  <td>
                    <a href={pr.url} target="_blank" rel="noreferrer">
                      <span className="mr-2">{pr.title}</span>
                      <i className="fa fa-external-link-alt mr-1" />
                    </a>
                  </td>
                  <td>
                    <Link
                      to={`/admin/orgs/${orgId}/projects/${projectId}/work-item/edit/${pr.workItem.id}`}
                      className="text-gray">
                      {workItemTypeIcon(pr.workItem.type)}{pr.workItem.title}
                    </Link>
                  </td>
                  <td>{formatDate(pr.createdAt)}</td>
                </tr>
              ))}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
      <Row className="mb-5">
        <Col>
          <h3 className="">
            <i className="fa fa-code-pull-request mr-2 text-primary" />
            Closed in the past 7 days
          </h3>
          <div className="table-responsive">
            <Table className="align-items-center table-flush border-bottom no-select"
                   style={{ minWidth: '700px' }}>
              <thead className="thead">
              <tr>
                <th scope="col" width={'45%'}>Title</th>
                <th scope="col" width={'45%'}>Work Item</th>
                <th scope="col" width={'10%'}>Created at</th>
              </tr>
              </thead>
              <tbody className="list">
              {prs.closedInThePastSevenDays.length === 0 && <tr>
                <td colSpan={3} className="text-center">No {entity}</td>
              </tr>}
              {prs.closedInThePastSevenDays.map((pr, index) => (
                <tr key={index}>
                  <td>
                    <a href={pr.url} target="_blank" rel="noreferrer">
                      <span className="mr-2">{pr.title}</span>
                      <i className="fa fa-external-link-alt mr-1" />
                    </a>
                  </td>
                  <td>
                    <Link
                      to={`/admin/orgs/${orgId}/projects/${projectId}/work-item/edit/${pr.workItem.id}`}
                      className="text-gray">
                      {workItemTypeIcon(pr.workItem.type)}{pr.workItem.title}
                    </Link>
                  </td>
                  <td>{formatDate(pr.createdAt)}</td>
                </tr>
              ))}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
    </>
  )
}