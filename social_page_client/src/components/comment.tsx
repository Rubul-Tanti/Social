import {
  Box,
  Avatar,
  Typography,
  IconButton,
  TextField,
  Divider,
  Collapse,
} from "@mui/material";
import { useState, useEffect } from "react";          // fixed: added useEffect
import useComment from "../hooks/useComment";
import {  Send, ThumbsUp } from "lucide-react";
import type { Comment } from "../api-services/post/types";

const CommentSection = ({
  showComments,
  postId,
}: {
  postId: string;
  showComments: boolean;
}) => {
  const [commentInput, setCommentInput] = useState("");
  const { createComment, getComments,unlikecomment,likeComment } = useComment();

  const { data, isLoading: commentsLoading } = getComments(postId);

  const [localComments, setLocalComments] = useState<Comment[]>([]); // fixed: IComment not Comment

  useEffect(() => {
    if (data?.data?.comments) {
      setLocalComments(data.data.comments);
    }
  }, [data]);

  const handleSubmitComment = () => {
    const trimmed = commentInput.trim();
    if (!trimmed) return;

    setCommentInput("");

    createComment.mutate(
      { id: postId, content: trimmed },
      {
        onSuccess: (res) => {
          setLocalComments((prev) =>[res.populatedComment,...prev]);
        },
        onError: () => {
        },
      }
    );
  };
    const handleLikeUnlike = (comment:Comment) => {
    if (!comment.liked) {
      likeComment.mutate(comment._id, {
        onSuccess: () => {
          comment.likes = (comment.likes||0) + 1;
          comment.liked = true;
        },
      });
    } else {
      unlikecomment.mutate(comment._id, {
        onSuccess: () => {
          comment.likes = (comment.likes||1) - 1;
          comment.liked = false;
        },
      });
    }
  };



  return (
    <Collapse in={showComments}>
      <Divider />

      {/* Comment Input */}
      <Box
        sx={{ px: 2, py: 1.5, display: "flex", gap: 1, alignItems: "center" }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Write a comment..."
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmitComment();
            }
          }}
          multiline
          maxRows={4}
        />
        <IconButton
          onClick={handleSubmitComment}
          disabled={!commentInput.trim() || createComment.isPending}
          color="primary"
        >
          <Send size={20} />
        </IconButton>
      </Box>

      <Divider />

      {/* Comment List */}
      <Box sx={{ px: 2, py: 1, maxHeight: 320, overflowY: "auto" }}>
        {commentsLoading ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
            Loading comments...
          </Typography>
        ) : localComments.length === 0 ? (       // fixed: localComments not commentsData
          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
            No comments yet. Be the first!
          </Typography>
        ) : (
          localComments.map((comment) => (        // fixed: localComments not commentsData
            <Box key={comment._id} sx={{ display: "flex", gap: 1.5, py: 1.5 }}>
              <Avatar
                src={comment?.userId?.profilePicture}
                alt={comment?.userId?.userName}
                sx={{ width: 32, height: 32, mt: 0.5 }}
              />
              <Box
                sx={{
                  backgroundColor: "#f0f2f5",
                  borderRadius: 3,
                  px: 1.5,
                  py: 1,
                  flex: 1,
                }}
              >
                <Typography variant="subtitle2">
                  {comment?.userId?.userName}
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                  {comment?.content}
                </Typography>
                <div style={{display:"flex", flexDirection:"row", gap:10,alignItems:"center"}}>

                <Typography
                  variant="caption"
                  style={{ fontSize: "10px" }}
                  color="text.secondary"
                  >
                  {new Date(comment?.createdAt).toLocaleDateString()}
                </Typography>

                    <button onClick={()=>{handleLikeUnlike(comment)}} style={{display:"flex",gap:"5px",border:'none'}}>
                        <ThumbsUp fill={comment.liked?"black":"white"}  style={{cursor:'pointer',}}  size={14}/>
                    {comment.likes}
                    </button>
                    {/* <MessageSquare size={14}/> */}
                    </div>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Collapse>
  );
};

export default CommentSection;