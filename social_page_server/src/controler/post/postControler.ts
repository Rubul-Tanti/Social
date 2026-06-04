import { ApiError } from "../../middleware/errorHandler";
import { Comment, Like, Post } from "../../Models/postSchma";
import { uploadToCloudinary } from "../../services/uploadToCloudinary";
import logger from "../../utils/logger";
import { createPostSchema } from "../../validation/postValidation";
import { Request, Response } from "express";

//  Helper

export const throwInternalServerError = (): never => {
  throw new ApiError("Internal Server Error", 500);
};

//  Post CRUD

export const createPost = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const userId = req.user?.id;

    const vr = createPostSchema.safeParse(req.body);
    if (!vr.success) {
      logger.warn("Validation failed for creating post", vr.error);
      return res
        .status(400)
        .json({ message: "Validation failed", errors: vr.error.flatten() }); // fixed: was missing ()
    }

    let image: { url: string; public_id: string } | undefined;
    if (file) {
      image = await uploadToCloudinary(file);
    }

    const post = await Post.create({
      content: vr.data.content,
      image: image?.url,
      userId,
    });

    return res.status(201).json({ message: "Post created successfully", post });
  } catch (e) {
    logger.error("Error creating post", e);
    throwInternalServerError();
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = req.user?.id;

    const vr = createPostSchema.safeParse(req.body);
    if (!vr.success) {
      logger.warn("Validation failed for updating post", vr.error);
      return res
        .status(400)
        .json({ message: "Validation failed", errors: vr.error.flatten() });
    }

    const post = await Post.findOne({ _id: postId, userId });
    if (!post) {
      logger.warn("Post not found for updating", postId);
      return res.status(404).json({ message: "Post not found" });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { content: vr.data.content },  // only allow content update here, not likes/counts
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "Post updated successfully", post: updatedPost });
  } catch (e) {
    logger.error("Error updating post", e);
    throwInternalServerError();
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = req.user?.id;

    const post = await Post.findOne({ _id: postId, userId });
    if (!post) {
      logger.warn("Post not found for deletion", postId);
      return res.status(404).json({ message: "Post not found" });
    }


    await Post.findByIdAndUpdate(postId, { deletedAt: new Date() });

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (e) {
    logger.error("Error deleting post", e);
    throwInternalServerError();
  }
};

export const getPost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId).populate(
      "userId",
      "username profilePicture"
    );
    if (!post) {
      logger.warn("Post not found for retrieval", postId);
      return res.status(404).json({ message: "Post not found" });
    }

    return res
      .status(200)
      .json({ message: "Post retrieved successfully", post });
  } catch (e) {
    logger.error("Error getting post", e);
    throwInternalServerError();
  }
};

export const getAllPosts = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { page = 1, limit = 20 } = req.query;

  const [posts, total] = await Promise.all([
    Post.find()
      .populate("userId", "userName profilePicture")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit)),
    Post.countDocuments({ deletedAt: null }),
  ]);

  const postIds = posts.map((p) => p._id);
  const likes = await Like.find({ targetId: { $in: postIds }, targetType: "Post", userId });
  const likedSet = new Set(likes.map((l) => l.targetId.toString()));

  const postsWithLiked = posts.map((p) => ({
    ...p.toObject(),
    liked: likedSet.has(p._id.toString()),
  }));

  return res.status(200).json({
    message: "Posts retrieved successfully",
    data: { posts: postsWithLiked, page: Number(page), limit: Number(limit), total },
  });
};

export const updatePostImage = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = req.user?.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const post = await Post.findOne({ _id: postId, userId });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const image = await uploadToCloudinary(file);
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { image: image.url },
      { new: true }
    );

    return res.status(200).json({
      message: "Post image updated successfully",
      post: updatedPost,
    });
  } catch (e) {
    logger.error("Error updating post image", e);
    throwInternalServerError();
  }
};

//  Like / Unlike

export const likePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id as string;
    const userId = req.user?.id;

    // find by _id only — any user can like any post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    try {
      await Like.create({ targetId:postId, targetType: "Post", userId });
    } catch (e: any) {
      // unique index violation — user already liked this post
      if (e.code === 11000) {
        return res.status(409).json({ message: "Already liked" });
      }
      throw e;
    }

    // middleware handles $inc, but return fresh doc
    const updatedPost = await Post.findById(postId);
    return res
      .status(200)
      .json({ message: "Post liked successfully", data: updatedPost });
  } catch (e) {
    logger.error("Error while liking post", e);
    throwInternalServerError();
  }
};

export const unlikePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = req.user?.id;

    const like = await Like.findOneAndDelete({
      targetId: postId,
      targetType: "Post",
      userId,
    });

    if (!like) {
      return res.status(404).json({ message: "Like not found" });
    }

    // middleware handles $inc, return fresh doc
    const updatedPost = await Post.findById(postId);
    return res
      .status(200)
      .json({ message: "Post unliked successfully", data: updatedPost });
  } catch (e) {
    logger.error("Error while unliking post", e);
    throwInternalServerError();
  }
};

//  Comments

export const createComment = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id as string;
    const userId = req.user?.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = await Comment.create({
      targetId: postId,
      targetType: "Post",
      userId,
      content,
    });
    const populatedComment = await comment.populate("userId", "userName profilePicture");

    // middleware handles commentsCount $inc
    return res
      .status(201)
      .json({ message: "Comment created successfully", populatedComment });
  } catch (e) {
    logger.error("Error creating comment", e);
    throwInternalServerError();
  }
};

export const replyToComment = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.id as string;
    const userId = req.user?.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const reply = await Comment.create({
      targetId: commentId,
      targetType: "Comment",
      userId,
      content,
    });

    return res
      .status(201)
      .json({ message: "Reply created successfully", reply });
  } catch (e) {
    logger.error("Error replying to comment", e);
    throwInternalServerError();
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.id;
    const userId = req.user?.id;

    const comment = await Comment.findOne({ _id: commentId, userId });
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // soft delete
    await Comment.findByIdAndUpdate(commentId, { deletedAt: new Date() });

    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (e) {
    logger.error("Error deleting comment", e);
    throwInternalServerError();
  }
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = req.user?.id;
    const { page = 1, limit = 20 } = req.query;

    const [comments, total] = await Promise.all([
      Comment.find({ targetId: postId, targetType: "Post" })
        .populate("userId", "userName profilePicture")
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit)),
      Comment.countDocuments({ targetId: postId, targetType: "Post", deletedAt: null }),
    ]);

    // fetch all likes by this user for returned comments in one query
    const commentIds = comments.map((c) => c._id);
    const likes = await Like.find({
      targetId: { $in: commentIds },
      targetType: "Comment",
      userId,
    });
    const likedSet = new Set(likes.map((l) => l.targetId.toString()));

    const commentsWithLiked = comments.map((c) => ({
      ...c.toObject(),
      liked: likedSet.has(c._id.toString()),
    }));

    return res.status(200).json({
      message: "Comments retrieved successfully",
      data: {
        comments: commentsWithLiked,
        page: Number(page),
        limit: Number(limit),
        total,
      },
    });
  } catch (e) {
    logger.error("Error getting comments", e);
    throwInternalServerError();
  }
};
export const likeComment = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.id as string ;
    const userId = req.user?.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    try {
      await Like.create({ targetId: commentId, targetType: "Comment", userId });
    } catch (e: any) {
      if (e.code === 11000) {
        return res.status(409).json({ message: "Already liked" });
      }
      throw e;
    }

    const updatedComment = await Comment.findById(commentId);
    return res
      .status(200)
      .json({ message: "Comment liked successfully", data: updatedComment });
  } catch (e) {
    logger.error("Error while liking comment", e);
    throwInternalServerError();
  }
};

export const unlikeComment = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.id;
    const userId = req.user?.id;

    const like = await Like.findOneAndDelete({
      targetId: commentId,
      targetType: "Comment",
      userId,
    });

    if (!like) {
      return res.status(404).json({ message: "Like not found" });
    }

    const updatedComment = await Comment.findById(commentId);
    return res
      .status(200)
      .json({ message: "Comment unliked successfully", data: updatedComment });
  } catch (e) {
    logger.error("Error while unliking comment", e);
    throwInternalServerError();
  }
};