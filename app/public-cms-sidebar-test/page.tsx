"use client";
import React from "react";
import PublicCmsSidebar from "@/components/public-cms-sidebar";

const Page = () => {
  return (
    <div className="flex h-full bg-gray-100">
      <PublicCmsSidebar isOpen={true} />
      {/* Other components or content */}
    </div>
  );
};

export default Page;
