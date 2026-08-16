import React from "react";
import { Outlet } from "react-router";
import { DemoToolbar } from "./DemoToolbar";
import { Toaster } from "sonner";
import { AcademicProvider } from "../context/AcademicContext";

export function RootLayout() {
  return (
    <AcademicProvider>
      <div className="min-h-screen bg-[#F4F6F8]">
        <Outlet />
        <DemoToolbar />
        <Toaster richColors position="top-right" closeButton />
      </div>
    </AcademicProvider>
  );
}
