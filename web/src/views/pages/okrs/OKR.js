import { Col, Row } from 'reactstrap';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import KeyResultsList from './KeyResultsList';

export default function OKR({ okr }) {
  const { orgId, projectId } = useParams();
  const [keyResults, setKeyResults] = useState([]);
  const [showKeyResults, setShowKeyResults] = useState(true);
  useEffect(() => {
    if (!okr.keyResults) {
      return;
    }
    const priority = ['high', 'medium', 'low'];
    const keyResults = okr.keyResults.sort((a, b) => {
      return priority.indexOf(a.priority) - priority.indexOf(b.priority);
    });
    setKeyResults(keyResults);
  }, [okr?.keyResults]);

  function getokrHeader() {
    return (
      <>
        <h3 className="pt-2 pr-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowKeyResults(!showKeyResults);
            }}
            className="btn btn-sm btn-outline-light shadow-none shadow-none--hover pt-1 pb-0 pr-2"
          >
            {!showKeyResults && <i className="ni ni-bold-right" />}
            {showKeyResults && <i className="ni ni-bold-down" />}
          </button>
          <Link
            to={`/admin/orgs/${orgId}/projects/${projectId}/okrs/detail/${okr.id}`}
          >
            <span className="text-gray">{okr.reference}:</span> {okr.title}{' '}
            <span className="text-muted text-sm"></span>
          </Link>
        </h3>
        {okr.description && (
          <div className="text-sm text-muted">
            Description: {okr.description}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="mb-5">
        <Row className="pl-4 pr-4 pb-2">
          <Col sm={12}>{getokrHeader()}</Col>
        </Row>
        <Row>
          <Col>
            <div hidden={!showKeyResults}>
              <KeyResultsList
                orgId={orgId}
                projectId={projectId}
                keyResults={keyResults}
              />
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
}
