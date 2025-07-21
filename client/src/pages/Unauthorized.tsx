import { ThemeToggle } from '@components/ui/ThemeToggle'

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="flex justify-end w-full max-w-md mx-auto mb-4">
        <ThemeToggle />
      </div>
      <h1 className="text-3xl font-bold mb-4">Unauthorized</h1>
      <p className="text-lg text-muted-foreground">You do not have permission to access this page.</p>
    </div>
  )
} 