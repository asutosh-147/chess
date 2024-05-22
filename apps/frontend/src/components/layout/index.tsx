import React from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="h-screen flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex flex-1 border-collapse overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden pb-1 text-white">
            {children}
          </main>
        </div>
      </div>
    </>
  );
};

export default Layout;
