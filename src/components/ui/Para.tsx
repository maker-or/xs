import React from 'react'

const Para = () => {
    return (
        <div className="min-w-[100vw] bg-black text-[#a0a0a0] flex flex-col px-8 py-16 gap-16">
            {/* Vision Section */}
            <div className="flex flex-col gap-6">
                <h2 className="text-6xl mb-6">vision</h2>
                <p className="text-2xl leading-relaxed max-w-4xl">
                    &quot;To become the academic infrastructure layer 
                    for colleges and universities — where every 
                    student, teacher, and institution can collaborate, 
                    learn, and grow using tools powered by 
                    intelligence, not complexity.&quot;
                </p>
            </div>

            {/* More student/teacher-focused Section */}
            <div className="flex flex-col gap-6">
                <h2 className="text-3xl font-bold">More student/teacher-focused</h2>
                <p className="text-2xl leading-relaxed max-w-4xl">
                    &quot;To empower every student and teacher with 
                    tools that make learning and teaching simpler, 
                    smarter, and more connected — no matter 
                    where they are.&quot;
                </p>
            </div>

            {/* More tech-forward Section */}
            <div className="flex flex-col gap-6">
                <h2 className="text-3xl font-bold">More tech-forward</h2>
                <p className="text-2xl leading-relaxed max-w-4xl">
                    &quot;To redefine the learning experience with AI-
                    powered systems that adapt to every 
                    institution&apos;s unique needs — creating a future 
                    where educational productivity is effortless and 
                    accessible.&quot;
                </p>
            </div>

            {/* More India-centric Section */}
            <div className="flex flex-col gap-6">
                <h2 className="text-3xl font-bold">More India-centric</h2>
                <p className="text-2xl leading-relaxed max-w-4xl">
                    &quot;To digitally transform the academic ecosystem 
                    of India&apos;s colleges — starting with the 
                    campuses that need it most.&quot;
                </p>
            </div>
        </div>
    )
}

export default Para