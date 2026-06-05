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
    <Divider
      sx={{
        borderColor: "#262626",
      }}
    />

    {/* Comment Input */}
    <Box
      sx={{
        p: 2,
        display: "flex",
        gap: 1,
        alignItems: "center",
        backgroundColor: "#121212",
      }}
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
        sx={{
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#1a1a1a",
            color: "#fff",
            borderRadius: 3,

            "& fieldset": {
              borderColor: "#333",
            },

            "&:hover fieldset": {
              borderColor: "#555",
            },

            "&.Mui-focused fieldset": {
              borderColor: "#8b5cf6",
            },
          },

          "& .MuiInputBase-input::placeholder": {
            color: "#888",
            opacity: 1,
          },
        }}
      />

      <IconButton
        onClick={handleSubmitComment}
        disabled={!commentInput.trim() || createComment.isPending}
        sx={{
          color: "#8b5cf6",

          "&:hover": {
            backgroundColor: "rgba(139,92,246,0.15)",
          },
        }}
      >
        <Send size={20} />
      </IconButton>
    </Box>

    <Divider sx={{ borderColor: "#262626" }} />

    {/* Comment List */}
    <Box
      sx={{
        px: 2,
        py: 1,
        maxHeight: 320,
        overflowY: "auto",
        backgroundColor: "#121212",

        "&::-webkit-scrollbar": {
          width: 6,
        },

        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#333",
          borderRadius: 10,
        },
      }}
    >
      {commentsLoading ? (
        <Typography
          variant="body2"
          sx={{
            py: 2,
            color: "#888",
          }}
        >
          Loading comments...
        </Typography>
      ) : localComments.length === 0 ? (
        <Typography
          variant="body2"
          sx={{
            py: 2,
            color: "#888",
          }}
        >
          No comments yet. Be the first!
        </Typography>
      ) : (
        localComments.map((comment) => (
          <Box
            key={comment._id}
            sx={{
              display: "flex",
              gap: 1.5,
              py: 1.5,
            }}
          >
            <Avatar
              src={comment?.userId?.profilePicture}
              alt={comment?.userId?.userName}
              sx={{
                width: 32,
                height: 32,
                mt: 0.5,
              }}
            />

            <Box
              sx={{
                flex: 1,
                backgroundColor: "#1a1a1a",
                border: "1px solid #262626",
                borderRadius: 3,
                px: 1.5,
                py: 1,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: "#fff",
                  fontWeight: 600,
                }}
              >
                {comment?.userId?.userName}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "pre-line",
                  color: "#d1d5db",
                  mt: 0.5,
                }}
              >
                {comment?.content}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mt: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "#777",
                    fontSize: "11px",
                  }}
                >
                  {new Date(
                    comment?.createdAt
                  ).toLocaleDateString()}
                </Typography>

                <button
                  onClick={() =>
                    handleLikeUnlike(comment)
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    border: "none",
                    background: "transparent",
                    color: comment.liked
                      ? "#8b5cf6"
                      : "#888",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  <ThumbsUp
                    size={14}
                    fill={
                      comment.liked
                        ? "#8b5cf6"
                        : "none"
                    }
                    color={
                      comment.liked
                        ? "#8b5cf6"
                        : "#888"
                    }
                  />
                  {comment.likes || 0}
                </button>
              </Box>
            </Box>
          </Box>
        ))
      )}
    </Box>
  </Collapse>
);
};

export default CommentSection;