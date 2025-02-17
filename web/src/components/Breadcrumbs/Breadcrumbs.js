import React from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
} from "reactstrap";
import { Link, useParams } from 'react-router-dom';

export default function Breadcrumbs({ breadcrumbs }) {

  const {orgId, projectId} = useParams();

  const getBreadcrumbUrl = (breadcrumb) => {
    if (breadcrumb.type === 'work-item') {
      return `/admin/orgs/${orgId}/projects/${projectId}/work-item/edit/${breadcrumb.id}`;
    }
    if (breadcrumb.type === 'initiative') {
      return `/admin/orgs/${orgId}/projects/${projectId}/roadmap/initiatives/detail/${breadcrumb.id}`;
    }
    if (breadcrumb.type === 'key-result') {
      return `/admin/orgs/${orgId}/projects/${projectId}/kr/detail/${breadcrumb.id}`;
    }
    if (breadcrumb.type === 'objective') {
      return `/admin/orgs/${orgId}/projects/${projectId}/okrs/detail/${breadcrumb.id}`;
    }
  }

  return (
    <Breadcrumb listClassName="breadcrumb-links breadcrumb-links-light">
      {breadcrumbs.map((breadcrumb, index) => (
        <BreadcrumbItem key={index}>
          <Link to={getBreadcrumbUrl(breadcrumb)}>
            {breadcrumb.reference}
          </Link>
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}