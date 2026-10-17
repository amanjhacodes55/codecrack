import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const SampleSchema = new Schema(
  { input: { type: String, default: "" }, output: { type: String, default: "" }, explanation: { type: String, default: "" } },
  { _id: false }
);
const TestSchema = new Schema(
  { input: { type: String, default: "" }, output: { type: String, default: "" }, sample: { type: Boolean, default: false } },
  { _id: false }
);
const VideoSchema = new Schema(
  { title: String, url: String, kind: { type: String, enum: ["video", "search"], default: "video" } },
  { _id: false }
);
const CheckSchema = new Schema({ name: String, ok: Boolean, detail: String, severity: { type: String, default: "error" } }, { _id: false });

const ProblemSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    tags: { type: [String], default: [], index: true },
    companies: { type: [String], default: [], index: true },
    collections: { type: [String], default: [], index: true },
    source: { type: String, default: "" },
    statement: { type: String, required: true },
    inputFormat: { type: String, default: "" },
    outputFormat: { type: String, default: "" },
    constraints: { type: String, default: "" },
    samples: { type: [SampleSchema], default: [] },
    hints: { type: [String], default: [] },
    editorial: { type: String, default: "", select: false },
    youtube: { type: [VideoSchema], default: [], select: false },
    solution: { type: Map, of: String, default: {}, select: false },
    tests: { type: [TestSchema], default: [], select: false },
    timeLimitMs: { type: Number, default: 2000, min: 500, max: 10000 },
    memoryMb: { type: Number, default: 256, min: 32, max: 1024 },
    starter: { type: Map, of: String, default: {} },

    origin: { type: String, enum: ["official", "community"], default: "official" },
    status: {
      type: String,
      enum: ["draft", "pending", "changes_requested", "rejected", "approved"],
      default: "pending",
      index: true,
    },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    reviewNotes: { type: String, default: "" },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    checks: { type: [CheckSchema], default: [] },
    checkedAt: { type: Date },

    order: { type: Number, default: 1000 },
    stats: {
      submissions: { type: Number, default: 0 },
      accepted: { type: Number, default: 0 },
      solvedBy: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

ProblemSchema.index({ title: "text", tags: "text", statement: "text" });

export type ProblemDoc = InferSchemaType<typeof ProblemSchema> & { _id: string };
export const Problem: Model<InferSchemaType<typeof ProblemSchema>> = models.Problem || model("Problem", ProblemSchema);
