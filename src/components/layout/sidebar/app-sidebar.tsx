"use client"

import * as React from "react"
import {
  Briefcase,
  Calendar,
  HomeIcon,
  Settings,
} from "lucide-react"

import { NavProjects } from "@/components/layout/sidebar/nav-main"
import { NavUser } from "@/components/layout/sidebar/nav-user"
import { TeamSwitcher } from "@/components/layout/sidebar/sidebar-logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Data para la navegación
const data = {
  projects: [
    {
      name: "Home",
      url: "/dashboard",
      icon: HomeIcon,
    },
    {
      name: "New Trip",
      url: "/dashboard/new-trip",
      icon: Briefcase,
    },
    {
      name: "My Trips",
      url: "/dashboard/my-trips",
      icon: Calendar,
    },
    {
      name: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}