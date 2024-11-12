import { useCallback } from "react";
import { addFeatureComment, deleteFeatureComment, updateFeatureComment } from "../services/roadmap/roadmap.service";

function useFeatureComments(feature, setFeature, toast) {
  const addComment = useCallback(async (comment) => {
    try {
      const addedComment = await addFeatureComment(feature.id, comment);
      setFeature((prevFeature) => ({
        ...prevFeature,
        comments: [...prevFeature.comments, addedComment]
      }));
      toast.success("Comment added successfully");
    } catch (e) {
      toast.error("Failed to add comment");
    }
  }, [feature?.id, setFeature, toast]);

  const updateComment = useCallback(async (commentId, content) => {
    try {
      const updatedComment = await updateFeatureComment(feature.id, commentId, content);
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
  }, [feature?.id, setFeature, toast]);

  const deleteComment = useCallback(async (commentId) => {
    try {
      await deleteFeatureComment(feature.id, commentId);
      setFeature((prevFeature) => ({
        ...prevFeature,
        comments: prevFeature.comments.filter((c) => c.id !== commentId)
      }));
      toast.success("Comment deleted successfully");
    } catch (e) {
      toast.error("Failed to delete comment");
    }
  }, [feature?.id, setFeature, toast]);

  return { addComment, updateComment, deleteComment };
}

export default useFeatureComments;