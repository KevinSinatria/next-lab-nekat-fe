"use client";
import { useAuthStore } from "@/store/useAuthStore";
import { ChevronDown, Menu, Search, User } from "lucide-react";
import { Button } from "../ui/button";

export default function Header({ onClick }: { onClick: () => void }) {
  const { user } = useAuthStore();

  return (
    <header className="flex sticky top-8 border border-gray-200 backdrop-blur-3xl shadow-sm bg-white/90 rounded-2xl p-3 z-100 justify-between items-center mb-8">
      <Button
        variant={"outline"}
        className="flex items-center md:hidden justify-center mr-2 w-8 gap-0"
        onClick={onClick}
      >
        <Menu className=" text-black" />
      </Button>

      <div className="bg-white px-5 py-2.5 rounded-full shadow-sm w-full md:w-[400px] flex items-center">
        <Search />
        <input
          type="text"
          placeholder="Search"
          className="border-none outline-none ml-4 w-full text-sm"
        />
      </div>
      <div className="flex items-center gap-5">
        <i className="far fa-bell text-gray-500 cursor-pointer"></i>
        <div className="flex group items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-500 flex items-center justify-center">
            <User />
          </div>
          <span className="text-sm font-medium">
            {user?.username ?? "Loading..."}
          </span>
          <ChevronDown className="group-hover:rotate-180 transition-all duration-500" />
        </div>
      </div>
    </header>
  );
}
