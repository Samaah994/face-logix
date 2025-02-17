
import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import * as faceapi from "face-api.js";
import type { User } from "@/types";

const FaceRecognition = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isRecognizing, setIsRecognizing] = useState(false);

  // Load face recognition models
  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('Starting to load models...');
        await Promise.all([
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
        ]);
        console.log('Models loaded successfully');
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading face recognition models:', error);
        toast({
          title: "Error",
          description: "Failed to load face recognition models. Please check the console for details.",
          variant: "destructive",
        });
      }
    };

    loadModels();
  }, [toast]);

  // Fetch users with face data
  const { data: users } = useQuery({
    queryKey: ['users-with-face-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .not('face_data', 'is', null);

      if (error) throw error;
      return data as User[];
    },
  });

  // Start webcam
  useEffect(() => {
    if (!isLoading && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error('Error accessing webcam:', err);
          toast({
            title: "Error",
            description: "Failed to access webcam",
            variant: "destructive",
          });
        });
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isLoading, toast]);

  // Mutation for marking attendance
  const markAttendanceMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('attendance')
        .insert({
          user_id: userId,
          status: 'present',
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({
        title: "Success",
        description: "Attendance marked successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const recognizeFace = async () => {
    if (!videoRef.current || !canvasRef.current || !users?.length) return;

    setIsRecognizing(true);
    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (!detections.length) {
        toast({
          title: "Error",
          description: "No face detected",
          variant: "destructive",
        });
        return;
      }

      const labeledDescriptors = users.map(user => {
        // Convert stored face data back to Float32Array
        const descriptors = new Float32Array(Object.values(user.face_data));
        return new faceapi.LabeledFaceDescriptors(user.id, [descriptors]);
      });

      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
      const results = detections.map(detection =>
        faceMatcher.findBestMatch(detection.descriptor)
      );

      const match = results[0];
      if (match && match.distance < 0.6) {
        const userId = match.label;
        const matchedUser = users.find(user => user.id === userId);
        
        if (matchedUser) {
          markAttendanceMutation.mutate(userId);
          toast({
            title: "Welcome",
            description: `Attendance marked for ${matchedUser.full_name}`,
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Face not recognized",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error during face recognition:', error);
      toast({
        title: "Error",
        description: "Face recognition failed",
        variant: "destructive",
      });
    } finally {
      setIsRecognizing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-green-700">Face Recognition</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="relative w-[640px] h-[480px] bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
          
          <Button
            onClick={recognizeFace}
            disabled={isRecognizing}
            className="bg-green-600 hover:bg-green-700"
          >
            {isRecognizing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recognizing...
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Mark Attendance
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FaceRecognition;
