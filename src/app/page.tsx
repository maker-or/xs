"use client";
import CalendarTimeline from "~/components/ui/CalendarTimeline";
import Fold from "~/components/ui/Fold";
import Greeting from "~/components/ui/Greeting";
import Navbar from "~/components/ui/Navbar";


export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#000000] ">
      <Greeting />
      <Navbar />
      <Fold />
      <CalendarTimeline />
    </main>
  );
}
