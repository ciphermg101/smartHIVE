import Chat from '@routes/shared/Chat';

export default function TenantChatPage() {
  // In a real app, room could be unitId, apartmentId, or userId
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Messaging</h2>
      <Chat room="tenant-global" />
    </div>
  );
} 