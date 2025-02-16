
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Motion, spring } from "react-motion";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20">
      <Motion
        defaultStyle={{ y: 50, opacity: 0 }}
        style={{
          y: spring(0),
          opacity: spring(1),
        }}
      >
        {(interpolatedStyle) => (
          <div
            className="text-center space-y-6 p-8"
            style={{
              transform: `translateY(${interpolatedStyle.y}px)`,
              opacity: interpolatedStyle.opacity,
            }}
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Welcome to FaceLogix
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Advanced facial recognition attendance system for modern organizations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/face-recognition">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Recognition
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Motion>
    </div>
  );
};

export default Index;
