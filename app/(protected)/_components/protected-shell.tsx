"use client";

import { SignOutButton, UserButton } from "@clerk/nextjs";
import {
  Bell,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Receipt,
  Settings,
  SquareActivity,
  User,
  UserRound,
  Users,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const sidebarSections = [
  {
    label: "Menu",
    links: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Admin", href: "/admin", icon: SquareActivity },
    ],
  },
  {
    label: "Manage",
    links: [
      { name: "Users", href: "/record/users", icon: Users },
      { name: "Doctors", href: "/record/doctors", icon: User },
      { name: "Staffs", href: "/record/staffs", icon: UserRound },
      { name: "Patients", href: "/record/patients", icon: UsersRound },
      { name: "Appointments", href: "/record/appointments", icon: ListOrdered },
      { name: "Billing", href: "/record/billing", icon: Receipt },
    ],
  },
  {
    label: "System",
    links: [
      { name: "Notifications", href: "/notifications", icon: Bell },
      { name: "Settings", href: "/admin/system-settings", icon: Settings },
    ],
  },
];

function pageTitle(pathname: string) {
  const segment = pathname.split("/").filter(Boolean)[0] ?? "overview";

  return segment.replace(/-/g, " ");
}

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="w-full h-screen flex bg-gray-200">
      <aside className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] bg-white overflow-y-auto">
        <div className="min-h-full p-4 flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <div className="p-1.5 rounded-md bg-blue-600 text-white">
                <SquareActivity size={22} />
              </div>
              <Link href="/" className="hidden lg:flex text-base 2xl:text-xl font-bold">
                Abia HMS
              </Link>
            </div>

            <nav className="mt-4 text-sm">
              {sidebarSections.map((section) => (
                <div key={section.label} className="flex flex-col gap-2">
                  <span className="hidden uppercase lg:block text-gray-400 font-bold my-4">
                    {section.label}
                  </span>

                  {section.links.map((link) => {
                    const Icon = link.icon;
                    const active =
                      link.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(link.href);

                    return (
                      <Link
                        href={link.href}
                        className={[
                          "flex items-center justify-center lg:justify-start gap-4 py-2 md:px-2 rounded-md",
                          active
                            ? "bg-blue-600/10 text-blue-700"
                            : "text-gray-500 hover:bg-blue-600/10",
                        ].join(" ")}
                        key={link.name}
                        title={link.name}
                      >
                        <Icon className="size-6 lg:size-5" />
                        <span className="hidden lg:block">{link.name}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>

          <SignOutButton>
            <button
              className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-blue-600/10"
              type="button"
            >
              <LogOut className="size-6 lg:size-5" />
              <span className="hidden lg:block">Logout</span>
            </button>
          </SignOutButton>
        </div>
      </aside>

      <main className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] flex flex-col">
        <header className="p-5 flex justify-between bg-white">
          <h1 className="text-xl font-medium text-gray-500 capitalize">
            {pageTitle(pathname)}
          </h1>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell />
              <p className="absolute -top-3 right-1 size-4 bg-red-600 text-white rounded-full text-[10px] text-center">
                2
              </p>
            </div>
            <UserButton />
          </div>
        </header>

        <div className="h-full w-full p-2 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
