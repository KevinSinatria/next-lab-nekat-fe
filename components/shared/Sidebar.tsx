"use client";

import { useAuthStore } from "@/store/useAuthStore";
import {
  Activity,
  Book,
  FlaskConical,
  IdCard,
  LayoutDashboard,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useIsDesktop } from "@/hooks/useIsDesktop";

export default function Sidebar({
  isOpenSidebar,
  setIsOpenSidebar,
}: {
  isOpenSidebar: boolean;
  setIsOpenSidebar: (value: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const isDesktop = useIsDesktop();

  const handleLogout = () => {
    logout();
    router.push("/");
    if (!isDesktop) setIsOpenSidebar(false);
  };

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/aktivitas", label: "Aktivitas Lab", icon: Activity },
    { href: "/dashboard/kelas", label: "Data Kelas", icon: Book },
    { href: "/dashboard/lab", label: "Data Lab", icon: FlaskConical },
    { href: "/dashboard/kartu", label: "Data Kartu", icon: IdCard },
  ];

  return (
    <>
      {/* OVERLAY (ONLY MOBILE) */}
      <AnimatePresence>
        {!isDesktop && isOpenSidebar && (
          <motion.div
            className="fixed inset-0 bg-black/40 z-1000"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpenSidebar(false)}
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <motion.nav
        initial={false}
        animate={{
          x: isDesktop ? 0 : isOpenSidebar ? 0 : -300,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="
    fixed top-4 left-4 z-1000
    h-[calc(100vh-2rem)]
    w-[250px]
    bg-white
    rounded-3xl
    shadow-2xl
    p-5
    flex flex-col
  "
      >
        {/* CLOSE (MOBILE ONLY) */}
        {!isDesktop && (
          <button
            onClick={() => setIsOpenSidebar(false)}
            className="absolute top-4 right-4"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}

        {/* HEADER (FIXED) */}
        <div className="mb-6 text-center pt-2 shrink-0">
          <Image
            src="/img/smkn1katapang.webp"
            alt="Logo"
            width={500}
            height={500}
            className="mx-auto w-16 mb-2"
          />
          <h3 className="text-sm font-bold text-gray-800 tracking-wide">
            SISTEM AKSES LAB
          </h3>
          <span className="text-xs text-gray-400 font-medium">
            SMKN 1 Katapang
          </span>
        </div>

        {/* MENU (SCROLL AREA) */}
        <ul
          className="
      flex-1
      space-y-2
      overflow-y-auto
      pr-1
    "
        >
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => !isDesktop && setIsOpenSidebar(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm transition-all ${
                    isActive
                      ? "bg-[#cceadd] text-[#2c3e50] font-bold shadow-sm translate-x-1"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:translate-x-1"
                  }`}
                >
                  <item.icon className="w-[22px] mr-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* LOGOUT (FIXED) */}
        <div className="pt-4 mt-4 border-t border-gray-100 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 text-[#e74c3c] font-bold hover:bg-red-50 rounded-xl"
          >
            Logout
          </button>
        </div>
      </motion.nav>
    </>
  );
}
