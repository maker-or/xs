import React from "react";
import Image from "next/image";
// import Link from "next/link";
import { useRouter } from "next/navigation";

interface FolderProps {
  folderName: string;
  folderId: number;
}

const Folder: React.FC<FolderProps> = ({ folderName, folderId }) => {
  const router = useRouter();
  const handleFolderClick = () => {
    router.push(`/folder/${folderId}`); // Navigate to folder-specific page
  };

  return (
    
      
              <div onClick={handleFolderClick} className="md:-ml-12 flex max-h-60 min-h-52 ml-12 min-w-16 max-w-52 flex-col  ">
        <button className="folder">
          <div className="folder-top text-md p-1 font-medium">{folderName}</div>
          <div className="folder-body p-1">
            <Image
              src="https://utfs.io/f/orc4evzyNtrgG0LJbanCWISJF71dBgAOkMqtNpGcUfix6uL2"
              alt="folder-img"
              width={200}
              height={200}
            />
          </div>
        </button>
      </div>
      


  );
};

export default Folder;

// interface FolderProps {
//   folderName: string;
//   folderId: number;
// }

// const Folder: React.FC<FolderProps> = ({ folderName, folderId }) => {
//   const router = useRouter();

//   const handleFolderClick = () => {
//     router.push(`/folder/${folderId}`); // Navigate to folder-specific page
//   };

//   return (
//     <div
//       onClick={handleFolderClick}
//       className="flex min-w-[150px] cursor-pointer flex-col items-center justify-center p-4"
//     >
//       <div className="h-20 w-20 rounded-lg bg-orange-600"></div>
//       <p className="mt-2 text-center">{folderName}</p>
//     </div>
//   );
// };
