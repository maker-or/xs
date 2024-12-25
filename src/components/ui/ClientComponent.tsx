"use client";

import React, { useState } from "react";
import { useFolder } from "../../components/ui/FolderContext";
import { UploadButton } from "../../utils/uploadthing";
import PdfViewer from "./PDFViewer";
import { X } from "lucide-react";
import "@uploadthing/react/styles.css";
import { useAuth } from "@clerk/nextjs";




interface ClientComponentProps {
  images: { id: number; url: string; name: string }[];
  folderId: number;
}




const ClientComponent: React.FC<ClientComponentProps> = ({
  images,
  folderId,
}) => {
  const { folderName, setFolderName } = useFolder();
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);

  // Handle folder name changes
  const handleFolderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFolderName(e.target.value);
  };

  // Close edit mode on blur
  const handleBlur = () => {
    setIsEditing(false);
  };

  // Save folder name on Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditing(false);
    }
  };

  // Open PDF Viewer with the selected file
  const openPdfViewer = (url: string) => {
    setSelectedPdfUrl(url);
  };
  const userId = useAuth();
  console.log(folderId);

  const handleUploadComplete = async (response: Array<{
    name: string;
    url: string;
    size: number;
    type: string;
     //userId: string;
    // folderId: number;
  }>) => {
    try {
      // Send the file data to our new API route
      const uploadPromises = response.map(fileData => 
        fetch('/api/uploadfile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...fileData,
            folderId: folderId,
            userId: userId,
             
          }),
        })
      );

      await Promise.all(uploadPromises);
      setModalOpen(false);
      
      // You might want to refresh your images list here
      // Either through a server action or by refetching the data
    } catch (error) {
      console.error('Error updating database:', error);
    }
  };



  return (
    <div className="flex w-full flex-col gap-2">
      {/* Folder Name */}
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
            />
          ) : (
            <h1
              className="cursor-pointer text-3xl"
              onClick={() => setIsEditing(true)}
            >
              {folderName}
            </h1>
          )}
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="text-md rounded-lg bg-orange-600 px-3 py-1 text-[#f7eee3] "
        >
          +
        </button>
      </div>

      {/* Modal for Upload */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          aria-hidden={!isModalOpen}
        >
          <div className="h-1/2 w-2/3 max-w-lg rounded-lg border-2 border-[#f7eee325] bg-[#0c0c0cae] p-4 backdrop-blur-lg">
            <div className="m-1 flex items-center justify-between p-4">
              <h2 className="text-lg">Upload Your File</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg bg-orange-600 px-3 py-1 text-[#f7eee3]"
                aria-label="Close Modal"
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
              className="h-2/3 w-full rounded border-2 border-dashed border-[#f7eee3]/30 py-2 text-[#f7eee3] hover:border-[#f7eee3]"
            />
          </div>
        </div>
      )}

      {/* Images Grid */}
      <div className="item-center flex h-[250px] w-full flex-wrap gap-4 ">
        {images?.map((image, index) => (
          <div
            key={`${image.id}-${index}`}
            className="flex flex-col items-center justify-center gap-6 motion-scale-in-[0.83]  "
          >
            <div
              onClick={() => openPdfViewer(image.url)}
              className="custom-inset relative h-[220px] w-[250px] cursor-pointer rounded-xl border-2 border-[#f7eee3] bg-[#FF5E00] backdrop-blur-lg"
            >
              <div className="text-md absolute bottom-0 right-0 w-full text-nowrap rounded-b-xl bg-[#f7eee3] px-3 py-1 font-medium text-[#0c0c0c]">
                {image.name}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PDF Viewer Modal */}
      {selectedPdfUrl && (
        <div className="fixed inset-0 flex w-[100svw] bg-orange-700 bg-opacity-50">
          <div className="relative w-[100svw]  items-center justify-center rounded-lg bg-[#0c0c0c] ">
            <button
              onClick={() => setSelectedPdfUrl(null)}
              className="absolute right-2 top-2 z-10 rounded-full bg-[#f7eee3] p-1 text-[#ff5e00]"
              aria-label="Close PDF Viewer"
            >
              <X />
            </button>
            <PdfViewer fileUrl={selectedPdfUrl}/>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientComponent;