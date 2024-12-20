"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Routes } from "@/utils/constants";

export function useAuth() {
  const [userId, setUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push(Routes.SIGN_IN);
      } else {
        setUserId(session.user.id);
      }
      setIsLoading(false);
    };
    loadSession();
  }, [supabase, router]);

  return { userId, isLoading };
}
