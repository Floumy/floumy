import { useCallback } from "react";
import { addInitiativeComment, deleteInitiativeComment, updateInitiativeComment } from "../services/roadmap/roadmap.service";
import { useParams } from "react-router-dom";

function useInitiativeComments(initiative, setInitiative, toast) {
  const { orgId, projectId } = useParams();
  const addComment = useCallback(async (comment) => {
    try {
      const addedComment = await addInitiativeComment(orgId, projectId, initiative.id, comment);
      setInitiative((prevInitiative) => ({
        ...prevInitiative,
        comments: [...prevInitiative.comments, addedComment]
      }));
      toast.success("Comment added successfully");
    } catch (e) {
      toast.error("Failed to add comment");
    }
  }, [orgId, projectId, initiative?.id, setInitiative, toast]);

  const updateComment = useCallback(async (commentId, content) => {
    try {
      const updatedComment = await updateInitiativeComment(orgId, projectId, initiative.id, commentId, content);
      setInitiative((prevInitiative) => {
        const index = prevInitiative.comments.findIndex((c) => c.id === updatedComment.id);
        const newComments = [...prevInitiative.comments];
        newComments[index] = updatedComment;
        return { ...prevInitiative, comments: newComments };
      });
      toast.success("Comment updated successfully");
    } catch (e) {
      toast.error("Failed to update comment");
    }
  }, [orgId, projectId, initiative?.id, setInitiative, toast]);

  const deleteComment = useCallback(async (commentId) => {
    try {
      await deleteInitiativeComment(orgId, projectId, initiative.id, commentId);
      setInitiative((prevInitiative) => ({
        ...prevInitiative,
        comments: prevInitiative.comments.filter((c) => c.id !== commentId)
      }));
      toast.success("Comment deleted successfully");
    } catch (e) {
      toast.error("Failed to delete comment");
    }
  }, [orgId, projectId, initiative?.id, setInitiative, toast]);

  return { addComment, updateComment, deleteComment };
}

export default useInitiativeComments;