import React from "react";

const LAPTOP_WIDTH = "w-[300px] md:w-[400px]";
const LAPTOP_HEIGHT = "h-[200px] md:h-[150px]";
const LAPTOP_RADIUS = "rounded-[20px] md:rounded-[24px]";
const LAPTOP_TRANSITION = "transition-all duration-700 ease-out";

function StackedLayers3D() {
  return (
    <div
      className="flex h-[100svh] w-[100svw] items-center justify-center overflow-hidden bg-[#0c0c0c]"
      aria-hidden="true"
    >
      <div
        className="relative flex items-center justify-center"
        style={{ perspective: "400px", transformStyle: "preserve-3d" }}
      >
        {/* Tools Label + Arrow (pointing to bottom layer) */}
        <div className="absolute -left-20 top-12 z-20 flex flex-col items-center">
          <span className="-rotate-10 mb-1 text-xl font-light text-white">
            tools
          </span>
          <svg
            width="80"
            height="60"
            viewBox="0 0 114 82"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="rotate-[15deg]"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M29.4707 77.2106C38.1812 81.5129 48.1736 82.9341 58.7688 81.326C66.0755 80.2419 71.8832 78.1896 81.9261 73.1488C93.8671 67.1656 102.927 60.5791 110.137 52.7506C112.514 50.1544 112.744 49.845 113.02 48.8785C113.407 47.5142 113.144 44.6538 112.466 42.7808C111.791 40.8717 111.605 40.7577 111.06 41.8202C110.058 43.7626 104.724 48.8067 99.3704 52.8497C77.6724 69.2048 58.9988 75.2691 41.1087 71.717C24.9767 68.5368 13.5984 57.796 12.2735 44.5011C11.9947 41.7777 12.7204 38.1863 14.3831 33.9484C16.4049 28.7814 18.8664 23.8679 19.6622 23.3628C20.1024 23.0862 20.0208 22.9145 22.5803 29.5807C25.5359 37.3557 26.8521 39.68 27.8624 39.051C29.31 38.1183 29.0675 28.7867 27.3633 20.1427C26.3899 15.1384 25.9583 13.3494 24.313 7.42554C22.9444 2.42292 22.5566 1.41888 21.922 0.946346C21.3984 0.556525 21.2069 0.747043 18.3766 4.30061C15.9473 7.3142 15.6082 7.65371 5.14396 17.203L0.718241 21.2092L0.548238 22.3159C0.275526 24.1232 0.561027 28.7263 1.06653 30.78C1.50994 32.5531 2.78556 35.7104 3.05026 35.6362C3.50522 35.5556 5.41242 34.4349 7.07615 33.244C8.19932 32.4646 9.14051 31.8457 9.17242 31.8694C9.20433 31.8932 9.24886 33.4557 9.25153 35.3076C9.2634 39.6824 9.35103 41.0056 10.0106 45.7516C11.4391 55.9416 14.694 63.8779 19.9863 70.0382C21.8239 72.1586 26.6703 75.8532 29.4648 77.2185L29.4707 77.2106Z"
              fill="#575757"
            />
          </svg>
        </div>

        {/* LLMs Label + Arrow (pointing to middle layer) */}
        <div className="top-50 absolute -right-40 flex-col items-end gap-3">
          <span className="mb-1 text-xl font-light text-white">LLMs</span>
          <svg
            width="80"
            height="60"
            viewBox="0 0 113 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="rotate-[90deg]"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M60.5175 0.260944C50.812 0.6938 41.3734 4.26882 32.868 10.7881C26.9904 15.2622 22.893 19.8613 16.5271 29.1212C8.9532 40.1222 4.1938 50.2619 1.65425 60.5972C0.824397 64.018 0.771847 64.4001 0.996634 65.3797C1.3159 66.7614 2.92596 69.1402 4.42285 70.4541C5.93524 71.8007 6.15356 71.8106 6.11793 70.6173C6.05889 68.4324 8.29842 61.4409 11.0378 55.3171C22.1557 30.5242 35.5881 16.2048 52.9728 10.6868C68.638 5.69127 83.786 9.61154 91.3595 20.6184C92.9173 22.8697 94.014 26.3656 94.6017 30.88C95.3229 36.3813 95.5368 41.8728 95.0833 42.6991C94.8312 43.1537 94.9855 43.2647 89.5279 38.6599C83.1885 33.2748 80.9144 31.8737 80.3329 32.9121C79.5147 34.4273 84.2283 42.4846 89.8907 49.2345C93.1571 53.1486 94.3981 54.5075 98.6968 58.903C102.309 62.6251 103.133 63.3175 103.917 63.4253C104.563 63.5142 104.639 63.255 105.404 58.7769C106.079 54.9653 106.212 54.5044 110.772 41.0919L112.717 35.4478L112.332 34.3963C111.699 32.6817 109.228 28.7872 107.795 27.2321C106.551 25.8927 103.911 23.7423 103.715 23.935C103.355 24.2251 102.225 26.1267 101.342 27.9724C100.734 29.1969 100.208 30.1931 100.169 30.1876C100.129 30.1822 99.3368 28.835 98.4412 27.2141C96.3206 23.3876 95.6055 22.2707 92.7385 18.4315C86.572 10.1943 79.8926 4.8124 72.2852 1.96895C69.6528 0.997858 63.6253 0.0991446 60.5189 0.251149L60.5175 0.260944Z"
              fill="#575757"
            />
          </svg>
        </div>

        {/* Knowledge Base Label + Arrow (pointing to top layer) */}
        <div
          className="absolute -bottom-20 left-20 z-20 flex items-center gap-3"
          style={{ transform: "translateX(-50%)" }}
        >
          <span className="mb-1 text-xl font-light text-white">
            Knowledge base
          </span>
          <svg
            width="70"
            height="70"
            viewBox="0 0 94 95"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="rotate-[290deg]"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M23.589 89.4265C15.4566 84.1116 9.15402 76.2283 5.15391 66.2864C2.37389 59.4428 1.18956 53.3981 0.426417 42.1871C-0.489776 28.8624 0.577729 17.7122 3.65524 7.52415C4.68303 4.15757 4.83242 3.80191 5.5247 3.07335C6.50308 2.0468 9.10012 0.819435 11.0575 0.450919C13.0448 0.0622169 13.2377 0.164838 12.5994 1.17368C11.436 3.02397 9.80304 10.1815 9.0421 16.8468C5.98503 43.8459 10.2533 63.0099 22.405 76.6117C33.343 88.8883 48.3761 93.2283 60.4992 87.6122C62.9863 86.4681 65.7103 84.0178 68.515 80.432C71.9372 76.0646 74.9178 71.4475 74.9483 70.5054C74.9628 69.9857 75.1521 69.9687 68.1103 71.1525C59.9122 72.5589 57.2415 72.6067 57.2697 71.4168C57.3372 69.6962 65.4969 65.1622 73.8074 62.2365C78.6118 60.5314 80.3719 59.9938 86.3098 58.3999C91.3137 57.036 92.3755 56.8596 93.105 57.1661C93.7068 57.4189 93.6401 57.6806 92.0182 61.9242C90.6576 65.548 90.5376 66.0126 87.6321 79.8779L86.4313 85.7255L85.5646 86.4344C84.1468 87.5878 80.0374 89.6815 78.0119 90.2899C76.2595 90.8093 72.892 91.3154 72.8214 91.0497C72.6596 90.6169 72.6554 88.4049 72.8354 86.3668C72.9358 85.0033 72.9904 83.8782 72.9538 83.8628C72.9171 83.8474 71.5488 84.6032 69.9526 85.5421C66.179 87.7554 64.9948 88.3525 60.5724 90.1966C51.0706 94.1455 42.5814 95.376 34.5863 93.9491C31.8263 93.4443 26.1812 91.1484 23.5851 89.4356L23.589 89.4265Z"
              fill="#575757"
            />
          </svg>
        </div>

        {/* Title */}
        <div className="absolute -top-32 left-1/2 z-10 -translate-x-1/2 transform">
          <h1 className="text-center text-[4em]">
            <span className="font-serif italic text-[#FF5E00]">Knowledge</span>{" "}
            <span className="text-white">architecture</span>
          </h1>
        </div>

        {/* 3D Stack */}
        <div
          className="relative items-center justify-center"
          style={{ perspective: "400px", transformStyle: "preserve-3d" }}
        >
          {/* Bottom Layer - Tools and Evals */}
          <div
            className={`relative ${LAPTOP_WIDTH} ${LAPTOP_HEIGHT} ${LAPTOP_RADIUS} border-8 border-[#232323] bg-[#111111] ${LAPTOP_TRANSITION} hover:translate-y-[2px]`}
            style={{
              transform: "translateZ(-25px) scale(1.25) rotateX(40deg)",
              transformOrigin: "center center",
            }}
          />

          {/* Middle Layer - LLMs */}
          <div
            className={`relative ${LAPTOP_WIDTH} ${LAPTOP_HEIGHT} ${LAPTOP_RADIUS} border-8 border-[#B19C90] bg-[#F0D5C6] ${LAPTOP_TRANSITION} hover:translate-y-[1px]`}
            style={{
              transform: "translateZ(-10px) scale(1) rotateX(60deg)",
              transformOrigin: "center center",
            }}
          />

          {/* Top Layer - Knowledge Base */}
          <div
            className={`relative ${LAPTOP_WIDTH} ${LAPTOP_HEIGHT} ${LAPTOP_RADIUS} border-8 border-[#232323] bg-[#111111] ${LAPTOP_TRANSITION} shadow-[inset_20px_40px_60px_rgba(10,9,9,0.77)] hover:translate-y-[-2px]`}
            style={{
              transform: "translateZ(-5px) scale(1) rotateX(95deg)",
              transformOrigin: "center center",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return <StackedLayers3D />;
}
