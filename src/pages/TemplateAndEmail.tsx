import { Clock } from "lucide-react";

function TemplateAndEmail() {
  return (
    <div className="flex h-screen flex-col items-center justify-center h-[80vh] bg-gradient-to-br from-[#f8fafc] to-[#e0f2fe] text-center px-6">
      {/* Icon */}
      <div className="bg-blue-100 p-5 rounded-full mb-6">
        <Clock size={48} className="text-blue-500" />
      </div>

      {/* Title */}
      <h1 className="text-4xl font-semibold text-gray-800 mb-3">
        Coming Soon
      </h1>

      {/* Subtitle */}
      <p className="text-gray-600 text-lg max-w-md mb-8">
        We're working hard to bring you this feature.  
        Stay tuned — something amazing is on the way!
      </p>

      {/* Optional Notify Button */}
      {/* <button className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition">
        Notify Me
      </button> */}

      {/* Footer Note */}
      <p className="text-gray-400 text-xs mt-10">
        © {new Date().getFullYear()} Your Company. All rights reserved.
      </p>
    </div>
  );
}

export default TemplateAndEmail;
