import { useApartments } from '@hooks/useApartments'
import { Card, CardHeader, CardContent } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Skeleton } from '@components/ui/skeleton'
import { useUserStore } from '@/store/user'
import { useApartmentStore } from '@/store/apartment'
import { ThemeToggle } from '@components/ui/ThemeToggle'

interface Apartment {
  id: string
  name: string
  description?: string
}

export default function ApartmentsPage() {
  const { data, isLoading } = useApartments()
  const profiles = useUserStore((s: any) => s.profiles)
  const setSelectedApartment = useApartmentStore(s => s.setSelectedApartment)
  const setSelectedProfile = useApartmentStore(s => s.setSelectedProfile)
  const selectedApartment = useApartmentStore(s => s.selectedApartment)
  const selectedProfile = useApartmentStore(s => s.selectedProfile)

  // Map apartments to their profile
  const apartments: (Apartment & { profile?: any })[] = Array.isArray(data)
    ? data.map((apt: any) => ({ ...apt, profile: profiles.find((p: any) => p.apartmentId === apt.id) }))
    : []

  function handleSelect(apartmentId: string) {
    setSelectedApartment(apartmentId)
    const profile = profiles.find((p: any) => p.apartmentId === apartmentId) || null
    setSelectedProfile(profile)
  }

  return (
    <div className="max-w-2xl mx-auto py-10 bg-background text-foreground min-h-screen">
      <div className="flex justify-end mb-4">
        <ThemeToggle />
      </div>
      <h1 className="text-2xl font-bold mb-6">Select Apartment</h1>
      <div className="flex flex-col gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full shimmer" />
          ))
        ) : apartments.length > 0 ? (
          apartments.map((apartment) => (
            <Card
              key={apartment.id}
              className={`flex flex-col md:flex-row items-center justify-between p-4 border-2 bg-card dark:bg-zinc-900 border-border ${selectedApartment === apartment.id ? 'border-primary' : 'border-transparent'}`}
            >
              <CardHeader className="flex-1">
                <h2 className="font-semibold text-lg text-foreground">{apartment.name}</h2>
                <p className="text-muted-foreground text-sm">{apartment.description}</p>
                <p className="text-xs mt-1">Role: <span className="font-semibold">{apartment.profile?.role || 'N/A'}</span></p>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button
                  variant={selectedApartment === apartment.id ? 'default' : 'secondary'}
                  onClick={() => handleSelect(apartment.id)}
                >
                  {selectedApartment === apartment.id ? 'Selected' : 'Select'}
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-8">No apartments found.</div>
        )}
      </div>
      {selectedProfile && (
        <div className="mt-8 p-4 border border-border rounded bg-muted">
          <div className="font-semibold">Current Role: {selectedProfile.role}</div>
          <div className="text-xs text-muted-foreground">ApartmentProfile ID: {selectedProfile._id}</div>
        </div>
      )}
    </div>
  )
} 