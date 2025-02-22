import { DropdownItem, DropdownMenu, DropdownToggle, Media, Nav, NavItem, UncontrolledDropdown } from 'reactstrap';
import { memberNameInitials, textToColor } from '../../services/utils/utils';
import { logoutUser } from '../../services/api/api.service';
import React from 'react';
import { useParams } from 'react-router-dom';
import Notifications from './Notifications';

export default function CurrentUserNav() {
  const {orgId, projectId} = useParams();

  const currentUserName = localStorage.getItem("currentUserName");

  if (!currentUserName) {
    return (
      <Nav className="align-items-center ml-auto ml-md-0" navbar>
        <NavItem>
          <a href={`/auth/sign-in?redirectTo=${encodeURI(window.location.pathname)}`} className="nav-link">
            <span className="nav-link-inner--text text-white">Sign In</span>
          </a>
        </NavItem>
      </Nav>
    );
  }

  return (
    <Nav className="align-items-center ml-auto ml-md-0" navbar>
      <Notifications />
      <UncontrolledDropdown nav>
        <DropdownToggle className="nav-link pr-0" color="" tag="a">
          <Media className="align-items-center" style={{ cursor: "pointer" }}>
            <Media className="ml-2 d-none d-lg-block">
                      <span className="mb-0 text-md font-weight-bold text-lighter float-right">
                        {currentUserName}
                      </span>
            </Media>
            <Media className="ml-2 d-lg-none d-block">
                      <span className="mb-0 text-md font-weight-bold text-lighter float-right">
                        <span
                          style={{ backgroundColor: textToColor(currentUserName) }}
                          className="avatar avatar-xs rounded-circle mr-2 border border-white">
                          {memberNameInitials(currentUserName)}
                        </span>

                      </span>
            </Media>
          </Media>
        </DropdownToggle>
        <DropdownMenu right className="border border-dark">
          <DropdownItem
            href={`/admin/orgs/${orgId}/projects/${projectId}/my-profile`}
          >
            <i className="ni ni-single-02" />
            <span>My profile</span>
          </DropdownItem>
          <div className="dropdown-divider"></div>
          <DropdownItem
            href="#pablo"
            onClick={(e) => {
              e.preventDefault();
              logoutUser();
              window.location.href = "/auth/sign-in";
            }}
          >
            <i className="ni ni-user-run" />
            <span>Logout</span>
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    </Nav>
  );
}