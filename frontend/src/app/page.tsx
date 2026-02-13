"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Redirect based on role if already logged in
        switch (user.role) {
          case "admin":
            router.push("/admin/dashboard");
            break;
          case "dean":
            router.push("/dean/dashboard");
            break;
          case "activity_head":
            router.push("/activity-head/dashboard");
            break;
          case "club":
            router.push("/club/dashboard");
            break;
          case "student":
            router.push("/student/activities");
            break;
          default:
            router.push("/login");
        }
      } else {
        router.push("/login");
      }
    }
  }, [user, isLoading, router]);

  // Loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2B4C8C] to-[#3B5998] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <p className="text-white text-lg">กำลังโหลด...</p>
      </div>
    </div>
  );
}
