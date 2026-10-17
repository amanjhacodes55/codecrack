import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const NotificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    text: { type: String, required: true, maxlength: 300 },
    link: { type: String, default: "" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);
NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export const Notification: Model<InferSchemaType<typeof NotificationSchema>> =
  models.Notification || model("Notification", NotificationSchema);

/** Fire-and-forget helper; never notifies someone about their own action. */
export async function notify(user: unknown, text: string, link: string, actor?: string) {
  if (!user || (actor && String(user) === actor)) return;
  try {
    await Notification.create({ user, text: text.slice(0, 300), link });
  } catch (e) {
    console.error("notify failed", e);
  }
}
