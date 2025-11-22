//import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
//import Notepad from "./Notepad";

const TrackTypeHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  // ✅ State to toggle modal visibility
  //const [showNotepad, setShowNotepad] = useState(false);

  const tabs = [
    { label: "Tracks", path: "track" },
    { label: "Types", path: "type" },
   
  ];

  return (
    <div className="p-8 bg-white w-full">
      {/* Header */}
    

      {/* Tabs */}
      <div className="flex gap-3 mb-8">
        {tabs.map((tab) => {
          const isActive = location.pathname.endsWith(tab.path);
          //const isNotepad = tab.label === "Your Notepad";

          return (
            <div
              key={tab.path}
              onClick={() =>
                //isNotepad
                  //? setShowNotepad(true)
                  //: 
                  navigate(`/track-type/${tab.path}?id=${id}`)
              }
              className={`px-5 py-2 cursor-pointer rounded-xl text-[1vw] font-medium transition-colors
                ${isActive
                  ? "bg-[#568fce] text-white"
                  : "text-gray-400 bg-white border border-gray-200 hover:border-gray-400"
                }`}
            >
              {tab.label}
            </div>
          );
        })}
      </div>

      {/* Nested Page Content */}
      <Outlet />

      {/* ✅ Notepad Modal */}
      {/* {showNotepad && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <Notepad setShowNotepad={setShowNotepad} />
        </div>
      )} */}
    </div>
  );
};

export default TrackTypeHeader;
