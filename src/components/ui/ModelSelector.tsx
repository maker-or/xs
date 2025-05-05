import React from "react";

export type ModelOption = {
  id: string;
  name: string;
  tags?: string[];
  icon: React.ReactNode;
};

interface ModelSelectorProps {
  modelOptions: ModelOption[];
  selectedModel: string;
  showModelSelector: boolean;
  onModelChange(id: string): void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  modelOptions,
  selectedModel,
  showModelSelector,
  onModelChange,
}) => {
  if (!showModelSelector) return null;
  return (
    <div className="absolute bottom-full mb-2 z-10 w-96 rounded-lg bg-[#1a1a1a] shadow-lg border-2 border-[#7B7A7A] p-4">
      <div className="max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
        <div className="grid grid-cols-1 gap-2">
          {modelOptions.map((model) => (
            <button
              key={model.id}
              onClick={() => onModelChange(model.id)}
              className={`p-3 rounded-lg transition-all duration-200 ${selectedModel === model.id ? "bg-[#683D24] border border-[#C9520D]" : "bg-[#252525] hover:bg-[#323232] border border-transparent"}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-lg ${selectedModel === model.id ? "bg-[#C9520D] text-white" : "bg-gray-700 text-gray-300"}`}
                  >
                    {model.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-100 text-left">
                      {model.name}
                    </p>
                    {/* Add tags rendering if needed */}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// const renderModelTags = (tags: string[]) => {
//   if (!tags || tags.length === 0) return null;

//   return (
//     <div className="flex flex-wrap gap-1 mt-0.5">
//       {tags.map((tag, idx) => {
//         // Choose color based on tag type
//         let bgColor = "bg-blue-400/20";
//         let textColor = "text-blue-500";

//         if (tag === "New") {
//           bgColor = "bg-green-400/20";
//           textColor = "text-green-500";
//         } else if (tag === "Experimental") {
//           bgColor = "bg-purple-400/20";
//           textColor = "text-purple-500";
//         } else if (tag === "Fast") {
//           bgColor = "bg-emerald-400/20";
//           textColor = "text-emerald-500";
//         } else if (tag === "Recommended") {
//           bgColor = "bg-blue-400/20";
//           textColor = "text-blue-500";
//         } else if (tag === "Advanced" || tag === "Powerful") {
//           bgColor = "bg-orange-400/20";
//           textColor = "text-orange-500";
//         } else if (tag === "Research" || tag === "Reasoning") {
//           bgColor = "bg-violet-400/20";
//           textColor = "text-violet-500";
//         }

//         return (
//           <span key={idx} className={`text-xs rounded-full px-2 py-0.5 ${bgColor} ${textColor}`}>
//             {tag}
//           </span>
//         );
//       })}
//     </div>
//   );
// };
