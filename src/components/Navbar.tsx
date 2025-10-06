import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { BookOpen, LogOut, LayoutDashboard, BookMarked, UserCog } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const getDashboardPath = () => {
    switch (userRole) {
      case "admin":
        return "/admin";
      case "librarian":
        return "/librarian";
      default:
        return "/student";
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-card/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Readify</span>
          </div>
          
          {user && (
            <div className="hidden md:flex items-center gap-4">
              <Button
                variant={isActive(getDashboardPath()) ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(getDashboardPath())}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant={isActive("/catalog") ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate("/catalog")}
              >
                <BookMarked className="mr-2 h-4 w-4" />
                Catalog
              </Button>
              {(userRole === "admin" || userRole === "librarian") && (
                <Button
                  variant={isActive("/manage") ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate("/manage")}
                >
                  <UserCog className="mr-2 h-4 w-4" />
                  Manage
                </Button>
              )}
            </div>
          )}
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm">
              <p className="font-medium">{user.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
