import { withUser, json } from "@/lib/api";
import { Notification } from "@/lib/models/Notification";

export const GET = withUser(async (_req, _ctx, user) => {
  const [items, unread] = await Promise.all([
    Notification.find({ user: user.id }).sort({ createdAt: -1 }).limit(20).lean(),
    Notification.countDocuments({ user: user.id, read: false }),
  ]);
  return json({ unread, items: items.map((n) => ({ id: String(n._id), text: n.text, link: n.link, read: n.read, createdAt: n.createdAt })) });
});

// Mark all as read
export const POST = withUser(async (_req, _ctx, user) => {
  await Notification.updateMany({ user: user.id, read: false }, { $set: { read: true } });
  return json({ ok: true });
});
