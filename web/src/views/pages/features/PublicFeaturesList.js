import { Link } from "react-router-dom";
import { Badge, Progress, UncontrolledTooltip } from "reactstrap";
import {
  featureStatusColorClassName,
  formatHyphenatedString,
  formatProgress,
  memberNameInitials,
  priorityColor,
  sortByPriority,
  textToColor
} from "../../../services/utils/utils";
import React, { useEffect, useState } from "react";

function FeaturesList({
                        orgId,
                        features,
                        headerClassName = "thead-light",
                        showAssignedTo = false
                      }) {
  const [sortedFeatures, setSortedFeatures] = useState([]);

  useEffect(() => {
    const sortedFeatures = sortByPriority(features);
    setSortedFeatures(sortedFeatures);
  }, [features]);


  return (
    <>
      <div className="table-responsive border-bottom">
        <table className="table align-items-center no-select" style={{ minWidth: "700px" }}>
          <thead className={headerClassName}>
          <tr>
            <th scope="col" width="5%">Reference</th>
            <th scope="col" width="40%">Initiative</th>
            <th scope="col" width="30%">Progress</th>
            <th scope="col" width="5%">W.I. Count</th>
            <th scope="col" width="10%">Status</th>
            {showAssignedTo && <th scope="col" width={"10%"}>Assigned To</th>}
            <th scope="col" width="10%">Priority</th>
          </tr>
          </thead>
          <tbody className="list">
          {sortedFeatures.length === 0 &&
            <tr>
              <td colSpan={7} className={"text-center"}>
                No initiatives found.
              </td>
            </tr>
          }
          {sortedFeatures.map((feature) => (
            <tr key={feature.id}>
              <td>
                <Link to={`/public/org/${orgId}/roadmap/features/detail/${feature.id}`}
                      className={"feature-detail"}>
                  {feature.reference}
                </Link>
              </td>
              <td className="title-cell">
                <Link to={`/public/org/${orgId}/roadmap/features/detail/${feature.id}`}
                      className={"feature-detail"}>
                  {feature.title}
                </Link>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <span className="mr-2">{formatProgress(feature.progress)}%</span>
                  <div>
                    <Progress max="100" value={feature.progress} color="primary" />
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
              {showAssignedTo && <td>
                {feature.assignedTo && feature.assignedTo.name &&
                  <>
                    <UncontrolledTooltip target={"assigned-to-" + feature.id} placement="top">
                      {feature.assignedTo.name}
                    </UncontrolledTooltip>
                    <span
                      className="avatar avatar-xs rounded-circle"
                      style={{ backgroundColor: textToColor(feature.assignedTo.name) }}
                      id={"assigned-to-" + feature.id}>{memberNameInitials(feature.assignedTo.name)}
                </span>
                  </>}
                {!feature.assignedTo && "-"}
              </td>}
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
    </>);
}

export default FeaturesList;
