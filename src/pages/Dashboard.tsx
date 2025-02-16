
import { Link } from "react-router-dom";
import { Camera, Users, Upload, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Camera,
    title: "Face Recognition",
    description: "Advanced AI-powered face detection and recognition",
    link: "/face-recognition",
  },
  {
    icon: Users,
    title: "User Management",
    description: "Register and manage users efficiently",
    link: "/user-management",
  },
  {
    icon: Upload,
    title: "Bulk Upload",
    description: "Import multiple users via Excel upload",
    link: "/bulk-upload",
  },
  {
    icon: Activity,
    title: "Attendance Logs",
    description: "View and export attendance records",
    link: "/attendance-logs",
  },
];

const Dashboard = () => {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Face Attendance System
        </h1>
        <span className="text-3xl md:text-4xl font-semibold text-primary">
          Made Simple
        </span>
        <p className="text-muted-foreground text-lg mt-4">
          Streamline your attendance management with our cutting-edge facial
          recognition system. Accurate, efficient, and completely hands-free.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => (
          <Link to={feature.link} key={feature.title}>
            <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
