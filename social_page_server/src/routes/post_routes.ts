import express from "express";
import { uploadMiddleware } from "../middleware/multer";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPost,
  likePost,
  unlikePost,
  updatePost,
  updatePostImage,
  createComment,
  replyToComment,
  deleteComment,
  getComments,
  likeComment,
  unlikeComment,
} from "../controler/post/postControler";
import authorizationMiddleware from "../middleware/authentication";
import { asyncError, multerErrorHandler } from "../middleware/errorHandler";

const postRoutes = express.Router();

//  Posts
postRoutes.get("/",authorizationMiddleware([]), asyncError(getAllPosts));
postRoutes.post("/", authorizationMiddleware([]), uploadMiddleware.single("file"), asyncError(createPost));
postRoutes.get("/:id", authorizationMiddleware([]), asyncError(getPost));
postRoutes.put("/:id", authorizationMiddleware([]), asyncError(updatePost));
postRoutes.delete("/:id", authorizationMiddleware([]), asyncError(deletePost));
postRoutes.put("/:id/post-image", authorizationMiddleware([]), uploadMiddleware.single("image"), asyncError(updatePostImage));

//  Post Likes
postRoutes.post("/:id/like", authorizationMiddleware([]), asyncError(likePost));
postRoutes.delete("/:id/like", authorizationMiddleware([]), asyncError(unlikePost));

//  Comments
postRoutes.get("/:id/comments", authorizationMiddleware([]), asyncError(getComments));
postRoutes.post("/:id/comments", authorizationMiddleware([]), asyncError(createComment));
postRoutes.delete("/comments/:id", authorizationMiddleware([]), asyncError(deleteComment));

//  Comment Replies
postRoutes.post("/comments/:id/reply", authorizationMiddleware([]), asyncError(replyToComment));

//  Comment Likes
postRoutes.post("/comments/:id/like", authorizationMiddleware([]), asyncError(likeComment));
postRoutes.delete("/comments/:id/like", authorizationMiddleware([]), asyncError(unlikeComment));

//  Multer error handler (must be last)
postRoutes.use(multerErrorHandler);

export default postRoutes;