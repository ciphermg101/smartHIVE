import { useState } from 'react'
import { useApartments, useCreateApartment, useUpdateApartment, useDeleteApartment } from '@hooks/useApartments'
import { Card, CardHeader, CardContent } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Skeleton } from '@components/ui/skeleton'
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@components/ui/dialog'
import { Toaster } from '@components/ui/sonner'
import { Plus, Edit, Trash2 } from 'lucide-react'

interface Apartment {
  id: string
  name: string
  description?: string
}

export default function ApartmentsPage() {
  const { data, isLoading } = useApartments()
  const createApartment = useCreateApartment()
  const updateApartment = useUpdateApartment()
  const deleteApartment = useDeleteApartment()
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', description: '' })

  function openCreate() {
    setEditId(null)
    setForm({ name: '', description: '' })
    setModalOpen(true)
  }

  function openEdit(apartment: Apartment) {
    setEditId(apartment.id)
    setForm({ name: apartment.name, description: apartment.description || '' })
    setModalOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editId) {
      updateApartment.mutate(
        { id: editId, ...form },
        { onSuccess: () => { setModalOpen(false); /* TODO: Add notification */ } }
      )
    } else {
      createApartment.mutate(
        form,
        { onSuccess: () => { setModalOpen(false); /* TODO: Add notification */ } }
      )
    }
  }

  function handleDelete(id: string) {
    if (window.confirm('Delete this apartment?')) {
      deleteApartment.mutate(id, { onSuccess: () => {/* TODO: Add notification */} })
    }
  }

  const apartments: Apartment[] = Array.isArray(data) ? data : []

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Apartments</h1>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} variant="default"><Plus className="mr-2" /> New Apartment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>{editId ? 'Edit Apartment' : 'New Apartment'}</DialogTitle>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
              <Input
                placeholder="Name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
              <Input
                placeholder="Description"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
              <Button type="submit" disabled={createApartment.isPending || updateApartment.isPending}>
                {editId ? 'Update' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-col gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full shimmer" />
          ))
        ) : apartments.length > 0 ? (
          apartments.map((apartment) => (
            <Card key={apartment.id} className="flex flex-col md:flex-row items-center justify-between p-4">
              <CardHeader className="flex-1">
                <h2 className="font-semibold text-lg">{apartment.name}</h2>
                <p className="text-muted-foreground text-sm">{apartment.description}</p>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button variant="secondary" size="icon" onClick={() => openEdit(apartment)}><Edit /></Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(apartment.id)}><Trash2 /></Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-8">No apartments found.</div>
        )}
      </div>
      <Toaster position="top-right" richColors />
    </div>
  )
} 