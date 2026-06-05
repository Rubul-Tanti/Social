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
} from "@mui/material";
import type { Post } from "../api-services/post/types";
import { Heart, MessageCircle } from "lucide-react";
import usePost from "../hooks/usePost";
import { useState } from "react";
import CommentSection from "./comment";

const PostCard = ({ post }: { post: Post }) => {
  const { likePost, unlikePost } = usePost();
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
    boxShadow:
      "0 0 0 1px rgba(255,255,255,0.03), 0 8px 30px rgba(0,0,0,0.4)",
  }}
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

  {/* Content */}
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
        {post.content}
      </Typography>
    </CardContent>
  )}

  {/* Image */}
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

  {/* Actions */}
  <Box
    sx={{
      p: 1.5,
      borderTop: post.image
        ? "1px solid #262626"
        : "none",
    }}
  >
    <Stack spacing={1} direction="row">
      <IconButton onClick={handleLikeUnlike}>
        <Heart
          size={26}
          fill={post.liked ? "#ef4444" : "none"}
          color={post.liked ? "#ef4444" : "#bdbdbd"}
        />
      </IconButton>

      <IconButton
        onClick={() =>
          setShowComments((prev) => !prev)
        }
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
      onClick={() =>
        setShowComments((prev) => !prev)
      }
    >
      View all {post.commentsCount} comments
    </Typography>
  </Box>

  {showComments && (
    <CommentSection
      postId={post._id}
      showComments={showComments}
    />
  )}
</Card>
  );
};

export default PostCard;