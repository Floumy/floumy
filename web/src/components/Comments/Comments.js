import {
  Card,
  CardBody,
  CardHeader,
  ListGroup,
  ListGroupItem,
  UncontrolledTooltip,
} from 'reactstrap';
import {
  formatDateWithTime,
  memberNameInitials,
  textToColor,
} from '../../services/utils/utils';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RichTextEditor from '../RichTextEditor/RichTextEditor';
import DOMPurify from 'dompurify';

export default function Comments({
  comments = [],
  onCommentAdd,
  onCommentDelete,
  onCommentEdit,
}) {
  const currentUserId = localStorage.getItem('currentUserId');
  const currentUserName = localStorage.getItem('currentUserName');
  const [comment, setComment] = useState('');
  const [mentions, setMentions] = useState([]);
  const [isHovered, setIsHovered] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [editingCommentMentions, setEditingCommentMentions] = useState([]);
  const navigate = useNavigate();

  const handleMouseEnter = (commentId) => {
    return () => {
      setIsHovered({ [commentId]: true });
    };
  };

  const handleMouseLeave = (commentId) => {
    return () => {
      setIsHovered({ ...isHovered, [commentId]: false });
    };
  };

  const submitComment = async (e) => {
    try {
      e.preventDefault();

      if (currentUserId === null) {
        navigate(
          `/auth/sign-in?redirectTo=${encodeURI(window.location.pathname)}`,
        );
        return;
      }

      await onCommentAdd({
        content: comment,
        mentions: mentions.map((mention) => mention.id),
      });
      setComment('');
      setMentions([]);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await onCommentDelete(commentId);
    } catch (e) {
      console.error(e);
    }
  };

  const editComment = async (commentId) => {
    try {
      setIsEditing(true);
      setEditingCommentId(commentId);
      const comment = comments.find((comment) => comment.id === commentId);
      setEditingCommentContent(comment.content);
    } catch (e) {
      console.error(e);
    }
  };

  function canModify(comment) {
    return isHovered[comment.id] && comment.createdBy.id === currentUserId;
  }

  function formatCommentWithClickableLinks(comment) {
    return comment.content.replace(
      /(https?:\/\/[^\s<>]+)/g,
      '<a href="$1" style="color: #06c;" target="_blank">$1</a>',
    );
  }

  function getListGroupItem(comment) {
    return (
      <ListGroupItem
        key={comment.id}
        className="flex-column align-items-start py-4 px-4"
        onMouseEnter={handleMouseEnter(comment.id)}
        onMouseLeave={handleMouseLeave(comment.id)}
      >
        <div className="d-flex w-100 justify-content-between mb-3">
          <div>
            <div className="d-flex w-100 align-items-center">
              <span
                className="avatar avatar-xs rounded-circle mr-2"
                style={{ backgroundColor: textToColor(comment.createdBy.name) }}
                id={`assigned-to-test-user`}
              >
                {memberNameInitials(comment.createdBy.name)}
              </span>
              <h5 className="mb-1">{comment.createdBy.name}</h5>
            </div>
          </div>
          {canModify(comment) ? (
            <div>
              <i
                className="fa fa-edit text-gray mr-2"
                style={{ cursor: 'pointer' }}
                onClick={async () => await editComment(comment.id)}
                role="button"
                tabIndex="0"
                aria-pressed="false"
                aria-expanded="false"
              />
              <i
                className="fa fa-trash text-gray"
                style={{ cursor: 'pointer' }}
                onClick={async () => await deleteComment(comment.id)}
                role="button"
                tabIndex="0"
                aria-pressed="false"
                aria-expanded="false"
              />
            </div>
          ) : (
            <small>{formatDateWithTime(comment.createdAt)}</small>
          )}
        </div>
        <div
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(
              formatCommentWithClickableLinks(comment),
            ),
          }}
        />
      </ListGroupItem>
    );
  }

  function isCommentEdit(commentId) {
    return isEditing && editingCommentId === commentId;
  }

  function getListGroupItemEdit(comment) {
    return (
      <ListGroupItem
        key={comment.id}
        className="flex-column align-items-start py-4 px-4"
        onMouseEnter={handleMouseEnter(comment.id)}
        onMouseLeave={handleMouseLeave(comment.id)}
      >
        <div className="d-flex w-100 justify-content-between mb-3">
          <div>
            <div className="d-flex w-100 align-items-center">
              <span
                className="avatar avatar-xs rounded-circle mr-2"
                style={{ backgroundColor: textToColor(comment.createdBy.name) }}
                id={`assigned-to-test-user`}
              >
                {memberNameInitials(comment.createdBy.name)}
              </span>
              <h5 className="mb-1">{comment.createdBy.name}</h5>
            </div>
          </div>
          <div>
            <i
              className="fa fa-check text-gray mr-2"
              style={{ cursor: 'pointer' }}
              onClick={async () => {
                if (!editingCommentContent?.trim()?.length) return;
                await onCommentEdit(editingCommentId, {
                  content: editingCommentContent,
                  mentions: editingCommentMentions.map((m) => m.id),
                });
                setIsEditing(false);
                setEditingCommentId(null);
                setEditingCommentContent('');
                setEditingCommentMentions([]);
              }}
              role="button"
              tabIndex="0"
              aria-pressed="false"
              aria-expanded="false"
            />
            <i
              className="fa fa-remove text-gray"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setIsEditing(false);
                setEditingCommentId(null);
                setEditingCommentContent('');
                setEditingCommentMentions([]);
              }}
              role="button"
              tabIndex="0"
              aria-pressed="false"
              aria-expanded="false"
            />
          </div>
        </div>
        <RichTextEditor
          value={editingCommentContent}
          onChange={(text, mentions) => {
            setEditingCommentContent(text);
            setEditingCommentMentions(mentions);
          }}
        />
      </ListGroupItem>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h5 className="h3 mb-0">Comments</h5>
      </CardHeader>
      <CardBody className="p-0">
        <ListGroup flush>
          {comments
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map((comment) =>
              isCommentEdit(comment.id)
                ? getListGroupItemEdit(comment)
                : getListGroupItem(comment),
            )}
          {!isEditing && (
            <ListGroupItem
              key="add-comment"
              className="flex-column align-items-start py-4 px-4"
            >
              {currentUserName && (
                <div className="d-flex w-100 justify-content-between mb-3">
                  <div>
                    <div className="d-flex w-100 align-items-center">
                      <span
                        className="avatar avatar-xs rounded-circle mr-2"
                        style={{
                          backgroundColor: textToColor(currentUserName),
                        }}
                        id={`assigned-to-test-user`}
                      >
                        {memberNameInitials(currentUserName)}
                      </span>
                      <h5 className="mb-1">{currentUserName}</h5>
                    </div>
                  </div>
                  <small>now</small>
                </div>
              )}
              {!currentUserName && (
                <UncontrolledTooltip delay={0} target="add-comment">
                  Sign in to comment
                </UncontrolledTooltip>
              )}
              <RichTextEditor
                id="add-comment"
                enabled={!!currentUserName}
                value={comment}
                onChange={(text, mentions) => {
                  setComment(text);
                  setMentions(mentions);
                }}
              />
              <button
                className="btn btn-sm btn-primary mt-2"
                onClick={submitComment}
                disabled={isEditing || !comment.trim().length}
              >
                Comment
              </button>
            </ListGroupItem>
          )}
        </ListGroup>
      </CardBody>
    </Card>
  );
}
