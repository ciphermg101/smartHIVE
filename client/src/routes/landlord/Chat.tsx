import Chat from '@routes/shared/Chat';

export default function LandlordChatPage() {
  // In a real app, room could be apartmentId, unitId, or userId
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Messaging</h2>
      <Chat room="landlord-global" />
    </div>
  );
} 