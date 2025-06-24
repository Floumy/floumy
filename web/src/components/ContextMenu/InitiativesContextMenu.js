import React, { useEffect, useState } from 'react';
import { Item, Menu, Submenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import { Badge, Spinner } from 'reactstrap';
import {
  formatDate,
  formatHyphenatedString,
  initiativeStatusColorClassName,
  priorityColor,
} from '../../services/utils/utils';
import {
  changeAssignee,
  listMilestones,
  updateInitiativeKeyResult,
  updateInitiativeMilestone,
  updateInitiativePriority,
  updateInitiativeStatus,
  deleteInitiative,
} from '../../services/roadmap/roadmap.service';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { listKeyResults } from '../../services/okrs/okrs.service';
import { useParams } from 'react-router-dom';
import { getOrg } from '../../services/org/orgs.service';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

function InitiativesContextMenu({
  menuId,
  onChangeMilestone,
  onChangeKeyResult,
  onChangeStatus,
  onChangePriority,
  onChangeAssignTo,
  onChange,
  onDelete,
}) {
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(false);
  const [isLoadingKeyResults, setIsLoadingKeyResults] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [keyResults, setKeyResults] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState([]);
  const { projectId, orgId } = useParams();

  useEffect(() => {
    async function fetchMilestones() {
      try {
        setIsLoadingMilestones(true);
        const milestones = await listMilestones(orgId, projectId);
        setMilestones(
          milestones.filter(
            (milestone) => new Date(milestone.dueDate) >= new Date(),
          ),
        );
      } catch (e) {
        console.error('The milestones could not be loaded');
      } finally {
        setIsLoadingMilestones(false);
      }
    }

    async function fetchKeyResults() {
      try {
        setIsLoadingKeyResults(true);
        const keyResults = await listKeyResults(orgId, projectId);
        setKeyResults(
          keyResults.filter((keyResult) => keyResult.timeline !== 'past'),
        );
      } catch (e) {
        console.error('The key results could not be loaded');
      } finally {
        setIsLoadingKeyResults(false);
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

    fetchMilestones();
    fetchKeyResults();
    fetchUsers();
  }, []);

  function callChangeMilestoneCallbacks(milestoneId, initiatives) {
    try {
      if (onChangeMilestone) {
        onChangeMilestone(initiatives, milestoneId);
      }
      if (onChange) {
        onChange(
          initiatives.map((initiative) => initiative.id),
          { milestone: milestoneId },
        );
      }
    } catch (e) {
      console.error('The callbacks could not be called');
    }
  }

  const handleChangeMilestone = async ({ id: milestoneId, event, props }) => {
    try {
      event.preventDefault();
      for (const initiative of props.initiatives) {
        await updateInitiativeMilestone(
          orgId,
          projectId,
          initiative.id,
          milestoneId,
        );
      }
      callChangeMilestoneCallbacks(milestoneId, props.initiatives);
      toast.success('The initiatives have been moved to the milestone');
    } catch (e) {
      toast.error('The initiatives could not be moved to the milestone');
    }
  };

  function callChangeKeyResultCallbacks(keyResultId, initiatives) {
    try {
      if (onChangeKeyResult) {
        onChangeKeyResult(initiatives, keyResultId);
      }
      if (onChange) {
        onChange(
          initiatives.map((initiative) => initiative.id),
          { keyResult: keyResultId },
        );
      }
    } catch (e) {
      console.error('The callbacks could not be called');
    }
  }

  function callChangeAssigneeCallbacks(userId, initiatives) {
    try {
      if (onChangeAssignTo) {
        onChangeAssignTo(initiatives, userId);
      }
      if (onChange) {
        onChange(
          initiatives.map((initiative) => initiative.id),
          { assignee: userId },
        );
      }
    } catch (e) {
      console.error('The callbacks could not be called');
    }
  }

  const handleChangeKeyResult = async ({ id: keyResultId, event, props }) => {
    try {
      event.preventDefault();
      for (const initiative of props.initiatives) {
        await updateInitiativeKeyResult(
          orgId,
          projectId,
          initiative.id,
          keyResultId,
        );
      }
      callChangeKeyResultCallbacks(keyResultId, props.initiatives);
      toast.success('The initiatives have been moved to the key result');
    } catch (e) {
      toast.error('The initiatives could not be moved to the key result');
    }
  };

  const handleAssignTo = async ({ id: userId, event, props }) => {
    try {
      event.preventDefault();
      for (const initiative of props.initiatives) {
        await changeAssignee(orgId, projectId, initiative.id, userId);
      }
      callChangeAssigneeCallbacks(userId, props.initiatives);
      toast.success('The initiatives have been assigned to the user');
    } catch (e) {
      toast.error('The initiatives could not be assigned to the user');
    }
  };

  function callChangeStatusCallbacks(status, initiatives) {
    try {
      if (onChangeStatus) {
        onChangeStatus(initiatives, status);
      }
      if (onChange) {
        onChange(
          initiatives.map((initiative) => initiative.id),
          { status },
        );
      }
    } catch (e) {
      console.error('The callbacks could not be called');
    }
  }

  const handleChangeStatus = async ({ id: status, event, props }) => {
    try {
      event.preventDefault();
      for (const initiative of props.initiatives) {
        await updateInitiativeStatus(orgId, projectId, initiative.id, status);
      }
      callChangeStatusCallbacks(status, props.initiatives);
      toast.success('The initiatives have been updated');
    } catch (e) {
      toast.error('The initiatives could not be updated');
    }
  };

  function callChangePriorityCallbacks(priority, initiatives) {
    try {
      if (onChangePriority) {
        onChangePriority(initiatives, priority);
      }
      if (onChange) {
        onChange(
          initiatives.map((initiative) => initiative.id),
          { priority },
        );
      }
    } catch (e) {
      console.error('The callbacks could not be called');
    }
  }

  const handleChangePriority = async ({ id: priority, event, props }) => {
    try {
      event.preventDefault();
      for (const initiative of props.initiatives) {
        await updateInitiativePriority(
          orgId,
          projectId,
          initiative.id,
          priority,
        );
      }
      callChangePriorityCallbacks(priority, props.initiatives);
      toast.success('The initiatives have been updated');
    } catch (e) {
      toast.error('The initiatives could not be updated');
    }
  };

  const handleDeleteClick = ({ event, props }) => {
    event.preventDefault();
    setItemsToDelete(props.initiatives);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      for (const initiative of itemsToDelete) {
        await deleteInitiative(orgId, projectId, initiative.id);
      }
      callDeleteCallbacks(itemsToDelete);
      toast.success(
        `Successfully deleted ${itemsToDelete.length} initiative${itemsToDelete.length > 1 ? 's' : ''}`,
      );
      setShowDeleteConfirmation(false);
    } catch (e) {
      toast.error('Failed to delete initiatives');
    } finally {
      setIsDeleting(false);
      setItemsToDelete([]);
    }
  };

  const callDeleteCallbacks = (initiatives) => {
    try {
      if (onDelete) {
        onDelete(initiatives);
      }
    } catch (e) {
      console.error('The delete callbacks could not be called');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
    setItemsToDelete([]);
  };

  const initiativeStatuses = [
    'planned',
    'ready-to-start',
    'in-progress',
    'completed',
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
          {initiativeStatuses.map((status) => (
            <Item key={status} id={status} onClick={handleChangeStatus}>
              <Badge color="" className="badge-dot mr-4">
                <i className={initiativeStatusColorClassName(status)} />
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
        {(isLoadingMilestones || isLoadingKeyResults) && (
          <Item disabled className="text-center">
            <Spinner className="m-auto" color="primary" />
          </Item>
        )}
        {!isLoadingMilestones && milestones.length === 0 && (
          <Item disabled>Move to sprint</Item>
        )}
        {!isLoadingMilestones && milestones.length > 0 && (
          <Submenu
            label={'Move to milestone'}
            style={{ maxHeight: '200px', overflowY: 'scroll' }}
          >
            {milestones.map((milestone) => (
              <Item
                key={milestone.id}
                id={milestone.id}
                onClick={handleChangeMilestone}
                style={{
                  maxWidth: '300px',
                  overflowX: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {formatDate(milestone.dueDate)} | {milestone.title}
              </Item>
            ))}
            <Item key={'null'} id={null} onClick={handleChangeMilestone}>
              None
            </Item>
          </Submenu>
        )}
        {!isLoadingKeyResults && keyResults.length === 0 && (
          <Item disabled>Move to key result</Item>
        )}
        {!isLoadingKeyResults && keyResults.length > 0 && (
          <Submenu
            label={'Move to key result'}
            style={{ maxHeight: '200px', overflowY: 'scroll' }}
          >
            {keyResults.map((keyResult) => (
              <Item
                key={keyResult.id}
                id={keyResult.id}
                onClick={handleChangeKeyResult}
                style={{
                  maxWidth: '300px',
                  overflowX: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {keyResult.reference}: {keyResult.title}
              </Item>
            ))}
            <Item key={'null'} id={null} onClick={handleChangeKeyResult}>
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
        itemType="initiatives"
      />
    </>
  );
}

InitiativesContextMenu.propTypes = {
  menuId: PropTypes.string.isRequired,
  onChangeMilestone: PropTypes.func,
  onChangeKeyResult: PropTypes.func,
  onChangeAssignTo: PropTypes.func,
  onChangeStatus: PropTypes.func,
  onChangePriority: PropTypes.func,
  onChange: PropTypes.func,
  onDelete: PropTypes.func,
};

export default InitiativesContextMenu;
