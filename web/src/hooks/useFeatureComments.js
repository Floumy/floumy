import { useCallback } from "react";
import { addFeatureComment, deleteFeatureComment, updateFeatureComment } from "../services/roadmap/roadmap.service";
import { useParams } from "react-router-dom";

function useFeatureComments(feature, setFeature, toast) {
  const { orgId, productId } = useParams();
  const addComment = useCallback(async (comment) => {
    try {
      const addedComment = await addFeatureComment(orgId, productId, feature.id, comment);
      setFeature((prevFeature) => ({
        ...prevFeature,
        comments: [...prevFeature.comments, addedComment]
      }));
      toast.success("Comment added successfully");
    } catch (e) {
      toast.error("Failed to add comment");
    }
  }, [orgId, productId, feature?.id, setFeature, toast]);

  const updateComment = useCallback(async (commentId, content) => {
    try {
      const updatedComment = await updateFeatureComment(orgId, productId, feature.id, commentId, content);
      setFeature((prevFeature) => {
        const index = prevFeature.comments.findIndex((c) => c.id === updatedComment.id);
        const newComments = [...prevFeature.comments];
        newComments[index] = updatedComment;
        return { ...prevFeature, comments: newComments };
      });
      toast.success("Comment updated successfully");
    } catch (e) {
      toast.error("Failed to update comment");
    }
  }, [orgId, productId, feature?.id, setFeature, toast]);

  const deleteComment = useCallback(async (commentId) => {
    try {
      await deleteFeatureComment(orgId, productId, feature.id, commentId);
      setFeature((prevFeature) => ({
        ...prevFeature,
        comments: prevFeature.comments.filter((c) => c.id !== commentId)
      }));
      toast.success("Comment deleted successfully");
    } catch (e) {
      toast.error("Failed to delete comment");
    }
  }, [orgId, productId, feature?.id, setFeature, toast]);

  return { addComment, updateComment, deleteComment };
}

export default useFeatureComments;