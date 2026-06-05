import {
  Box,
  Avatar,
  Typography,
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  IconButton,
  Stack,
  Collapse,
} from "@mui/material";
import type { Post } from "../api-services/post/types";
import { Heart, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import usePost from "../hooks/usePost";
import { useState } from "react";
import CommentSection from "./comment";

const PostCard = ({ post }: { post: Post }) => {
  const { likePost, unlikePost } = usePost();

  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleLikeUnlike = () => {
    if (!post.liked) {
      likePost.mutate(post._id, {
        onSuccess: () => {
          post.likes += 1;
          post.liked = true;
        },
      });
    } else {
      unlikePost.mutate(post._id, {
        onSuccess: () => {
          post.likes -= 1;
          post.liked = false;
        },
      });
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        maxWidth: 600,
        mx: "auto",
        mb: 3,
        border: "1px solid #262626",
        borderRadius: 3,
        overflow: "hidden",
        backgroundColor: "#121212",
        color: "#fff",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.03), 0 8px 30px rgba(0,0,0,0.4)",
      }}
      onClick={() => setExpanded((prev) => !prev)}
    >
      {/* Header */}
      <CardHeader
        sx={{
          py: 1.5,
          borderBottom: "1px solid #262626",
        }}
        avatar={
          <Avatar
            src={post?.userId?.profilePicture}
            sx={{
              width: 40,
              height: 40,
              border: "2px solid #4ade80",
            }}
          />
        }
        action={
          <IconButton sx={{ color: "#888" }}>
            {expanded ? (
              <ChevronUp size={18} />
            ) : (
              <ChevronDown size={18} />
            )}
          </IconButton>
        }
        title={
          <Typography
            sx={{
              color: "#fff",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            {post?.userId?.userName}
          </Typography>
        }
        subheader={
          <Typography
            sx={{
              color: "#888",
              fontSize: "12px",
            }}
          >
            {new Date(post.createdAt).toLocaleDateString()}
          </Typography>
        }
      />

      {/* Content Preview / Full Content */}
      {post.content && (
        <CardContent
          sx={{
            py: 2,
            "&:last-child": {
              pb: 2,
            },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              whiteSpace: "pre-wrap",
              color: "#f5f5f5",
              lineHeight: 1.7,
              fontSize: "15px",
            }}
          >
            {expanded
              ? post.content
              : post.content.length > 150
              ? `${post.content.slice(0, 150)}...`
              : post.content}
          </Typography>

          {!expanded && post.content.length > 150 && (
            <Typography
              sx={{
                mt: 1,
                color: "#8b5cf6",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              Click to read more
            </Typography>
          )}
        </CardContent>
      )}

      {/* Expanded Content */}
      <Collapse in={expanded}>
        {post.image && (
          <CardMedia
            component="img"
            image={post.image}
            alt="Post"
            sx={{
              width: "100%",
              maxHeight: "700px",
              objectFit: "cover",
            }}
          />
        )}

        <Box
          sx={{
            p: 1.5,
            borderTop: post.image
              ? "1px solid #262626"
              : "none",
          }}
        >
          <Stack spacing={1} direction="row">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleLikeUnlike();
              }}
            >
              <Heart
                size={26}
                fill={post.liked ? "#ef4444" : "none"}
                color={post.liked ? "#ef4444" : "#bdbdbd"}
              />
            </IconButton>

            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setShowComments((prev) => !prev);
              }}
            >
              <MessageCircle
                size={26}
                color="#bdbdbd"
              />
            </IconButton>
          </Stack>

          <Typography
            sx={{
              px: 1,
              fontWeight: 600,
              fontSize: "14px",
              color: "#fff",
            }}
          >
            {post.likes} likes
          </Typography>

          <Typography
            sx={{
              px: 1,
              mt: 1,
              color: "#9ca3af",
              fontSize: "13px",
              cursor: "pointer",

              "&:hover": {
                color: "#fff",
              },
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowComments((prev) => !prev);
            }}
          >
            View all {post.commentsCount} comments
          </Typography>

          <CommentSection
            postId={post._id}
            showComments={showComments}
          />
        </Box>
      </Collapse>
    </Card>
  );
};

export default PostCard;