import mongoose, { Document, Schema } from "mongoose";


export interface IPost extends Document {
  userId: mongoose.Types.ObjectId;
  content: string;
  image?: string;
  likes: number;
  commentsCount: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment extends Document {
  targetType: "Post" | "Comment";
  targetId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  likes: number;
  commentsCount: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILike extends Document {
  targetType: "Post" | "Comment";
  targetId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}


async function incrementField(
  targetType: "Post" | "Comment",
  targetId: mongoose.Types.ObjectId,
  field: "likes" | "commentsCount",
  value: 1 | -1
): Promise<void> {
  const collectionName = targetType === "Post" ? "posts" : "comments";
  await mongoose.connection
    .collection(collectionName)
    .updateOne({ _id: targetId }, { $inc: { [field]: value } });
}


const postSchema = new Schema<IPost>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    likes: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const commentSchema = new Schema<IComment>(
  {
    targetType: {
      type: String,
      enum: ["Post", "Comment"],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const likeSchema = new Schema<ILike>(
  {
    targetType: {
      type: String,
      enum: ["Post", "Comment"],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);



postSchema.index({ userId: 1 });
commentSchema.index({ targetId: 1 });
commentSchema.index({ userId: 1 });
likeSchema.index({ targetId: 1, userId: 1 }, { unique: true });


postSchema.pre(/^find/, function (this: mongoose.Query<IPost, IPost>) {
  this.where({ deletedAt: null });
});

commentSchema.pre(/^find/, function (this: mongoose.Query<IComment, IComment>) {
  this.where({ deletedAt: null });
});

likeSchema.post("save", async function (this: ILike) {
  await incrementField(this.targetType, this.targetId, "likes", 1);
});

likeSchema.post("findOneAndDelete", async function (doc: ILike | null) {
  if (!doc) return;
  await incrementField(doc.targetType, doc.targetId, "likes", -1);
});

commentSchema.post("save", async function (this: IComment) {
  await incrementField(this.targetType, this.targetId, "commentsCount", 1);
});

commentSchema.post("findOneAndDelete", async function (doc: IComment | null) {
  if (!doc) return;
  await incrementField(doc.targetType, doc.targetId, "commentsCount", -1);
});


const Post = mongoose.model<IPost>("Post", postSchema);
const Comment = mongoose.model<IComment>("Comment", commentSchema);
const Like = mongoose.model<ILike>("Like", likeSchema);

export { Post, Comment, Like };