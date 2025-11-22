import { Lock, LogOut, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import logo from "../assets/informing-science-logo.png";
import Model from "../pages/ChangePassword.tsx";
// Header Component
const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isModel, setModel] = useState(false);



  // Close dropdown if user clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // You can also clear tokens or call logout API here
    // localStorage.removeItem("token");
    window.location.href = "/admin/login";
  };

  const handleChangePassword = () => {
    setModel(true)
  };

  return (
    <header className="bg-[#2B5F8F] h-24 flex items-center justify-between px-6 py-[3vw] shadow-md">
      <div className="flex items-center gap-4">
        <img className="object-contain " src={logo} alt="Logo" />
      </div>
      <div className="relative" ref={dropdownRef}>
        {/* Profile Icon */}
        <div
          onClick={() => setShowDropdown((prev) => !prev)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-gray-100 transition"
        >
          <User className="text-[#000]" size={22} />
        </div>


        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-60 bg-white shadow-lg rounded-md border border-gray-200 z-50">
            <div
              onClick={handleChangePassword}
              className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:bg-[#eff2f7] transition"
            >
              <Lock size={16} /> Change Password
            </div>
            <div className="border-t border-gray-200"></div>
            <div
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-[#eff2f7] transition"
            >
              <LogOut size={16} /> Log Out
            </div>
          </div>
        )}
      </div>
      {isModel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <Model setModel={setModel} />
        </div>
      )}
    </header>
  );
};
export default Header;