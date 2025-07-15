import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Media,
  Nav,
  NavItem,
  UncontrolledDropdown,
} from 'reactstrap';
import { memberNameInitials, textToColor } from '../../services/utils/utils';
import { logoutUser } from '../../services/api/api.service';
import React from 'react';
import Notifications from './Notifications';
import { FEATURES, useFeatureFlags } from '../../hooks/useFeatureFlags';

export default function CurrentUserNav() {
  const currentUserName = localStorage.getItem('currentUserName');
  const currentOrgId = localStorage.getItem('currentUserOrgId');
  const { isFeatureEnabled } = useFeatureFlags();

  if (!currentUserName) {
    return (
      <Nav className="align-items-center ml-auto ml-md-0" navbar>
        <NavItem>
          <a
            href={`/auth/sign-in?redirectTo=${encodeURI(window.location.pathname)}`}
            className="nav-link"
          >
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
          <Media className="align-items-center" style={{ cursor: 'pointer' }}>
            <Media className="ml-2 d-none d-lg-block">
              <span className="mb-0 text-md font-weight-bold float-right">
                {currentUserName}
              </span>
            </Media>
            <Media className="ml-2 d-lg-none d-block">
              <span className="mb-0 text-md font-weight-bold float-right">
                <span
                  style={{ backgroundColor: textToColor(currentUserName) }}
                  className="avatar avatar-xs rounded-circle mr-2 border border-white"
                >
                  {memberNameInitials(currentUserName)}
                </span>
              </span>
            </Media>
          </Media>
        </DropdownToggle>
        <DropdownMenu right className="border border-dark">
          <DropdownItem href={`/user/my-profile`}>
            <i className="fas fa-user" />
            <span>My profile</span>
          </DropdownItem>
          {isFeatureEnabled(FEATURES.AI_SETTINGS, currentOrgId) && (
            <DropdownItem href={`/user/ai-settings`}>
              <i className="fas fa-magic-wand-sparkles" />
              <span>AI Settings</span>
            </DropdownItem>
          )}
          <div className="dropdown-divider"></div>
          <DropdownItem
            href="#pablo"
            onClick={async (e) => {
              e.preventDefault();
              await logoutUser();
              window.location.href = '/auth/sign-in';
            }}
          >
            <i className="fas fa-sign-out" />
            <span>Logout</span>
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    </Nav>
  );
}
