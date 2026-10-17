import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    image: { type: String, default: "" },
    passwordHash: { type: String, select: false },
    providers: { type: [String], default: [] },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    banned: { type: Boolean, default: false },
    bio: { type: String, default: "", maxlength: 300 },
    college: { type: String, default: "", maxlength: 120 },
    location: { type: String, default: "", maxlength: 80 },
    github: { type: String, default: "", maxlength: 120 },
    linkedin: { type: String, default: "", maxlength: 200 },
    website: { type: String, default: "", maxlength: 200 },
    targetExam: { type: String, default: "Infosys SP / DSE", maxlength: 80 },
    targetDate: { type: Date },
    preferredLanguage: { type: String, default: "python" },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: "Problem" }],
    // problems whose solution/editorial/video the user revealed (for honest "assisted" tracking)
    revealed: [{ type: Schema.Types.ObjectId, ref: "Problem" }],
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: string };
export const User: Model<InferSchemaType<typeof UserSchema>> = models.User || model("User", UserSchema);
