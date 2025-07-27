import { useState } from "react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Skeleton } from "@components/ui/skeleton";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useMyApartments, useCreateApartment } from "@hooks/useApartments";
import { useApartmentStore } from "@store/apartment";
import type {
  ApartmentForm,
  ApartmentWithProfile,
} from "@/interfaces/apartments";
import { toast } from "sonner";
import {
  uploadApartmentImage,
  validateImageFile,
  createPreviewUrl,
  cleanupPreviewUrl,
  deleteImageFromCloudinary,
  type ImageUploadProgress,
} from "@utils/imageUpload";

const imageUploadConfig = {
  uploadUrl: import.meta.env.VITE_CLOUDINARY_UPLOAD_URL,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const setSelectedApartment = useApartmentStore((s) => s.setSelectedApartment);
  const setSelectedProfile = useApartmentStore((s) => s.setSelectedProfile);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ApartmentForm>({
    name: "",
    description: "",
    location: "",
    imageUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<ImageUploadProgress | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);

  const { data: apartments, isLoading } = useMyApartments();
  const createApartment = useCreateApartment();

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file, { maxSizeBytes: 3 * 1024 * 1024 });
    if (!validation.isValid) {
      setFormError(validation.error!);
      return;
    }

    if (previewUrl) {
      cleanupPreviewUrl(previewUrl);
    }

    setSelectedFile(file);
    setFormError(null);

    const newPreviewUrl = createPreviewUrl(file);
    setPreviewUrl(newPreviewUrl);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim()) {
      setFormError("Apartment name is required.");
      return;
    }

    if (!form.location.trim()) {
      setFormError("Location is required.");
      return;
    }

    setUploading(true);
    setUploadProgress({ progress: 0, stage: 'compressing' });
    let uploadedImageUrl = "";

    try {
      let imageUrl = "";
      if (selectedFile) {
        try {
          imageUrl = await uploadApartmentImage(
            selectedFile,
            imageUploadConfig,
            form.name,
            {
              maxWidth: 1200,
              maxHeight: 1200,
              quality: 0.8,
              maxSizeBytes: 3 * 1024 * 1024,
            },
            (progress: ImageUploadProgress) => setUploadProgress(progress)
          );
          uploadedImageUrl = imageUrl;
        } catch (error) {
          setFormError(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setUploading(false);
          setUploadProgress(null);
          return;
        }
      }

      createApartment.mutate(
        { ...form, imageUrl },
        {
          onSuccess: () => {
            toast.success("Apartment created successfully!", {
              duration: 2000,
              position: "top-center",
            });
            setTimeout(() => {
              setModalOpen(false);
              setForm({ name: "", description: "", location: "", imageUrl: "" });
              setSelectedFile(null);
              if (previewUrl) {
                cleanupPreviewUrl(previewUrl);
              }
              setPreviewUrl("");
              setUploading(false);
              setUploadProgress(null);
            }, 2000);
          },
          onError: async (err: any) => {

            if (uploadedImageUrl) {
              try {
                await deleteImageFromCloudinary(uploadedImageUrl);
                console.log('Cleaned up uploaded image after apartment creation failure');
              } catch (deleteError) {
                console.error('Failed to clean up uploaded image:', deleteError);
              }
            }
            
            setFormError(
              err?.response?.data?.message || "Failed to create apartment."
            );
            setUploading(false);
            setUploadProgress(null);
          },
        }
      );
    } catch (error) {
      if (uploadedImageUrl) {

        try {
          await deleteImageFromCloudinary(uploadedImageUrl);
          console.log('Cleaned up uploaded image after unexpected error');
        } catch (deleteError) {
          console.error('Failed to clean up uploaded image:', deleteError);
        }
      }

      setFormError("An unexpected error occurred. Please try again.");
      setUploading(false);
      setUploadProgress(null);
    }
  }

  function handleSelect(apartment: ApartmentWithProfile) {
    setSelectedApartment(apartment._id);
    setSelectedProfile(apartment);
    navigate("/dashboard");
  }

  const handleModalClose = (open: boolean) => {
    if (!open && previewUrl) {
      cleanupPreviewUrl(previewUrl);
      setPreviewUrl("");
      setSelectedFile(null);
      setUploadProgress(null);
    }
    setModalOpen(open);
  };

  return (
    <div className="min-h-screen bg-gray-300 dark:bg-gray-900 text-gray-700 dark:text-gray-400 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Select Your Apartment
          </h1>

          <Dialog open={modalOpen} onOpenChange={handleModalClose}>
            <DialogTrigger asChild>
              <Button
                variant="default"
                size="lg"
                className="font-semibold px-6 py-3 rounded-lg shadow-md"
              >
                + Register Apartment
              </Button>
            </DialogTrigger>

            {/* Custom grey blurred overlay */}
            {modalOpen && (
              <div
                className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-40"
                onClick={() => handleModalClose(false)}
              />
            )}

            <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-md w-full rounded-xl shadow-2xl p-8 bg-white dark:bg-zinc-900 max-h-[90vh] overflow-y-auto">
              <DialogTitle className="mb-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                Register New Apartment
              </DialogTitle>
              <p className="mb-4 text-sm text-muted-foreground">
                Add a new apartment to your list if you are the owner
              </p>

              <form
                onSubmit={handleCreate}
                className="flex flex-col gap-4"
                noValidate
              >
                <Input
                  placeholder="Apartment Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                  aria-invalid={!!formError && !form.name.trim()}
                />
                <Input
                  placeholder="Description (optional)"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
                <Input
                  placeholder="Location"
                  value={form.location}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location: e.target.value }))
                  }
                  required
                  aria-invalid={!!formError && !form.location.trim()}
                />

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Apartment Image (optional, max 3MB - optimized for faster upload)
                  </span>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploading}
                  />
                </label>

                {uploadProgress && (
                  <div className="space-y-2">
                    <div className="text-sm text-blue-600 animate-pulse">
                      {uploadProgress.stage === 'compressing' && "Compressing image for faster upload..."}
                      {uploadProgress.stage === 'uploading' && "Uploading to Cloudinary..."}
                      {uploadProgress.stage === 'complete' && "Upload complete!"}
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {previewUrl && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Image Preview:</p>
                    <img
                      src={previewUrl}
                      alt="Apartment preview"
                      className="rounded-md border h-32 w-full object-cover"
                    />
                  </div>
                )}

                {formError && (
                  <div
                    className="text-sm text-red-700 bg-red-100 px-3 py-2 rounded border border-red-200"
                    role="alert"
                  >
                    {formError}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={createApartment.isPending || uploading}
                  className="mt-2 w-full py-3 font-semibold text-lg rounded-lg"
                >
                  {createApartment.isPending || uploading
                    ? "Registering..."
                    : "Register"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full shimmer" />
            ))
          ) : apartments?.length ? (
            apartments.map((apartment: ApartmentWithProfile, idx: number) => (
              <div
                key={apartment._id}
                className="group perspective"
                onClick={() =>
                  setFlippedIndex(flippedIndex === idx ? null : idx)
                }
                style={{ cursor: "pointer" }}
              >
                <div
                  className={`relative w-full h-64 transition-transform duration-500 transform ${flippedIndex === idx ? "rotate-y-180" : ""
                    } preserve-3d`}
                >
                  {/* Front Side */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-zinc-900 rounded-xl shadow-lg backface-hidden overflow-hidden">
                    {apartment.imageUrl ? (
                      <img
                        src={apartment.imageUrl}
                        alt={apartment.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gray-200 text-6xl">
                        🏢
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-lg font-bold text-center py-2">
                      {apartment.name}
                    </div>
                  </div>
                  {/* Back Side */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-zinc-900 rounded-xl shadow-lg backface-hidden rotate-y-180 p-4">
                    <h2 className="text-xl font-bold mb-2">{apartment.name}</h2>
                    <p className="text-sm text-muted-foreground mb-1">
                      <span className="font-semibold">Location:</span>{" "}
                      {apartment.location}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">Description:</span>{" "}
                      {apartment.description || "No description"}
                    </p>
                    <Button
                      className="mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(apartment);
                      }}
                    >
                      Select
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8 col-span-full">
              No apartments found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}