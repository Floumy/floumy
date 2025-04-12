import React from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
} from "reactstrap";
import { Link, useParams } from 'react-router-dom';

export default function Breadcrumbs({ breadcrumbs, isPublic }) {

  const {orgId, projectId} = useParams();

  const getAdminBreadcrumbUrl = (breadcrumb) => {
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

  const getPublicBreadcrumbUrl = (breadcrumb) => {
    if (breadcrumb.type === 'work-item') {
      return `/public/orgs/${orgId}/projects/${projectId}/work-item/detail/${breadcrumb.id}`;
    }
    if (breadcrumb.type === 'initiative') {
      return `/public/orgs/${orgId}/projects/${projectId}/roadmap/initiatives/detail/${breadcrumb.id}`;
    }
    if (breadcrumb.type === 'key-result') {
      return `/public/orgs/${orgId}/projects/${projectId}/kr/detail/${breadcrumb.id}`;
    }
    if (breadcrumb.type === 'objective') {
      return `/public/orgs/${orgId}/projects/${projectId}/okrs/detail/${breadcrumb.id}`;
    }
  }

  const getBreadcrumbUrl = (breadcrumb) => {
    if (isPublic) {
      return getPublicBreadcrumbUrl(breadcrumb);
    }

    return getAdminBreadcrumbUrl(breadcrumb);
  }

  return (
    <Breadcrumb listClassName="breadcrumb-links breadcrumb-dark">
      {breadcrumbs.map((breadcrumb, index) => (
        <BreadcrumbItem key={index}>
          <Link to={getBreadcrumbUrl(breadcrumb)} className="text-dark">
            {breadcrumb.reference}
          </Link>
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}