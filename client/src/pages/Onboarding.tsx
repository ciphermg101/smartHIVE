import { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Card, CardHeader, CardContent } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Skeleton } from '@components/ui/skeleton'
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@components/ui/dialog'
import { useNavigate } from 'react-router-dom'
import { useMyApartments, useCreateApartment } from '@hooks/useApartments'
import { useApartmentStore } from '@store/apartment'
import type { Apartment, ApartmentForm } from '@/interfaces/apartments'

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function OnboardingPage() {
  const { user } = useUser()
  const role = user?.publicMetadata?.role as string
  const navigate = useNavigate()
  const setSelectedApartment = useApartmentStore((s) => s.setSelectedApartment)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<ApartmentForm>({ name: '', description: '', location: '', imageUrl: '' })
  const [uploading, setUploading] = useState(false)
  const { data, isLoading } = useMyApartments()
  const createApartment = useCreateApartment()
  const [formError, setFormError] = useState<string | null>(null)

  async function handleImageUpload(file: File) {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body: formData })
    const data = await res.json()
    setUploading(false)
    return data.secure_url as string
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const url = await handleImageUpload(file)
      setForm(f => ({ ...f, imageUrl: url }))
    }
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!form.name.trim()) {
      setFormError('Apartment name is required.')
      return
    }
    if (!form.location.trim()) {
      setFormError('Location is required.')
      return
    }
    createApartment.mutate(form, {
      onSuccess: () => {
        setModalOpen(false)
        setForm({ name: '', description: '', location: '', imageUrl: '' })
        setFormError(null)
      },
      onError: (err: any) => {
        setFormError(err?.response?.data?.message || 'Failed to create apartment.')
      }
    })
  }

  function handleSelect(apartment: Apartment) {
    setSelectedApartment(apartment)
    navigate(`/dashboard/${apartment.id}`)
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Select Your Apartment</h1>
        {role === 'owner' && (
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="lg" className="font-semibold px-6 py-3 rounded-lg shadow-md">
                + Register Apartment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md w-full" aria-modal="true" aria-labelledby="register-apartment-title">
              <DialogTitle id="register-apartment-title" className="mb-2">Register New Apartment</DialogTitle>
              <form onSubmit={handleCreate} className="flex flex-col gap-4 mt-2" noValidate>
                <Input
                  placeholder="Name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  aria-required="true"
                  aria-invalid={!!formError && !form.name.trim()}
                />
                <Input
                  placeholder="Description (optional)"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
                <Input
                  placeholder="Location"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  required
                  aria-required="true"
                  aria-invalid={!!formError && !form.location.trim()}
                />
                <Input type="file" accept="image/*" onChange={handleImageChange} />
                {uploading && <div className="text-sm text-muted-foreground">Uploading image...</div>}
                {form.imageUrl && <img src={form.imageUrl} alt="Preview" className="w-32 h-32 object-cover rounded" />}
                {formError && <div className="text-red-500 text-sm" role="alert">{formError}</div>}
                <Button type="submit" disabled={createApartment.isPending || uploading} className="mt-2">
                  Register
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full shimmer" />
          ))
        ) : data && data.length > 0 ? (
          data.map((apartment: any) => (
            <Card key={apartment.id} className="flex flex-col items-center p-4">
              <CardHeader>
                {apartment.imageUrl ? (
                  <img src={apartment.imageUrl} alt={apartment.name} className="w-24 h-24 object-cover rounded mb-2" />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded mb-2 flex items-center justify-center text-4xl">🏢</div>
                )}
                <h2 className="font-semibold text-lg text-center">{apartment.name}</h2>
                <p className="text-muted-foreground text-sm text-center">{apartment.location}</p>
              </CardHeader>
              <CardContent>
                <Button onClick={() => handleSelect(apartment)} className="w-full mt-2">Select</Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-8 col-span-full">No apartments found.</div>
        )}
      </div>
    </div>
  )
} 