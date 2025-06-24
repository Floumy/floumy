import React, { useEffect, useState } from 'react';
import { Item, Menu, Submenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import { listSprints } from '../../services/sprints/sprints.service';
import { Badge, Spinner } from 'reactstrap';
import {
  changeWorkItemAssignee,
  updateWorkItemSprint,
  updateWorkItemPriority,
  updateWorkItemStatus,
  deleteWorkItem,
} from '../../services/backlog/backlog.service';
import {
  formatHyphenatedString,
  priorityColor,
  workItemStatusColorClassName,
} from '../../services/utils/utils';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { getOrg } from '../../services/org/orgs.service';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

function WorkItemsContextMenu({
  menuId,
  onChangeSprint,
  onChangeStatus,
  onChangePriority,
  onChange,
  onChangeAssignee,
  onDelete,
}) {
  const [isLoadingSprints, setIsLoadingSprints] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState([]);
  const { orgId, projectId } = useParams();

  useEffect(() => {
    async function fetchSprints() {
      try {
        setIsLoadingSprints(true);
        const sprints = await listSprints(orgId, projectId);
        setSprints(
          sprints.filter(
            (sprint) =>
              sprint.status === 'active' || sprint.status === 'planned',
          ),
        );
      } catch (e) {
        console.error('The sprints could not be loaded');
      } finally {
        setIsLoadingSprints(false);
      }
    }
    async function fetchUsers() {
      try {
        setIsLoadingUsers(true);
        const org = await getOrg();
        const users = org.members
          .filter((user) => user.isActive)
          .map((user) => ({
            id: user.id,
            name: user.name,
          }));
        users.push({ id: null, name: 'None' });
        setUsers(users);
      } catch (e) {
        console.error('The users could not be loaded');
      } finally {
        setIsLoadingUsers(false);
      }
    }

    fetchUsers();
    fetchSprints();
  }, [orgId, projectId]);

  const handleChangeSprint = async ({ id: sprintId, event, props }) => {
    try {
      event.preventDefault();
      for (const workItem of props.workItems) {
        await updateWorkItemSprint(orgId, projectId, workItem.id, sprintId);
      }
      callChangeSprintCallbacks(sprintId, props.workItems);
      toast.success('The work items have been moved to the sprint');
    } catch (e) {
      toast.error('The work items could not be moved to the sprint');
    }
  };

  const callChangeSprintCallbacks = (sprintId, workItems) => {
    try {
      if (onChangeSprint) {
        onChangeSprint(workItems, sprintId);
      }
      if (onChange) {
        onChange(
          workItems.map((workItem) => workItem.id),
          { sprint: sprintId },
        );
      }
    } catch (e) {
      console.error('The callbacks could not be called');
    }
  };

  const handleChangeStatus = async ({ id: status, event, props }) => {
    try {
      event.preventDefault();
      for (const workItem of props.workItems) {
        await updateWorkItemStatus(orgId, projectId, workItem.id, status);
      }
      callChangeStatusCallbacks(status, props.workItems);
      toast.success('The work items have been updated');
    } catch (e) {
      toast.error('The work items could not be updated');
    }
  };

  const callChangeStatusCallbacks = (status, workItems) => {
    try {
      if (onChangeStatus) {
        onChangeStatus(workItems, status);
      }
      if (onChange) {
        onChange(
          workItems.map((workItem) => workItem.id),
          { status },
        );
      }
    } catch (e) {
      console.error('The callbacks could not be called');
    }
  };

  const handleChangePriority = async ({ id: priority, event, props }) => {
    try {
      event.preventDefault();
      for (const workItem of props.workItems) {
        await updateWorkItemPriority(orgId, projectId, workItem.id, priority);
      }
      callChangePriorityCallbacks(priority, props.workItems);
      toast.success('The work items have been updated');
    } catch (e) {
      toast.error('The work items could not be updated');
    }
  };

  const callChangePriorityCallbacks = (priority, workItems) => {
    try {
      if (onChangePriority) {
        onChangePriority(workItems, priority);
      }
      if (onChange) {
        onChange(
          workItems.map((workItem) => workItem.id),
          { priority },
        );
      }
    } catch (e) {
      console.error('The callbacks could not be called');
    }
  };

  const handleAssignTo = async ({ id: userId, event, props }) => {
    try {
      event.preventDefault();
      for (const workItem of props.workItems) {
        await changeWorkItemAssignee(orgId, projectId, workItem.id, userId);
      }
      callChangeAssigneeCallbacks(userId, props.workItems);
      toast.success('The work items have been assigned to the user');
    } catch (e) {
      toast.error('The work items could not be assigned to the user');
    }
  };

  const callChangeAssigneeCallbacks = (assigneeId, workItems) => {
    try {
      const assignee = users.find((user) => user.id === assigneeId);
      if (onChangeAssignee) {
        onChangeAssignee(workItems, assignee);
      }
      if (onChange) {
        onChange(
          workItems.map((workItem) => workItem.id),
          { assignee },
        );
      }
    } catch (e) {
      console.error('The callbacks could not be called');
    }
  };

  const handleDeleteClick = ({ event, props }) => {
    event.preventDefault();
    setItemsToDelete(props.workItems);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      for (const workItem of itemsToDelete) {
        await deleteWorkItem(orgId, projectId, workItem.id);
      }
      callDeleteCallbacks(itemsToDelete);
      toast.success(
        `Successfully deleted ${itemsToDelete.length} work item${itemsToDelete.length > 1 ? 's' : ''}`,
      );
      setShowDeleteConfirmation(false);
    } catch (e) {
      toast.error('Failed to delete work items');
    } finally {
      setIsDeleting(false);
      setItemsToDelete([]);
    }
  };

  const callDeleteCallbacks = (workItems) => {
    try {
      if (onDelete) {
        onDelete(workItems);
      }
    } catch (e) {
      console.error('The delete callbacks could not be called');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
    setItemsToDelete([]);
  };

  const workItemStatuses = [
    'planned',
    'ready-to-start',
    'in-progress',
    'blocked',
    'code-review',
    'testing',
    'revisions',
    'ready-for-deployment',
    'deployed',
    'done',
    'closed',
  ];

  const priorities = ['low', 'medium', 'high'];

  return (
    <>
      <Menu id={menuId} theme="dark">
        <Submenu
          label={'Change status'}
          style={{ maxHeight: '200px', overflowY: 'scroll' }}
        >
          {workItemStatuses.map((status) => (
            <Item key={status} id={status} onClick={handleChangeStatus}>
              <Badge color="" className="badge-dot mr-4">
                <i className={workItemStatusColorClassName(status)} />
                <span className="status">{formatHyphenatedString(status)}</span>
              </Badge>
            </Item>
          ))}
        </Submenu>
        {isLoadingUsers && (
          <Item disabled className="text-center">
            <Spinner className="m-auto" color="primary" />
          </Item>
        )}
        {!isLoadingUsers && users.length === 0 && (
          <Item disabled>Assign to</Item>
        )}
        {!isLoadingUsers && users.length > 0 && (
          <Submenu
            label={'Assign to'}
            style={{ maxHeight: '200px', overflowY: 'scroll' }}
          >
            {users.map((user) => (
              <Item
                key={user.id}
                id={user.id}
                onClick={handleAssignTo}
                style={{
                  maxWidth: '300px',
                  overflowX: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.name}
              </Item>
            ))}
          </Submenu>
        )}
        <Submenu
          label={'Change priority'}
          style={{ maxHeight: '200px', overflowY: 'scroll' }}
        >
          {priorities.map((priority) => (
            <Item key={priority} id={priority} onClick={handleChangePriority}>
              <Badge color={priorityColor(priority)} pill={true}>
                {priority}
              </Badge>
            </Item>
          ))}
        </Submenu>
        {isLoadingSprints && (
          <Item disabled className="text-center">
            <Spinner className="m-auto" color="primary" />
          </Item>
        )}
        {!isLoadingSprints && sprints.length === 0 && (
          <Item disabled>Move to sprint</Item>
        )}
        {!isLoadingSprints && sprints.length > 0 && (
          <Submenu
            label={'Move to sprint'}
            style={{ maxHeight: '200px', overflowY: 'scroll' }}
          >
            {sprints.map((sprint) => (
              <Item
                key={sprint.id}
                id={sprint.id}
                onClick={handleChangeSprint}
                style={{
                  maxWidth: '300px',
                  overflowX: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {sprint.title} [{sprint.status}]
              </Item>
            ))}
            <Item key={'null'} id={null} onClick={handleChangeSprint}>
              None
            </Item>
          </Submenu>
        )}
        <Item onClick={handleDeleteClick} className="text-danger">
          Delete
        </Item>
      </Menu>

      <DeleteConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        itemCount={itemsToDelete.length}
        itemType="work items"
      />
    </>
  );
}

WorkItemsContextMenu.propTypes = {
  menuId: PropTypes.string.isRequired,
  onChangeSprint: PropTypes.func,
  onChangePriority: PropTypes.func,
  onChangeStatus: PropTypes.func,
  onChange: PropTypes.func,
  onChangeAssignee: PropTypes.func,
  onDelete: PropTypes.func,
};

export default WorkItemsContextMenu;
