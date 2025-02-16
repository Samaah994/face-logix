
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import {
  Camera,
  Users,
  Upload,
  FileText,
  LayoutDashboard,
  Home,
} from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/face-recognition", icon: Camera, label: "Face Recognition" },
    { path: "/user-management", icon: Users, label: "User Management" },
    { path: "/bulk-upload", icon: Upload, label: "Bulk Upload" },
    { path: "/attendance-logs", icon: FileText, label: "Attendance Logs" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-morphism border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-heading font-bold text-xl">FaceLogix</span>
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link key={path} to={path}>
                <Button
                  variant={isActive(path) ? "secondary" : "ghost"}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
