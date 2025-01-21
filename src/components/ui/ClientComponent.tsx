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
       window.location.reload()
      
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
              className="border-none bg-transparent text-3xl text-[#FF5E00] outline-none"
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
          className="text-md rounded-lg bg-[#FF5E00] px-3 py-1 text-[#f7eee3] "
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
                className="rounded-lg bg-[#FF5E00] px-3 py-1 text-[#f7eee3]"
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
      {images.length === 0 ? (
        <div className="flex w-full justify-end items-end mt-4 ">
          <p className="text-[#f7eee3]/60 font-serif text-lg">
            upload your notes
          </p>
          <svg width="130" height="130" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd"
              d="M102.011 69.0134C112.188 54.4209 119.614 37.7543 118.142 21.2405C117.601 15.1752 115.34 9.56004 113.089 3.79819C112.891 3.29174 112.318 3.04052 111.813 3.23949C111.307 3.43644 111.055 4.0092 111.253 4.51364C113.436 10.1006 115.655 15.5369 116.178 21.4133C117.629 37.6779 110.146 54.0591 100.05 68.3823C99.904 68.3341 99.7581 68.2839 99.6122 68.2336C96.4058 67.1283 91.7303 67.8297 86.8178 69.6364C79.686 72.2571 72.0229 77.1427 67.7902 81.5359C65.8366 83.5617 64.6098 85.5232 64.3519 87.1249C64.1357 88.4594 64.5004 89.6049 65.5345 90.4892C66.3888 91.2167 67.4776 91.6327 68.7539 91.7553C70.4574 91.9181 72.5256 91.5523 74.7761 90.7826C83.1034 87.9348 94.0615 79.5684 97.5779 75.0325C98.6797 73.6116 99.7607 72.1666 100.818 70.6955C101.74 70.9889 102.621 71.2723 103.433 71.62C104.626 72.1304 105.663 72.7756 106.411 73.8648C107.791 75.8745 108.026 78.2842 107.666 80.7481C107.093 84.6932 105.009 88.7729 103.222 91.7814C93.1733 108.703 75.7346 117.058 58.2386 121.551C40.5446 126.097 22.7699 126.692 12.2859 128.037C11.7467 128.107 11.3638 128.601 11.4341 129.14C11.5018 129.679 11.9968 130.06 12.5359 129.992C23.0773 128.64 40.9432 128.029 58.7283 123.461C76.7114 118.84 94.5877 110.18 104.918 92.7863C106.817 89.5848 109.005 85.2297 109.617 81.0315C110.047 78.0631 109.698 75.1711 108.036 72.7514C107.067 71.3406 105.749 70.4684 104.21 69.8092C103.519 69.5138 102.78 69.2606 102.011 69.0134ZM98.8516 70.0564C95.976 69.1239 91.8475 69.8856 87.4976 71.4853C80.6445 74.0035 73.2757 78.6821 69.2071 82.9025C67.8449 84.3173 66.8577 85.6619 66.4487 86.8496C66.1518 87.7077 66.1883 88.4574 66.8134 88.9899C67.5323 89.6029 68.5143 89.834 69.6604 89.824C70.981 89.8139 72.5048 89.4783 74.1405 88.9176C82.1266 86.1864 92.6498 78.1757 96.0203 73.8266C96.9788 72.5887 97.9244 71.3306 98.8516 70.0564Z" fill="#FF5E00" />
            <path fillRule="evenodd" clipRule="evenodd"
              d="M110.052 2.18625C110.502 2.25257 111.075 2.47768 111.677 2.73693C113.039 3.32176 114.493 4.15376 115.196 4.52355C115.678 4.77476 116.274 4.58988 116.527 4.10755C116.78 3.62521 116.592 3.03034 116.11 2.77712C115.251 2.32694 113.323 1.22561 111.727 0.634754C110.906 0.331287 110.151 0.168493 109.606 0.200649C109.072 0.234814 108.713 0.451871 108.458 0.761367C108.189 1.08694 108.03 1.59137 108.051 2.26463C108.075 3.0042 108.309 4.05932 108.395 5.21892C108.468 6.19162 108.437 7.25475 107.952 8.22142C107.707 8.70778 107.903 9.30066 108.39 9.54383C108.874 9.78701 109.468 9.59205 109.71 9.1057C110.622 7.29294 110.424 5.235 110.19 3.60914C110.119 3.1248 110.073 2.52388 110.052 2.18625Z" fill="#FF5E00" />
          </svg>


        </div>
      ) : (
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
      )}

      {/* PDF Viewer Modal */}
      {selectedPdfUrl && (
        <div className="fixed inset-0 flex w-[100svw] bg-[#FF5E00]-700 bg-opacity-50">
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