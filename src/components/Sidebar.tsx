import {
  BookOpen,
  File,
  FolderOpen,
  Globe,
  Mail,
  Monitor,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // ✅ import this

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState("DASHBOARD");
  const navigate = useNavigate(); // ✅ initialize navigate
  const location = useLocation();

  const menuItems = [
    { icon: Monitor, label: "Dashboard", path: "/" },
    { icon: Users, label: "Users", path: "/users" },
    //{ icon: FileText, label: "ARTICLE REVIEWS", path: "/article-reviews" },
    //{ icon: UserCheck, label: "REVIEWERS", path: "/reviewers" },
    { icon: BookOpen, label: "Journals", path: "/journals" },
    { icon: Globe, label: "Conferences", path: "/conferences" },
    { icon: Mail, label: "Tempelates & Emails", path: "/tempelate-email-setting" },

    { icon: FolderOpen, label: "Topics", path: "topic/topics-page" },
    { icon: File, label: "Tracks,Types ", path: "track-type/track" },
    //{ icon: TrendingUp, label: "NEWS", path: "/news" },
    //{ icon: Mail, label: "NOTIFICATIONS", path: "/notifications" },
    //{ icon: Zap, label: "FAST-TRACK", path: "/fast-track" },
  ];

  useEffect(() => {
    const currentItem = menuItems.find(
      (item) => item.path === location.pathname
    );
    if (currentItem) setActiveItem(currentItem.label);
  }, [location.pathname]);

  const handleClick = (item: (typeof menuItems)[number]) => {
    setActiveItem(item.label);
    navigate(item.path); // ✅ navigate to the path
  };

  return (
    <aside className="w-60 !bg-[#3D7AB5] h-screen text-white flex flex-col">
      {/* User Profile Section */}
      {/* <div className="bg-[#3D7AB5] p-6 flex items-center gap-4">
        <div className="bg-white/20 rounded-sm w-20 h-20 flex items-center justify-center">
          <Users size={40} className="text-white/60" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="text-lg font-medium">Hemant Kumar</div>
          <div onClick={() => navigate("/profile")} className="cursor-pointer hover:bg-[#2B5F8F] bg-[#4A8BC2]  transition px-6 py-2 text-sm font-medium tracking-wider border border-[#2B5F8F] border-t-1 border-b-3">
            PROFILE
          </div>
        </div>
      </div> */}

      {/* Menu Items */}
      <nav className="flex-1 py-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeItem === item.label;

          return (
            <div
              key={index}
              onClick={() => handleClick(item)}
              className={`w-full cursor-pointer text-slate-200 hover:text-white flex items-center gap-2 px-6 py-4 transition-colors relative ${isActive
                ? "!bg-[#5A9BD2] border-l-4 border-red-600 "
                : "!bg-[#3D7AB5]"
                }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {/* <span className="text-[15px] tracking-wide">{item.label}</span> */}
              <span className="text-[14px] tracking-wide">{item.label}</span>

            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;