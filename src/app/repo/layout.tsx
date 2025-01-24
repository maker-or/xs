import React from "react"
import Greeting from "~/components/ui/Greeting";
import Navbar from "~/components/ui/Navbar";

export default function layout({
    children,
  }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="p-6">
            <Greeting />
            <Navbar />
            {children}
        </div>
    )
}
