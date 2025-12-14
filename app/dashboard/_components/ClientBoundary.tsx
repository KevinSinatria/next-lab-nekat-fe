"use client";

import Header from "@/components/shared/Header";
import Sidebar from "@/components/shared/Sidebar";
import { useState } from "react";

export default function ClientBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);

  return (
    <>
      <Sidebar
        isOpenSidebar={isOpenSidebar}
        setIsOpenSidebar={setIsOpenSidebar}
      />
      <main className="flex-1 md:ml-[280px] p-6 md:p-8">
        <Header onClick={() => setIsOpenSidebar(!isOpenSidebar)} />
        {children}
      </main>
    </>
  );
}
