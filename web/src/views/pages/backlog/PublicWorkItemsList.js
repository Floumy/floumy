import { Badge, Table } from "reactstrap";
import {
  formatHyphenatedString,
  priorityColor,
  workItemStatusColorClassName,
  workItemTypeIcon
} from "../../../services/utils/utils";
import { Link, useParams } from "react-router-dom";
import React from "react";
import "react-contexify/ReactContexify.css";

function PublicWorkItemsList({
                               orgId,
                               workItems,
                               showFeature = true,
                               headerClassName = "thead-light"
                             }) {
  const { productId } = useParams();
  return (<>
    <div className="table-responsive">
      <Table className="align-items-center table-flush border-bottom no-select" style={{ minWidth: "700px" }}>
        <thead className={headerClassName}>
        <tr>
          <th scope="col" width={"5%"}>Reference</th>
          <th scope="col" width={"40%"}>Work Item</th>
          {showFeature && <th scope="col" width={"20%"}>Initiative</th>}
          <th scope="col" width={"5%"}>Est.</th>
          <th scope="col" width={"10%"}>Status</th>
          <th scope="col" width={"5%"}>Priority</th>
        </tr>
        </thead>
        <tbody className="list">
        {workItems.length === 0 && (<tr>
          <td colSpan={showFeature ? 7 : 6} className="text-center">
            No work items found.
          </td>
        </tr>)}
        {workItems.map((workItem) => (<tr key={workItem.id}>
          <td>
            <Link className={"edit-work-item"} color={"muted"}
                  to={`/public/orgs/${orgId}/projects/${productId}/work-item/detail/${workItem.id}`}>
              {workItem.reference}
            </Link>
          </td>
          <td className={"title-cell"}>{workItemTypeIcon(workItem.type)}
            <Link className={"edit-work-item"} color={"muted"}
                  to={`/public/orgs/${orgId}/projects/${productId}/work-item/detail/${workItem.id}`}>
              {workItem.title}
            </Link>
          </td>
          {showFeature && <td className="title-cell">
            {workItem.feature && (
              <Link to={`/public/orgs/${orgId}/projects/${productId}/roadmap/features/detail/${workItem.feature.id}`}
                    className="text-gray">
                {workItem.feature.title}
              </Link>)}
            {!workItem.feature && "-"}
          </td>}
          <td>
            {workItem.estimation && workItem.estimation > 0 ? workItem.estimation : "-"}
          </td>
          <td>
            <Badge color="" className="badge-dot mr-4">
              <i className={workItemStatusColorClassName(workItem.status)} />
              <span className="status">{formatHyphenatedString(workItem.status)}</span>
            </Badge>
          </td>
          <td>
            <Badge color={priorityColor(workItem.priority)} pill={true}>
              {workItem.priority}
            </Badge>
          </td>
        </tr>))}
        </tbody>
      </Table>
    </div>
  </>);
}

export default PublicWorkItemsList;
