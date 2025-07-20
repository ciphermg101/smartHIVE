import { useApartmentStore } from '@store/apartment'

export default function DashboardPage() {
  const selectedApartment = useApartmentStore(s => s.selectedApartment)
  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Apartment Dashboard</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Apartment ID: <span className="font-mono">{selectedApartment || 'None selected'}</span>
      </p>
      <div className="rounded-lg border p-6 bg-card text-card-foreground shadow">
        <p>Welcome! This is the dashboard for your selected apartment.</p>
        <p className="mt-2 text-sm text-muted-foreground">(Add units, issues, payments, tenants, etc. here.)</p>
      </div>
    </div>
  )
} 