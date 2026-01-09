"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getAuthData } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      const { user } = getAuthData();
      // redireciona baseado no role
      if (user?.role === 1) {
        router.push("/adm/usuarios/cadastrar");
      } else {
        router.push("/usuarioscob/realizarLancamento");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  return null;
}

