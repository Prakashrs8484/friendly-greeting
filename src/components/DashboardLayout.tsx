import { ReactNode } from "react";
import { Brain, LayoutDashboard, Target, TrendingUp, Heart, Apple, Clock, BookOpen, Settings, LogOut, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
  hideNavigation?: boolean;
}

const DashboardLayout = ({ children, hideNavigation = false }: DashboardLayoutProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen w-full bg-background">
        {/* Fixed Header - Always visible */}
        <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-card/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
          <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between max-w-[1920px] mx-auto">
            {/* Logo - Left */}
            <Link to="/" className="flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-80">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Brain className="w-5 h-5 text-primary flex-shrink-0" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold text-foreground tracking-tight">NeuraDesk</span>
                <span className="text-[10px] text-muted-foreground hidden sm:block font-normal">AI Workspace</span>
              </div>
            </Link>

            {/* Controls - Right */}
            <div className="flex items-center gap-2.5">
              <ThemeToggle />
              <SidebarTrigger className="h-9 w-9 rounded-lg border border-border/40 bg-background/50 hover:bg-accent/50 hover:border-primary/30 transition-all duration-200">
                <Menu className="h-4 w-4" />
              </SidebarTrigger>
            </div>
          </div>
        </header>

        {/* Content Row: Sidebar + Main */}
        <div className="flex w-full pt-16">
          <AppSidebar isActive={isActive} />

          {/* Main Content */}
          <main className="flex-1 min-h-[calc(100svh-4rem)] overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const AppSidebar = ({ isActive }: { isActive: (path: string) => boolean }) => {
  const { open } = useSidebar();
  
  return (
    <>
      {/* Backdrop overlay with blur */}
      {open && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 animate-fade-in" />
      )}
      
      <Sidebar 
        side="left"
        collapsible="offcanvas" 
        className="border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl shadow-2xl transition-transform duration-300 ease-out top-16 z-50"
      >

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={active}
                      className={`
                        transition-all duration-200 rounded-lg h-10 font-normal
                        ${active 
                          ? 'bg-primary/10 text-primary font-medium border border-primary/20' 
                          : 'hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground border border-transparent'
                        }
                      `}
                    >
                      <Link to={item.path} className="flex items-center gap-3 px-3 py-2">
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate text-sm">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarMenu className="space-y-1">
          <SidebarMenuItem>
            <SidebarMenuButton 
              className="transition-all duration-200 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground h-10 font-normal"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              className="transition-all duration-200 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground h-10 font-normal"
            >
              <Link to="/auth" className="flex items-center gap-3">
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sign Out</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
    </>
  );
};

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Target, label: "Career", path: "/career" },
  { icon: TrendingUp, label: "Finance", path: "/finance" },
  { icon: Heart, label: "Health & Fitness", path: "/health" },
  { icon: Apple, label: "Nutrition", path: "/nutrition" },
  { icon: Clock, label: "Lifestyle", path: "/lifestyle" },
  { icon: BookOpen, label: "NeuraNotes", path: "/neuranotes" },
];

export default DashboardLayout;
