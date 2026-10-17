import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const DiscussionSchema = new Schema(
  {
    problem: { type: Schema.Types.ObjectId, ref: "Problem", index: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    body: { type: String, required: true, maxlength: 20_000 },
    kind: { type: String, enum: ["question", "solution", "tip", "general"], default: "general" },
    upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    score: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    pinned: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
DiscussionSchema.index({ problem: 1, pinned: -1, score: -1, createdAt: -1 });

const CommentSchema = new Schema(
  {
    discussion: { type: Schema.Types.ObjectId, ref: "Discussion", required: true, index: true },
    parent: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, maxlength: 5000 },
    upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    score: { type: Number, default: 0 },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const NoteSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    problem: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
    body: { type: String, default: "", maxlength: 20_000 },
  },
  { timestamps: true }
);
NoteSchema.index({ user: 1, problem: 1 }, { unique: true });

const DraftSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    problem: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
    language: { type: String, required: true },
    code: { type: String, default: "", maxlength: 100_000 },
  },
  { timestamps: true }
);
DraftSchema.index({ user: 1, problem: 1, language: 1 }, { unique: true });
// Drafts untouched for 120 days are removed automatically.
DraftSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 120 * 24 * 3600 });

export const Discussion: Model<InferSchemaType<typeof DiscussionSchema>> =
  models.Discussion || model("Discussion", DiscussionSchema);
export const Comment: Model<InferSchemaType<typeof CommentSchema>> = models.Comment || model("Comment", CommentSchema);
export const Note: Model<InferSchemaType<typeof NoteSchema>> = models.Note || model("Note", NoteSchema);
export const Draft: Model<InferSchemaType<typeof DraftSchema>> = models.Draft || model("Draft", DraftSchema);
