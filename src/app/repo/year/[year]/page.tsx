"use client";

// /repo/year/[year]/page.tsx
import React from "react";
import Navyear from "~/components/ui/Navyear";
import useSWR, { type SWRResponse } from "swr";
import Link from "next/link";

interface BranchType {
  branch: string;
}

interface SubjectsType {
  subject: string;
}

interface PageProps {
  params: Promise<{ year: string }>;
}

const Page = (props: PageProps) => {
  const params = React.use(props.params);
  const year = params.year || "";

  const [selectedBranch, setSelectedBranch] = React.useState<string | null>(
    null,
  );
  const [_selectedSubject, setSelectedSubject] = React.useState<string | null>(
    null,
  );

  const fetcher = async () => {
    console.log("year ch: ", year);
    const response = await fetch(`/api/repo/year/${year}`);
    if (!response.ok) throw new Error("Failed to fetch folders");
    return response.json() as Promise<BranchType[]>;
  };

  const { data: branch = [] }: SWRResponse<BranchType[], Error> = useSWR<
    BranchType[],
    Error
  >(`/api/repo/year/${year}`, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });

  const fetchSubjects = async (): Promise<SubjectsType[]> => {
    if (!selectedBranch) return [];
    const response = await fetch(`/api/repo/year/${year}/${selectedBranch}`);
    if (!response.ok) throw new Error("Failed to fetch subjects");
    return response.json() as Promise<SubjectsType[]>;
  };

  const { data: subjects = [] }: SWRResponse<SubjectsType[], Error> = useSWR<
    SubjectsType[],
    Error
  >(
    selectedBranch ? `/api/repo/year/${year}/${selectedBranch}` : null,
    fetchSubjects,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    },
  );

  // Set first branch as default when data is loaded
  React.useEffect(() => {
    if (
      Array.isArray(branch) &&
      branch.length > 0 &&
      !selectedBranch &&
      branch[0]?.branch
    ) {
      setSelectedBranch(branch[0].branch);
    }
  }, [branch, selectedBranch]);

  return (
    <main className="h-[100svh] ">
      <Navyear yearprop={year} />
      {/* Branch suggestions */}
      <div className="text-normal mt-4 flex gap-4 overflow-x-auto p-2">
        {Array.isArray(branch) &&
          branch
            .filter((object) => object?.branch)
            .map((object) => (
              <button
                key={`branch-${object.branch}`}
                className={`whitespace-nowrap rounded-xl px-4 py-2 ${
                  selectedBranch === object.branch
                    ? "bg-[#f7eee3] text-[#000000]"
                    : "bg-[#454545] text-[#f7eee3]"
                } transition-colors hover:bg-[#a3a1a0] hover:text-[#000000]`}
                onClick={() => setSelectedBranch(object.branch)}
              >
                {object.branch}
              </button>
            ))}
      </div>

      {/* Subject list */}
      {selectedBranch && (
        <div className="motion-preset-focus mt-6 flex flex-col items-start justify-center gap-12 overflow-x-auto">
          {Array.isArray(subjects) &&
            subjects
              .filter((item) => item?.subject)
              .map((item, index) => (
                <Link
                  href={`/repo/year/${year}/${selectedBranch}/${item.subject}?category=notes`}
                  key={`${item.subject}_${index}`}
                  className="relative flex w-full cursor-pointer flex-col border-b-2 border-[#f7eee334] p-3 text-3xl uppercase text-[#f7eee3] hover:text-[#FF5E00]"
                  onClick={() => setSelectedSubject(item.subject)}
                >
                  {item.subject}
                </Link>
              ))}
        </div>
      )}
    </main>
  );
};

export default Page;