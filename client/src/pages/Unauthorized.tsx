export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Unauthorized</h1>
      <p className="text-lg text-muted-foreground">You do not have permission to access this page.</p>
    </div>
  )
} 