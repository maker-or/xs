"use client";
import React from "react";
import Navyear from "~/components/ui/Navyear";
import useSWR, { type SWRResponse } from 'swr';
import Link from "next/link";
interface SubjectsType {
    // year: string;
    // tags: string;
    subject: string
}


// Define the type for branches and structure for subjects, chapters, and notes.
type Branch = "CSE";

const Page = ({ params }: { params: Promise<{ year: string }> }) => {
    const { year } = React.use(params);
    const fetcher = async () => {
        console.log('year ch: ', year)
        const response = await fetch(`/api/repo/year/${year}`);
        if (!response.ok) throw new Error("Failed to fetch folders");
        return response.json() as Promise<SubjectsType[]>;
    };


    const { data: subjects = [] }: SWRResponse<SubjectsType[], Error> = useSWR<SubjectsType[], Error>(`/api/repo/year/${year}`, fetcher, {
        revalidateOnFocus: false,
        revalidateIfStale: false,
    });

    console.log('check:', subjects)
    return (
        <>
        
            
            <Navyear yearprop={year} />
            <div className="motion-preset-focus mt-6 flex flex-col items-start justify-center gap-12 overflow-x-auto">
                {subjects.map((object, index) => (
                    <Link href={`/repo/year/${year}/${object.subject}?category=notes`}
                        key={`${object.subject}_${index}`}
                        className="relative uppercase flex w-full cursor-pointer flex-col border-b-2 border-[#f7eee334] p-3 text-3xl text-[#f7eee3] hover:text-[#FF5E00]"
                    >
                        {/* <div className="absolute bottom-0 right-0 w-full rounded-b-xl bg-[#f7eee3] px-3 py-1 text-center text-lg font-medium text-[#0c0c0c]">
                        {subject}
                    </div> */}
                        {object.subject}
                    </Link>
                ))}
            </div>
        </>
    )
}

export default Page;
