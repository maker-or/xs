"use client";
import React, { useState } from "react";
import Greeting from "~/components/ui/Greeting";
import Navbar from "~/components/ui/Navbar";
import PdfViewer from "~/components/ui/PDFViewer";
import { X } from "lucide-react";
import { ChevronLeft } from "lucide-react";

// Define the type for branches and structure for subjects, chapters, and notes.
type Branch = "CSE";
type Subject = Record<string, Record<string, string>>;
type SubjectsByBranch = Record<Branch, Subject>;
type QuestionPapers = Record<Branch, Record<string, Record<string, string>>>;
const questionPapers: QuestionPapers = {
  CSE: {
    MEFA: {
      "Question Paper 1": "https://utfs.io/f/P1G716yuMhtQZde2dtFmxvlGHNiMpS8X3RuJQWy29waPsk74",
      "Question Paper 2": "https://utfs.io/f/P1G716yuMhtQG0ufXvP17PuIF0Si5LKZ8WXOUfQnYpRMmzJ2",
      "Question Paper 3": "https://utfs.io/f/P1G716yuMhtQXuIXsJjV7aRSlAgJ5Ohx40iLuwbW1ZUnd6vq",
      "Question Paper 4": "https://utfs.io/f/P1G716yuMhtQpnTfud21dGZbO2yhoUa5CQgKYj8iAr7zEeTu",
      "Mid-2" : "https://utfs.io/f/mK0Z48FDIuXriSZHO5o83eYnoCsZhqkyg94Rz1imVjf6dO0A",
      "Mid-1": "https://utfs.io/f/mK0Z48FDIuXrLrnkBnwzo4fbU8Hj2d0iD9YxZPghF1t3nLCk"
    },
    Java: {
      "Question Paper 1": "https://utfs.io/f/mK0Z48FDIuXreAyHBDUTvxkR13w2dPmYXOqzuNWMV7Q0ZrCA",
      "Question Paper 2": "https://utfs.io/f/mK0Z48FDIuXr1AP5etNAb5Q4qFDspItvC3kiKhVrldU9xBgX",
      "Question Paper 3": "https://utfs.io/f/mK0Z48FDIuXrcyDdwsPQ35OVhG0BLfyWdv9bcu2nUqI87kt1",
      "Question Paper 4": "https://utfs.io/f/mK0Z48FDIuXrjh26ys31R1OCMsIfKUgAEzJpd6YuklLZSD85",
    },
    DAA: {
      "Question Paper 1": "https://utfs.io/f/mK0Z48FDIuXraiuHgprxgXrAdsOHinlRxIYWkz50bKcCeQ2h",
      "Question Paper 2": "https://utfs.io/f/mK0Z48FDIuXrN4PFcUhOHlMNW2VArY4XQaJ6GTp5KjFztq9E",
      "Question Paper 3": "https://utfs.io/f/mK0Z48FDIuXrDdeW1eJLb7JIu6ZnPM9pcfrUFWCgGBAXatkq",
      
    },
    ADSAA: {
      "Mid-1": "https://utfs.io/f/mK0Z48FDIuXrLrnkBnwzo4fbU8Hj2d0iD9YxZPghF1t3nLCk",
      "Mid-2": "https://utfs.io/f/mK0Z48FDIuXrLrnkBnwzo4fbU8Hj2d0iD9YxZPghF1t3nLCk",
      "Model-Papper":"https://utfs.io/f/P1G716yuMhtQIGo47uscxKGvwLp0SyegDzTXUhu7lbJQIM5f"
      
    },
    "P&S": {
      "Question Paper 1": "https://utfs.io/f/mK0Z48FDIuXrEEeIPVb6TQmve472sBDdJzYIhGjbOLapg9xA",
      "Question Paper 2": "https://utfs.io/f/mK0Z48FDIuXrjWUEOD1R1OCMsIfKUgAEzJpd6YuklLZSD859",

    },
  },



};

// Define subjects for different branches
const subjects: SubjectsByBranch = {
  CSE: {
    MEFA: {
      chapter1:
        "https://utfs.io/f/P1G716yuMhtQnlZR5Zgdk8T5fVQK7EIMBcmsxYSzCXeWZOG9",
      chapter2:
        "https://utfs.io/f/P1G716yuMhtQY0Apz4CnJFw40xE1UtNmYj69VSuPvZkDA8pR",
      "Chapter 3":
        "https://utfs.io/f/P1G716yuMhtQMNaeq6jibSejnaCKzv2uBFDE7Pp58YGdhsgW",
      "Chapter 4":
        "https://utfs.io/f/P1G716yuMhtQiJUWiRD2LFaTG1ZmRsiXf0I6kNwtoHP3x8pz",
      "Chapter 5":
        "https://utfs.io/f/P1G716yuMhtQPaC012yuMhtQ45xieHKBZq0vpowrLT6I7YyS",
    },
    ADSAA: {
      "ADS_unit_1": "https://utfs.io/f/mK0Z48FDIuXrLrnkBnwzo4fbU8Hj2d0iD9YxZPghF1t3nLCk",
      "ADS_unit_2":"https://utfs.io/f/mK0Z48FDIuXr5S4eZ5AOQIc2HJKdRsZj6Dw84ft1xhpvW5en",
      "ADS_unit_3":"https://utfs.io/f/mK0Z48FDIuXrPjyVqd4T5jvfuLpFUaABNWq48wtkTXGnIYhD",
      "hashing": "https://utfs.io/f/mK0Z48FDIuXrVCsXcdy6QpIwEYKor7laBH0DTVJAUqhtFRZC",
      "material": "https://utfs.io/f/P1G716yuMhtQqRWG7YQbTBdmyaMhzQlHNx3Un2F0CtW7gvEj"
    },
    "P&S": {
      "Chapter 4":"https://utfs.io/f/mK0Z48FDIuXrj5R8In1R1OCMsIfKUgAEzJpd6YuklLZSD859",
      "Chapter 5":"https://utfs.io/f/mK0Z48FDIuXriSZHO5o83eYnoCsZhqkyg94Rz1imVjf6dO0A",
    },
    Java: {
      "Chapter 1":
        "#",
      "Chapter 2":
        "#",
      "Chapter 3":
        "#",
      "Chapter 4":
        "#",
      "Chapter 5":
        "#",
    },
    DAA: {
      "Chapter 1":
        "#",
      "Chapter 2":
        "#",
      "Chapter 3-1":
        "#",
      "Chapter 3-2":
        "#",
      "Chapter 4":
        "#",
      "Chapter 5": "https://utfs.io/f/mK0Z48FDIuXrVCsXcdy6QpIwEYKor7laBH0DTVJAUqhtFRZC",

    },


  },
 


};

const Page = () => {
const [selectedBranch] = useState<Branch>("CSE");
const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"notes" | "questionPapers">(
    "notes",
  );

  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const openPdfViewer = (url: string) => {
    setSelectedPdfUrl(url);
    console.log("the url", url);
  };

  return (
    <div className="p-6">
      <Greeting />
      <Navbar />

      {/* Branch Selection */}
      {/* <div className="mb-6 mt-4 flex items-center gap-8 overflow-x-auto  lg:justify-center">
        {branches.map((branch) => (
          <button
            key={branch}
            onClick={() => {
              setSelectedBranch(branch);
              setSelectedSubject(null);
            }}
            className={`rounded-full px-8 py-2 ${
              selectedBranch === branch
                ? "bg-[#0f7b7c] text-[#f7eee3]"
                : "bg-[#454545] text-[#f7eee3]"
            }`}
          >
            {branch}
          </button>
        ))}
      </div> */}

      {/* Selection between Notes and Question Papers */}
      {selectedSubject === null ? (
        <div className="motion-preset-focus mt-6 flex flex-col items-start justify-center gap-12 overflow-x-auto">
          {Object.keys(subjects[selectedBranch] || {}).map((subject) => (
            <div
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className="relative flex w-full cursor-pointer flex-col border-b-2 border-[#f7eee334] p-3 text-3xl text-[#f7eee3] hover:text-[#FF5E00]-600"
            >
              {/* <div className="absolute bottom-0 right-0 w-full rounded-b-xl bg-[#f7eee3] px-3 py-1 text-center text-lg font-medium text-[#0c0c0c]">
                {subject}
              </div> */}
              {subject}
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="mt-16 flex items-center justify-between p-2">
            <button
              onClick={() => setSelectedSubject(null)}
              className="mb-4 flex rounded-full py-2 text-sm text-[#f7eee3] hover:text-[#FF5E00]-600 lg:text-lg"
            >
              <ChevronLeft />
            </button>
            {/* Type Selection */}
            <div className="mb-4 flex gap-4">
              <button
                onClick={() => setSelectedType("notes")}
                className={`rounded-xl px-3 py-2 text-sm lg:px-4 ${selectedType === "notes" ? "bg-[#f7eee3] text-[#0c0c0c]" : "bg-[#454545] text-[#f7eee3]"}`}
              >
                Notes
              </button>
              <button
                onClick={() => setSelectedType("questionPapers")}
                className={`rounded-xl px-4 py-2 ${selectedType === "questionPapers" ? "bg-[#f7eee3] text-[#0c0c0c]" : "bg-[#454545] text-[#f7eee3]"}`}
              >
                Question Papers
              </button>
            </div>
          </div>

          {/* Content Display based on Type Selection */}
          {selectedType === "notes" ? (
            <div className="flex flex-wrap items-start justify-center gap-6 overflow-x-auto lg:justify-start">
              {selectedSubject &&
                subjects[selectedBranch][selectedSubject] &&
                Object.entries(subjects[selectedBranch][selectedSubject]).map(
                  ([chapter, link]) => (
                    <div
                      key={chapter}
                      className="custom-inset relative h-[220px] w-[250px] cursor-pointer rounded-xl border-2 border-[#f7eee3] bg-[#FF5E00] backdrop-blur-lg"
                      onClick={() => openPdfViewer(link)}
                    >
                      <div className="text-md absolute bottom-0 right-0 w-full text-nowrap rounded-b-xl bg-[#f7eee3] px-3 py-1 font-medium text-[#0c0c0c]">
                        {chapter}
                      </div>
                    </div>
                  ),
                )}
            </div>
          ) : (
            // <div className="flex flex-wrap gap-6 overflow-x-auto">
            //   {/* Example Question Papers; replace with actual data */}
            //   <Link
            //     href={https://cloud.link/to/${selectedBranch}/${selectedSubject}/qp1}
            //     target="_blank"
            //   >
            //     <div
            //       className="custom-inset relative h-[220px] w-[250px] cursor-pointer rounded-xl border-2 border-[#f7eee3] bg-[#FF5E00] backdrop-blur-lg"
            //       onClick={() => openPdfViewer("#")}
            //     >
            //       <div className="text-md absolute bottom-0 right-0 w-full text-nowrap rounded-b-xl bg-[#f7eee3] px-3 py-1 font-medium text-[#0c0c0c]">
            //         {" "}
            //         Question paper1
            //       </div>
            //     </div>
            //   </Link>
            //   <Link
            //     href={https://cloud.link/to/${selectedBranch}/${selectedSubject}/qp2}
            //     target="_blank"
            //   >
            //     <div className="flex h-[100px] w-[200px] items-center justify-center rounded-lg bg-[#434080] p-2 text-center text-[#f7eee3]">
            //       Question Paper 2
            //     </div>
            //   </Link>
            //   {/* Add more question papers as needed */}
            // </div>
            <div className="flex flex-wrap items-start justify-center gap-6 overflow-x-auto lg:justify-start">
              {selectedSubject &&
                questionPapers[selectedBranch][selectedSubject] &&
                Object.entries(
                  questionPapers[selectedBranch][selectedSubject],
                ).map(([paper, link]) => (
                  <div
                    key={paper}
                    className="custom-inset relative h-[220px] w-[250px] cursor-pointer rounded-xl border-2 border-[#f7eee3] bg-[#FF5E00] backdrop-blur-lg"
                    onClick={() => openPdfViewer(link)}
                  >
                    <div className="text-md absolute bottom-0 right-0 w-full text-nowrap rounded-b-xl bg-[#f7eee3] px-3 py-1 font-medium text-[#0c0c0c]">
                      {paper}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
      {selectedPdfUrl && (
        <div className="fixed inset-0 flex w-[100svw] bg-[#FF5E00]-700 bg-opacity-50">
          <div className="relative w-[100svw] items-start justify-center rounded-lg bg-[#0c0c0c]">
            <button
              onClick={() => setSelectedPdfUrl(null)}
              className="absolute right-2 top-2 z-10 rounded-full bg-[#f7eee3] p-1 text-[#ff5e00]"
              aria-label="Close PDF Viewer"
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

export default Page;