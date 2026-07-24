import { useState } from "react";
import { Camera, Mic, RefreshCw, AlertTriangle, Settings } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PermissionRequest = ({ error, permissions, onRetry, className = "" }) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    await onRetry?.();
    setTimeout(() => setIsRetrying(false), 2000);
  };

  const getErrorMessage = (error) => {
    if (!error) return null;

    if (
      error.includes("Permission denied") ||
      error.includes("NotAllowedError")
    ) {
      return {
        title: "Camera & Microphone Access Required",
        message:
          "Please allow access to your camera and microphone to join the video call.",
        type: "permission",
      };
    }

    if (
      error.includes("NotFoundError") ||
      error.includes("DevicesNotFoundError")
    ) {
      return {
        title: "No Camera or Microphone Found",
        message: "Please check that your devices are connected and try again.",
        type: "device",
      };
    }

    return {
      title: "Media Access Error",
      message: error,
      type: "general",
    };
  };

  const errorInfo = getErrorMessage(error);

  if (!error && permissions.audio && permissions.video) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center animate-fade-in ${className}`}
    >
      <Card className="w-full max-w-md mx-4 animate-slide-up">
        <CardHeader className="text-center">
          {/* Icon */}
          <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            {errorInfo?.type === "permission" ? (
              <div className="flex gap-0.5">
                <Camera size={18} className="text-destructive" />
                <Mic size={18} className="text-destructive" />
              </div>
            ) : errorInfo?.type === "device" ? (
              <AlertTriangle size={20} className="text-destructive" />
            ) : (
              <AlertTriangle size={20} className="text-destructive" />
            )}
          </div>
          <CardTitle className="text-base">
            {errorInfo?.title || "Media Access Required"}
          </CardTitle>
          <CardDescription className="text-sm">
            {errorInfo?.message ||
              "Please allow access to your camera and microphone to join the video call."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Permission Status */}
          <div className="flex justify-center gap-3">
            <Badge
              variant={permissions.audio ? "default" : "destructive"}
              className="gap-1"
            >
              <Mic size={12} />
              <span className="text-xs">
                {permissions.audio ? "Mic Allowed" : "Mic Blocked"}
              </span>
            </Badge>
            <Badge
              variant={permissions.video ? "default" : "destructive"}
              className="gap-1"
            >
              <Camera size={12} />
              <span className="text-xs">
                {permissions.video ? "Camera Allowed" : "Camera Blocked"}
              </span>
            </Badge>
          </div>

          {/* Action Buttons */}
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full"
          >
            <RefreshCw
              size={16}
              className={isRetrying ? "animate-spin mr-2" : "mr-2"}
            />
            {isRetrying ? "Requesting..." : "Try Again"}
          </Button>

          {errorInfo?.type === "permission" && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                alert(
                  "Please click the camera/microphone icon in your browser's address bar to manage permissions."
                );
              }}
            >
              <Settings size={16} className="mr-2" />
              Browser Settings
            </Button>
          )}
        </CardContent>

        <CardFooter className="flex-col">
          <p className="text-xs text-muted-foreground text-center">
            {errorInfo?.type === "permission"
              ? "Look for the camera icon in your browser's address bar and click Allow"
              : errorInfo?.type === "device"
                ? "Make sure your camera and microphone are properly connected"
                : "If the problem persists, try refreshing the page or using a different browser"}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PermissionRequest;
