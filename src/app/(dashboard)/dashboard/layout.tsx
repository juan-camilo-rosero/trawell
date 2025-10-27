"use client"

import { AppSidebar } from "@/components/layout/sidebar/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { AuthGuard } from "@/components/auth/auth-guard"

const routeNames: Record<string, string> = {
  dashboard: "Inicio",
  "new-trip": "Nuevo viaje",
  "my-trips": "Mis viajes",
  settings: "Configuración",
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
 
  // Generar breadcrumbs desde la URL
  const pathSegments = pathname.split("/").filter(Boolean)
 
  // Construir breadcrumbs
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/")
    const label = routeNames[segment] || segment
    const isLast = index === pathSegments.length - 1
   
    return { path, label, isLast }
  })

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.path} className="flex items-center">
                    {index > 0 && (
                      <BreadcrumbSeparator className="hidden md:block mr-3" />
                    )}
                    <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                      {crumb.isLast ? (
                        <BreadcrumbPage className="text-lg">{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.path} className="text-lg">
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <AuthGuard>
            {children}
          </AuthGuard>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}