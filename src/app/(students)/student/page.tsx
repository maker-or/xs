"use client";
import CalendarTimeline from "~/components/ui/CalendarTimeline";
import Fold from "~/components/ui/Fold";
import Greeting from "~/components/ui/Greeting";
import Navbar from "~/components/ui/Navbar";



export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0c0c0c] px-4 py-12 sm:px-6 lg:px-8">
      <Greeting />
      <Navbar />
      <Fold />
      <CalendarTimeline />
    </main>
  );
}
