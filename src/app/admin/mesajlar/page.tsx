import { getAdminContactMessages } from "@db/admin-queries";
import { MessagesInbox } from "@/components/admin/messages-inbox";

export default async function AdminMessagesPage() {
  const messages = await getAdminContactMessages();
  return <MessagesInbox messages={messages} />;
}
