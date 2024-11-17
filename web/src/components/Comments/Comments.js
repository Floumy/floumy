import { Card, CardBody, CardHeader, FormText, Input, ListGroup, ListGroupItem, UncontrolledTooltip } from "reactstrap";
import { formatDateWithTime, memberNameInitials, textToColor } from "../../services/utils/utils";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Comments({
                                   comments = [],
                                   onCommentAdd,
                                   onCommentDelete,
                                   onCommentEdit
                                 }) {
  const currentUserId = localStorage.getItem("currentUserId");
  const currentUserName = localStorage.getItem("currentUserName");
  const [comment, setComment] = useState("");
  const [isHovered, setIsHovered] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
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
        navigate(`/auth/sign-in?redirectTo=${encodeURI(window.location.pathname)}`);
        return;
      }

      await onCommentAdd(comment);
      setComment("");
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
      setEditingCommentContent(comments.find((comment) => comment.id === commentId)?.content);
    } catch (e) {
      console.error(e);
    }
  };

  function canModify(comment) {
    return isHovered[comment.id] && comment.createdBy.id === currentUserId;
  }

  function getListGroupItem(comment) {
    return <ListGroupItem key={comment.id}
                          className="flex-column align-items-start py-4 px-4"
                          onMouseEnter={handleMouseEnter(comment.id)}
                          onMouseLeave={handleMouseLeave(comment.id)}>
      <div className="d-flex w-100 justify-content-between mb-3">
        <div>
          <div className="d-flex w-100 align-items-center">
                        <span
                          className="avatar avatar-xs rounded-circle mr-2"
                          style={{ backgroundColor: textToColor(comment.createdBy.name) }}
                          id={`assigned-to-test-user`}>{memberNameInitials(comment.createdBy.name)}
                        </span>
            <h5 className="mb-1">{comment.createdBy.name}</h5>
          </div>
        </div>
        {canModify(comment) ?
          (<div>
            <i className="fa fa-edit text-gray mr-2" style={{ cursor: "pointer" }}
               onClick={async () => await editComment(comment.id)}
               role="button"
               tabIndex="0"
               aria-pressed="false"
               aria-expanded="false"
            />
            <i className="fa fa-trash text-gray" style={{ cursor: "pointer" }}
               onClick={async () => await deleteComment(comment.id)}
               role="button"
               tabIndex="0"
               aria-pressed="false"
               aria-expanded="false"
            />
          </div>) :
          (<small>{formatDateWithTime(comment.createdAt)}</small>)}
      </div>
      <p className="text-sm mb-0">
        {comment.content}
      </p>
    </ListGroupItem>;
  }

  function isCommentEdit(commentId) {
    return isEditing && editingCommentId === commentId;
  }

  function getListGroupItemEdit(comment) {
    return <ListGroupItem key={comment.id}
                          className="flex-column align-items-start py-4 px-4"
                          onMouseEnter={handleMouseEnter(comment.id)}
                          onMouseLeave={handleMouseLeave(comment.id)}>
      <div className="d-flex w-100 justify-content-between mb-3">
        <div>
          <div className="d-flex w-100 align-items-center">
                        <span
                          className="avatar avatar-xs rounded-circle mr-2"
                          style={{ backgroundColor: textToColor(comment.createdBy.name) }}
                          id={`assigned-to-test-user`}>{memberNameInitials(comment.createdBy.name)}
                        </span>
            <h5 className="mb-1">{comment.createdBy.name}</h5>
          </div>
        </div>
        <div>
          <i className="fa fa-check text-gray mr-2" style={{ cursor: "pointer" }}
             onClick={async () => {
               if (!editingCommentContent?.trim()?.length) return;
               await onCommentEdit(editingCommentId, editingCommentContent);
               setIsEditing(false);
               setEditingCommentId(null);
               setEditingCommentContent("");
             }}
             role="button"
             tabIndex="0"
             aria-pressed="false"
             aria-expanded="false"
          />
          <i className="fa fa-remove text-gray" style={{ cursor: "pointer" }}
             onClick={() => {
               setIsEditing(false);
               setEditingCommentId(null);
               setEditingCommentContent("");
             }}
             role="button"
             tabIndex="0"
             aria-pressed="false"
             aria-expanded="false"
          />
        </div>
      </div>
      <FormText className="text-sm mb-0">
        <Input
          placeholder="Write a comment..."
          value={editingCommentContent}
          onChange={(e) => setEditingCommentContent(e.target.value)}
          type="textarea"
          rows={3}
        />
      </FormText>
    </ListGroupItem>;
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
            .map((comment) => isCommentEdit(comment.id) ? getListGroupItemEdit(comment) : getListGroupItem(comment))}
          {!isEditing && <ListGroupItem key="add-comment" className="flex-column align-items-start py-4 px-4">
            {currentUserName && <div className="d-flex w-100 justify-content-between mb-3">
              <div>
                <div className="d-flex w-100 align-items-center">
                        <span
                          className="avatar avatar-xs rounded-circle mr-2"
                          style={{ backgroundColor: textToColor(currentUserName) }}
                          id={`assigned-to-test-user`}>{memberNameInitials(currentUserName)}
                        </span>
                  <h5 className="mb-1">{currentUserName}</h5>
                </div>
              </div>
              <small>now</small>
            </div>}
            <FormText className="text-sm mb-0">
              {!currentUserName && <UncontrolledTooltip delay={0} target="add-comment">
                Sign in to comment
              </UncontrolledTooltip>}
              <Input
                id={"add-comment"}
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                type="textarea"
                rows={3}
                disabled={isEditing}
                onClick={() => {
                  if (!currentUserName) {
                    navigate(`/auth/sign-in?redirectTo=${encodeURI(window.location.pathname)}`);
                  }
                }}
              />
            </FormText>
            <button
              className="btn btn-sm btn-primary mt-2"
              onClick={submitComment}
              disabled={isEditing || !comment.trim().length}
            >
              Comment
            </button>
          </ListGroupItem>}
        </ListGroup>
      </CardBody>
    </Card>
  );
}