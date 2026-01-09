"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuthData, clearAuthData } from "@/lib/auth";
import Link from "next/link";

interface LayoutUsuariosCobProps {
  children: React.ReactNode;
}

export default function LayoutUsuariosCob({ children }: LayoutUsuariosCobProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const { token, user } = getAuthData();
    if (!token) {
      router.push("/login");
    } else if (user?.role === 1) {
      router.push("/adm/usuarios/cadastrar");
    } else {
      setUser(user);
    }
  }, [router]);

  const handleLogout = () => {
    clearAuthData();
    router.push("/login");
  };

  if (!user) return null;

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-white">
      {/* Menu principal */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center">
            <nav className="flex gap-8 text-sm">
              <Link
                href="/realizarLancamento"
                className={`py-4 ${
                  isActive("/realizarLancamento")
                    ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Novo lancamento
              </Link>
              <Link
                href="/consultar"
                className={`py-4 ${
                  isActive("/consultar")
                    ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Consultar lancamentos
              </Link>
              <Link
                href="/incluirmultiplos"
                className={`py-4 ${
                  isActive("/incluirmultiplos")
                    ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Incluir multiplos lancamentos
              </Link>
            </nav>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700 py-4"
            >
              Sair/Deslogar
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
    </div>
  );
}
