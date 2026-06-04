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
import { Heart, MessageSquare } from "lucide-react";
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
          post.likes = post.likes + 1;
          post.liked = true;
        },
      });
    } else {
      unlikePost.mutate(post._id, {
        onSuccess: () => {
          post.likes = post.likes - 1;
          post.liked = false;
        },
      });
    }
  };

  const handleToggleComments = () => {
    setShowComments((prev) => !prev);
  };


  return (
    <Card
      style={{ boxShadow: "none", borderBottom: "1px solid #d3d3d3" }}
      sx={{ maxWidth: 600, mx: "auto", my: 2 }}
    >
      {/* ── Header ── */}
      <CardHeader
        avatar={
          <Avatar
            src={post?.userId?.profilePicture}
            alt={post?.userId?.userName}
          />
        }
        title={
          <Typography variant="h6">{post?.userId?.userName}</Typography>
        }
        subheader={new Date(post?.createdAt).toLocaleString()}
      />

      {/* ── Content ── */}
      <CardContent
        style={{
          overflowX: "hidden",
          maxHeight: "300px",
          overflow: "scroll",
          marginBottom: "10px",
        }}
      >
        <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
          {post?.content}
        </Typography>
      </CardContent>

      {/* ── Image ── */}
      {post?.image && (
        <CardMedia
          component="img"
          image={post.image}
          alt="post image"
          sx={{ maxHeight: 400, objectFit: "cover" }}
        />
      )}

      {/* ── Actions ── */}
      <Box sx={{ px: 2, pb: 1 }}>
        <Stack direction="row" spacing={2}>
          <IconButton onClick={handleLikeUnlike}>
            <Heart
              fill={post.liked ? "#E75480" : "white"}
              color={post.liked ? "pink" : "black"}
            />
            <Typography sx={{ ml: 0.5 }}>{post?.likes}</Typography>
          </IconButton>

          <IconButton onClick={handleToggleComments}>
            <MessageSquare color={showComments ? "#1976d2" : "black"} />
            <Typography sx={{ ml: 0.5 }}>{post?.commentsCount}</Typography>
          </IconButton>
        </Stack>
      </Box>

      {/* ── Comments Section ── */}
      {showComments&&
        <CommentSection postId={post._id} showComments={showComments}/>
      }
    </Card>
  );
};

export default PostCard;