"use client";

import React, { useState, useEffect } from "react";
import { useFolder } from "../../components/ui/FolderContext";
import { UploadButton } from "../../utils/uploadthing";
import PdfViewer from "./PDFViewer";
import { X } from "lucide-react";
import "@uploadthing/react/styles.css";
import { useAuth } from "@clerk/nextjs";
import useSWR, { mutate } from "swr";
import { useRouter } from 'next/navigation'


interface Image {
  id: number;
  url: string;
  name: string;
}

interface UploadResponse {
  name: string;
  url: string;
  size: number;
  type: string;
}

interface ClientComponentProps {
  images: Image[];
  folderId: number;
}

const ClientComponent: React.FC<ClientComponentProps> = ({
  images: initialImages,
  folderId,
}) => {
  const { folderName, setFolderName } = useFolder();
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      void router.prefetch('/folder');
    }
  }, [router, mounted]);

  const { data: images = initialImages } = useSWR<Image[]>(
    folderId ? `folder-${folderId}-images` : null,
    null,
    {
      fallbackData: initialImages,
      revalidateOnFocus: false,
    }
  );

  const handleFolderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFolderName(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false);
    }
  };

  const openPdfViewer = (url: string) => {
    setSelectedPdfUrl(url);
  };

  const handleUploadComplete = async (response: UploadResponse[]) => {
    if (!response.length) return;

    try {
      const newImages = response.map((file, index) => ({
        id: Date.now() + index,
        url: file.url,
        name: file.name,
      }));

      // Optimistically update the cache
      await mutate(
        `folder-${folderId}-images`,
        [...(images || []), ...newImages],
        false
      );

      // Send the file data to the API
      const uploadPromises = response.map(fileData => 
        fetch('/api/uploadfile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...fileData,
            folderId,
            userId,
          }),
        }).then(res => {
          if (!res.ok) throw new Error('Upload failed');
          return res.json();
        })
      );
      
      await Promise.all(uploadPromises);
      setModalOpen(false);
    } catch (error) {
      console.error('Error updating database:', error);
      // Revert optimistic update on error
      await mutate(`folder-${folderId}-images`, initialImages);
    }
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="mb-4 flex items-center justify-between">
        <div className="w-full">
          {isEditing ? (
            <input
              type="text"
              value={folderName}
              onChange={handleFolderNameChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              className="border-none bg-transparent text-3xl text-orange-600 outline-none"
              aria-label="Edit folder name"
            />
          ) : (
            <h1
              className="cursor-pointer text-3xl"
              onClick={() => setIsEditing(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditing(true)}
            >
              {folderName}
            </h1>
          )}
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="text-md rounded-lg bg-orange-600 px-3 py-1 text-[#f7eee3]"
          aria-label="Upload new file"
        >
          +
        </button>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-modal-title"
        >
          <div className="h-1/2 w-2/3 max-w-lg rounded-lg border-2 border-[#f7eee325] bg-[#0c0c0cae] p-4 backdrop-blur-lg">
            <div className="m-1 flex items-center justify-between p-4">
              <h2 id="upload-modal-title" className="text-lg">Upload Your File</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg bg-orange-600 px-3 py-1 text-[#f7eee3]"
                aria-label="Close upload modal"
              >
                Close
              </button>
            </div>

            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res) {
                  void handleUploadComplete(res);
                }
              }}
              onUploadError={(error: Error) => {
                console.error('Upload error:', error);
              }}
              className="h-2/3 w-full rounded border-2 border-dashed border-[#f7eee3]/30 py-2 text-[#f7eee3] hover:border-[#f7eee3]"
            />
          </div>
        </div>
      )}

      <div className="flex h-[250px] w-full flex-wrap items-start gap-4">
        {images?.map((image, index) => (
          <div
            key={`${image.id}-${index}`}
            className="flex flex-col items-center justify-center gap-6 motion-scale-in-[0.83]"
          >
            <div
              onClick={() => openPdfViewer(image.url)}
              onKeyDown={(e) => e.key === 'Enter' && openPdfViewer(image.url)}
              className="custom-inset relative h-[220px] w-[250px] cursor-pointer rounded-xl border-2 border-[#f7eee3] bg-[#FF5E00] backdrop-blur-lg"
              role="button"
              tabIndex={0}
              aria-label={`Open ${image.name}`}
            >
              <div className="text-md absolute bottom-0 right-0 w-full truncate rounded-b-xl bg-[#f7eee3] px-3 py-1 font-medium text-[#0c0c0c]">
                {image.name}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPdfUrl && (
        <div 
          className="fixed inset-0 flex w-[100svw] bg-orange-700 bg-opacity-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdf-viewer"
        >
          <div className="relative w-[100svw] items-center justify-center rounded-lg bg-[#0c0c0c]">
            <button
              onClick={() => setSelectedPdfUrl(null)}
              className="absolute right-2 top-2 z-10 rounded-full bg-[#f7eee3] p-1 text-[#ff5e00]"
              aria-label="Close PDF viewer"
            >
              <X />
            </button>
            <PdfViewer fileUrl={selectedPdfUrl} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientComponent;