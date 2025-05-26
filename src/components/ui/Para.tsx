import React, { useState } from "react";

interface ShapeData {
  id: string;
  heading: string;
  paragraph: string;
  svg: React.ReactNode;
}

const shapesData: ShapeData[] = [
  {
    id: "square",
    heading: "The Square",
    paragraph: "This is the paragraph associated with the square shape.",
    svg: (
      <svg
        width="86"
        height="86"
        viewBox="0 0 86 86"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="2.40697"
          y="2.40697"
          width="81.1861"
          height="81.1861"
          rx="14.5622"
          fill="currentColor"
        />
        <rect
          x="2.40697"
          y="2.40697"
          width="81.1861"
          height="81.1861"
          rx="14.5622"
          stroke="#AFA9A9"
          strokeWidth="4.81395"
        />
      </svg>
    ),
  },
  {
    id: "triangle",
    heading: "The Triangle",
    paragraph: "This is the paragraph associated with the triangle shape.",
    svg: (
      <svg
        width="78"
        height="68"
        viewBox="0 0 78 68"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M34.6699 4.5C36.5343 1.27083 41.108 1.16985 43.1416 4.19727L43.3301 4.5L74.5068 58.5C76.4313 61.8333 74.0258 66 70.1768 66H7.82324C3.97424 66 1.56866 61.8333 3.49316 58.5L34.6699 4.5Z"
          fill="currentColor"
          stroke="#5C5C5C"
          strokeWidth="4"
        />
      </svg>
    ),
  },
  {
    id: "flower",
    heading: "The Flower",
    paragraph: "This is the paragraph associated with the flower shape.",
    svg: (
      <svg
        width="76"
        height="84"
        viewBox="0 0 76 84"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_d_3564_1676)">
          <path
            d="M27.9742 8.13071C30.8527 -1.9558 45.1473 -1.9558 48.0258 8.13071V8.13071C49.57 13.5414 55.1288 16.7508 60.5867 15.3827V15.3827C70.7611 12.8324 77.9084 25.2118 70.6125 32.748V32.748C66.6988 36.7906 66.6988 43.2094 70.6125 47.252V47.252C77.9084 54.7882 70.7612 67.1676 60.5867 64.6173V64.6173C55.1288 63.2492 49.57 66.4586 48.0258 71.8693V71.8693C45.1473 81.9558 30.8527 81.9558 27.9742 71.8693V71.8693C26.43 66.4586 20.8712 63.2492 15.4133 64.6173V64.6173C5.23885 67.1676 -1.90843 54.7882 5.38747 47.252V47.252C9.3012 43.2094 9.3012 36.7906 5.38747 32.748V32.748C-1.90843 25.2118 5.23885 12.8324 15.4133 15.3827V15.3827C20.8712 16.7508 26.43 13.5414 27.9742 8.13071V8.13071Z"
            fill="currentColor"
          />
          <path
            d="M29.8975 8.67969C32.1875 0.655266 43.4181 0.5298 45.9873 8.30371L46.1025 8.67969C47.9429 15.1283 54.5684 18.9528 61.0732 17.3223C69.2956 15.2616 75.0716 25.266 69.1758 31.3564C64.5113 36.1745 64.5113 43.8255 69.1758 48.6436C75.0716 54.734 69.2956 64.7384 61.0732 62.6777C54.5684 61.0472 47.9429 64.8717 46.1025 71.3203C43.7762 79.472 32.2238 79.472 29.8975 71.3203C28.0571 64.8717 21.4316 61.0472 14.9268 62.6777C6.70435 64.7384 0.928439 54.734 6.82422 48.6436C11.4887 43.8255 11.4887 36.1745 6.82422 31.3564C0.92844 25.266 6.70435 15.2616 14.9268 17.3223C21.4316 18.9528 28.0571 15.1283 29.8975 8.67969Z"
            stroke="#5C5C5C"
            strokeWidth="4"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_3564_1676"
            x="0.538654"
            y="0.56543"
            width="74.9227"
            height="82.6043"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="1.8676" />
            <feGaussianBlur stdDeviation="0.933798" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_3564_1676"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_3564_1676"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    ),
  },
  {
    id: "circle",
    heading: "The Circle",
    paragraph: "This is the paragraph associated with the circle shape.",
    svg: (
      <svg
        width="86"
        height="86"
        viewBox="0 0 86 86"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="2.40697"
          y="2.40697"
          width="81.1861"
          height="81.1861"
          rx="40.593"
          fill="currentColor"
        />
        <rect
          x="2.40697"
          y="2.40697"
          width="81.1861"
          height="81.1861"
          rx="40.593"
          stroke="#5C5C5C"
          strokeWidth="4.81395"
        />
      </svg>
    ),
  },
  {
    id: "star",
    heading: "The Star",
    paragraph: "This is the paragraph associated with the star shape.",
    svg: (
      <svg
        width="90"
        height="90"
        viewBox="0 0 90 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M44.0625 3.29785C44.3847 2.42724 45.6153 2.42722 45.9375 3.29785L56.1504 30.8955C56.6251 32.1784 57.6027 33.2071 58.8506 33.748L59.1045 33.8496L86.7021 44.0625C87.5728 44.3847 87.5728 45.6153 86.7021 45.9375L59.1045 56.1504C57.8216 56.6251 56.7929 57.6027 56.252 58.8506L56.1504 59.1045L45.9375 86.7021C45.6153 87.5728 44.3847 87.5728 44.0625 86.7021L33.8496 59.1045C33.3432 57.7359 32.2641 56.6568 30.8955 56.1504L3.29785 45.9375C2.42724 45.6153 2.42722 44.3847 3.29785 44.0625L30.8955 33.8496C32.2641 33.3432 33.3432 32.2641 33.8496 30.8955L44.0625 3.29785Z"
          fill="currentColor"
          stroke="#5C5C5C"
          strokeWidth="4"
        />
      </svg>
    ),
  },
];

const Para = () => {
  const [activeShapeId, setActiveShapeId] = useState<string | null>(null);

  const handleShapeClick = (id: string) => {
    setActiveShapeId(id);
  };

  // Find the active shape data
  const activeShape = activeShapeId 
    ? shapesData.find(shape => shape.id === activeShapeId) 
    : null;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center py-6 md:py-12 px-4">
      {/* Main Heading - Updates based on selected shape */}
      <h1 className="text-3xl md:text-5xl lg:text-7xl font-light text-white mb-6 md:mb-12 text-center">
        {activeShape ? activeShape.heading : "Heading"}
      </h1>
      
      {/* Desktop view (hidden on mobile) */}
      <div className="hidden md:block w-full mb-16 relative">
        {/* Top dashed line */}
        <div className="absolute top-0 left-0 right-0 border-t-2 border-dashed border-gray-600"></div>
        
        {/* Bottom dashed line */}
        <div className="absolute bottom-0 left-0 right-0 border-t-2 border-dashed border-gray-600"></div>
        
        {/* Vertical dashed lines */}
        {Array(shapesData.length + 1).fill(0).map((_, index) => (
          <div 
            key={`divider-${index}`}
            className="absolute top-0 bottom-0 border-l-2 border-dashed border-gray-600"
            style={{ left: `${(index * 100) / shapesData.length}%` }}
          ></div>
        ))}
        
        {/* Grid content - shapes (horizontal) */}
        <div className="flex flex-row justify-center items-center px-8 py-12">
          {shapesData.map((shape) => (
            <div 
              key={shape.id}
              className={`cursor-pointer transition-all duration-300 px-8 ${
                activeShapeId === shape.id ? "text-white" : "text-gray-600"
              }`}
              onClick={() => handleShapeClick(shape.id)}
            >
              <div className="w-20 h-20 flex items-center justify-center">
                <div className="transform scale-[0.85]">
                  {shape.svg}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Mobile view (hidden on desktop) - Now using a 2x3 grid */}
      <div className="md:hidden w-full mb-8 relative">
        <div className="relative border-2 border-dashed border-gray-600 rounded-lg px-2 py-3">
          {/* Create grid rows */}
          <div className="grid grid-cols-3 gap-2">
            {/* First row: first 3 shapes */}
            <div className="col-span-3 grid grid-cols-3 border-b-2 border-dashed border-gray-600">
              {shapesData.slice(0, 3).map((shape, index) => (
                <React.Fragment key={shape.id}>
                  <div 
                    className={`cursor-pointer transition-all duration-300 py-4 flex justify-center items-center ${
                      index !== 2 ? 'border-r-2 border-dashed border-gray-600' : ''
                    } ${activeShapeId === shape.id ? "text-white" : "text-gray-600"}`}
                    onClick={() => handleShapeClick(shape.id)}
                  >
                    <div className="w-14 h-14 flex items-center justify-center">
                      <div className="transform scale-75">
                        {shape.svg}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
            
            {/* Second row: remaining shapes */}
            <div className="col-span-3 grid grid-cols-3">
              {shapesData.slice(3).map((shape, index, arr) => (
                <React.Fragment key={shape.id}>
                  <div 
                    className={`cursor-pointer transition-all duration-300 py-4 flex justify-center items-center ${
                      index !== arr.length - 1 ? 'border-r-2 border-dashed border-gray-600' : ''
                    } ${activeShapeId === shape.id ? "text-white" : "text-gray-600"}`}
                    onClick={() => handleShapeClick(shape.id)}
                  >
                    <div className="w-14 h-14 flex items-center justify-center">
                      <div className="transform scale-75">
                        {shape.svg}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ))}
              
              {/* If we need to add an empty cell to complete the grid */}
              {shapesData.length % 3 !== 0 && (
                <div className="flex justify-center items-center py-4">
                  {/* Empty cell */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Paragraph Section */}
      <div className="max-w-5xl text-xl md:text-2xl lg:text-4xl text-gray-500 text-center px-4">
        {activeShape ? (
          <p>{activeShape.paragraph}</p>
        ) : (
          <p>paragaph - sjhdawejksvnalksvn aslkvnasnvnasndiv salnv asjdnvnanjdfvbadjnfvbasjnbnafslnbna dfnjlb</p>
        )}
      </div>
    </div>
  );
};

export default Para;