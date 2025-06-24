import {
  Button,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  ListGroup,
  ListGroupItem,
  Row,
  UncontrolledTooltip,
} from 'reactstrap';
import React, { useEffect } from 'react';
import {
  countUnreadNotifications,
  deleteAllNotifications,
  deleteNotification,
  listNotifications,
  markAsRead,
} from '../../services/notifications/notifications.service';
import { Link } from 'react-router-dom';
import { memberNameInitials, textToColor } from '../../services/utils/utils';
import moment from 'moment';

const notificationTextActions = {
  initiative_comment: {
    create: (notification) =>
      `${notification.createdBy.name} commented on an initiative`,
    update: (notification) =>
      `${notification.createdBy.name} updated a comment`,
  },
  initiative_description: {
    create: (notification) =>
      `${notification.createdBy.name} created an initiative`,
    update: (notification) =>
      `${notification.createdBy.name} updated an initiative`,
  },
  feature_request_comment: {
    create: (notification) =>
      `${notification.createdBy.name} commented on a feature request`,
    update: (notification) =>
      `${notification.createdBy.name} updated a comment`,
  },
  issue_comment: {
    create: (notification) =>
      `${notification.createdBy.name} commented on an issue`,
    update: (notification) =>
      `${notification.createdBy.name} updated a comment`,
  },
  key_result_comment: {
    create: (notification) =>
      `${notification.createdBy.name} commented on a key result`,
    update: (notification) =>
      `${notification.createdBy.name} updated a comment on a key result`,
  },
  objective_comment: {
    create: (notification) =>
      `${notification.createdBy.name} commented on an objective`,
    update: (notification) =>
      `${notification.createdBy.name} updated a comment on an objective`,
  },
  work_item_comment: {
    create: (notification) =>
      `${notification.createdBy.name} commented on a work item`,
    update: (notification) =>
      `${notification.createdBy.name} updated a comment on a work item`,
  },
  work_item_description: {
    create: (notification) =>
      `${notification.createdBy.name} created a work item`,
    update: (notification) =>
      `${notification.createdBy.name} updated a work item description`,
  },
};

export default function Notifications() {
  const [unreadNotificationsCount, setUnreadNotificationsCount] =
    React.useState(0);
  const [notifications, setNotifications] = React.useState([]);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  function toggleDropdown() {
    setDropdownOpen(!dropdownOpen);
  }

  async function fetchData() {
    const unreadNotificationsCount = await countUnreadNotifications();
    setUnreadNotificationsCount(unreadNotificationsCount);
    const notifications = await listNotifications();
    setNotifications(notifications);
  }

  async function read(notificationId) {
    await markAsRead([notificationId]);
    await fetchData();
  }

  async function remove(notificationId) {
    await deleteNotification(notificationId);
    await fetchData();
  }

  async function removeAll() {
    await deleteAllNotifications();
    await fetchData();
  }

  function notificationTextAction(notification) {
    switch (notification.entity) {
      case 'initiative_comment':
        return notificationTextActions.initiative_comment[notification.action](
          notification,
        );
      case 'initiative_description':
        return notificationTextActions.initiative_description[
          notification.action
        ](notification);
      case 'feature_request_comment':
        return notificationTextActions.feature_request_comment[
          notification.action
        ](notification);
      case 'issue_comment':
        return notificationTextActions.issue_comment[notification.action](
          notification,
        );
      case 'key_result_comment':
        return notificationTextActions.key_result_comment[notification.action](
          notification,
        );
      case 'objective_comment':
        return notificationTextActions.objective_comment[notification.action](
          notification,
        );
      case 'work_item_comment':
        return notificationTextActions.work_item_comment[notification.action](
          notification,
        );
      case 'work_item_description':
        return notificationTextActions.work_item_description[
          notification.action
        ](notification);
      default:
        return 'Unknown notification';
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Fetch data every 60 seconds

    return () => clearInterval(interval);
  }, []);
  return (
    <Dropdown
      isOpen={dropdownOpen}
      toggle={toggleDropdown}
      nav
      style={{ cursor: 'pointer' }}
    >
      <DropdownToggle className="nav-link" color="" tag="a">
        {unreadNotificationsCount ? (
          <span className="badge badge-danger">
            <i className="ni ni-bell-55" /> {unreadNotificationsCount}{' '}
          </span>
        ) : (
          <i className="ni ni-bell-55" />
        )}
      </DropdownToggle>
      <DropdownMenu
        className="dropdown-menu-xl py-0 overflow-hidden border border-dark"
        style={{ width: '540px', maxWidth: '90vw' }}
        right
      >
        <div className="px-3 py-3">
          <h6 className="text-sm text-muted m-0">
            You have{' '}
            <strong className="text-info">{notifications.length}</strong>{' '}
            notifications.
          </h6>
        </div>

        <ListGroup flush style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {notifications.map((notification) => (
            <ListGroupItem
              className="list-group-item-action"
              key={notification.id}
            >
              <Link to={notification.entityUrl} tag={Link}>
                <Row className="align-items-center">
                  <Col className="col-auto">
                    <span
                      style={{
                        backgroundColor: textToColor(
                          notification.createdBy.name,
                        ),
                      }}
                      className="avatar avatar rounded-circle mr-2 border border-white"
                    >
                      {memberNameInitials(notification.createdBy.name)}
                    </span>
                  </Col>
                  <div className="col ml--2">
                    <div>
                      <Row>
                        <Col>
                          {notification.status === 'unread' ? (
                            <h4 className="mb-0 text-sm">
                              {notificationTextAction(notification)}
                            </h4>
                          ) : (
                            <span className="text-sm">
                              {notificationTextAction(notification)}
                            </span>
                          )}
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <div className="text-left text-muted">
                            <small>
                              {moment(notification.createdAt).fromNow()}
                            </small>
                          </div>
                        </Col>
                        <Col md={3}>
                          <Button
                            outline
                            color="primary"
                            id={`mark-as-read-${notification.id}`}
                            onClick={async (event) => {
                              event.stopPropagation();
                              event.preventDefault();
                              await read(notification.id);
                            }}
                            className="btn btn-icon-only rounded-circle btn-sm pt-1"
                          >
                            <i className="ni ni-check-bold" />
                          </Button>
                          <UncontrolledTooltip
                            placement="top"
                            target={`mark-as-read-${notification.id}`}
                          >
                            Mark as read
                          </UncontrolledTooltip>
                          <Button
                            outline
                            color="danger"
                            id={`delete-notification-${notification.id}`}
                            className="btn btn-icon-only rounded-circle btn-sm pt-1"
                            onClick={async (event) => {
                              event.stopPropagation();
                              event.preventDefault();
                              await remove(notification.id);
                            }}
                          >
                            <i className="ni ni-fat-remove" />
                          </Button>
                          <UncontrolledTooltip
                            placement="top"
                            target={`delete-notification-${notification.id}`}
                          >
                            Delete
                          </UncontrolledTooltip>
                        </Col>
                      </Row>
                    </div>
                    <p className="text-sm mb-0">{notification.entityName}</p>
                  </div>
                </Row>
              </Link>
            </ListGroupItem>
          ))}
        </ListGroup>

        <DropdownItem
          className="text-center text-info font-weight-bold py-3 border-top"
          onClick={removeAll}
        >
          Clear All
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
