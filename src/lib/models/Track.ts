import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

// A step-by-step study path, e.g. "Crack Infosys SP/DSE".
const TrackSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    description: { type: String, default: "" },
    company: { type: String, default: "" },
    order: { type: Number, default: 100 },
    steps: [
      {
        _id: false,
        title: String,
        goal: String,
        tips: [String],
        resources: [{ _id: false, title: String, url: String }],
        problems: [String], // problem slugs
      },
    ],
  },
  { timestamps: true }
);

export const Track: Model<InferSchemaType<typeof TrackSchema>> = models.Track || model("Track", TrackSchema);
