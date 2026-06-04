import {
  Briefcase,
  Calculator,
  Folder,
  Home,
  Package,
  ScrollText,
  Users,
} from "lucide-react"

import { SidebarAppearance } from "@/components/Common/Appearance"
import { Logo } from "@/components/Common/Logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"
import { type Item, Main } from "./Main"
import { User } from "./User"

const baseItems: Item[] = [
  { icon: Home, title: "Dashboard", path: "/" },
  { icon: Calculator, title: "Masses", path: "/masses" },
  { icon: Folder, title: "Categories", path: "/categories" },
  { icon: Package, title: "Inventory", path: "/inventory" },
]

const adminItem: Item[] = [
  { icon: Users, title: "Admin", path: "/admin" },
  { icon: Briefcase, title: "Admin Items", path: "/admin-items" },
  { icon: ScrollText, title: "Activity Logs", path: "/admin-logs" },
]

export function AppSidebar() {
  const { user: currentUser } = useAuth()

  const items = currentUser?.is_superuser
    ? [...baseItems, ...adminItem]
    : baseItems

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
        <Logo variant="responsive" />
      </SidebarHeader>
      <SidebarContent>
        <Main items={items} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarAppearance />
        <User user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
