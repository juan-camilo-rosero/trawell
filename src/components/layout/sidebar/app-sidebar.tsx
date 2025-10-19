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

// This is sample data.
const data = {
  user: {
    name: "Juan Camilo",
    email: "juroseros@unal.edu.co",
    avatar: "/avatars/shadcn.jpg",
  },
  projects: [
    {
      name: "Inicio",
      url: "/dashboard",
      icon: HomeIcon,
    },
    {
      name: "Nuevo viaje",
      url: "/dashboard/new-trip",
      icon: Briefcase,
    },
    {
      name: "Mis viajes",
      url: "/dashboard/my-trips",
      icon: Calendar,
    },
    {
      name: "Configuración",
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
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
