import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const SubmissionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    problem: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
    slug: { type: String, required: true },
    language: { type: String, required: true },
    code: { type: String, required: true, maxlength: 100_000 },
    verdict: { type: String, required: true },
    passed: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    timeMs: { type: Number, default: 0 },
    memoryKb: { type: Number, default: 0 },
    failed: {
      index: Number,
      sample: Boolean,
      input: String,
      expected: String,
      output: String,
      stderr: String,
    },
    compileError: { type: String, default: "" },
    assisted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

SubmissionSchema.index({ user: 1, createdAt: -1 });
SubmissionSchema.index({ user: 1, verdict: 1, problem: 1 });
SubmissionSchema.index({ problem: 1, createdAt: -1 });

export const Submission: Model<InferSchemaType<typeof SubmissionSchema>> =
  models.Submission || model("Submission", SubmissionSchema);
