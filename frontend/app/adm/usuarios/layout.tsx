"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

interface LayoutUsuariosProps {
  children: React.ReactNode;
}

export default function LayoutUsuarios({ children }: LayoutUsuariosProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Menu principal */}
      <div className="border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-8 text-sm relative">
            <button
              onClick={handleLogout}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Deslogar
            </button>
            <Link
              href="/adm"
              className="py-4 text-gray-500 hover:text-gray-700"
            >
              Auditoria administrativa
            </Link>
            <Link
              href="/adm/auditorias"
              className="py-4 text-gray-500 hover:text-gray-700"
            >
              Consultar auditorias
            </Link>
            <span className="py-4 text-blue-600 border-b-2 border-blue-600 font-medium">
              Gerenciar usuarios
            </span>
          </nav>
        </div>
      </div>

      {/* Sub-menu */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-8 text-sm">
            <Link
              href="/adm/usuarios/cadastrar"
              className={`py-4 ${
                isActive("/adm/usuarios/cadastrar")
                  ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Cadastrar usuarios
            </Link>
            <Link
              href="/adm/usuarios/consultar"
              className={`py-4 ${
                isActive("/adm/usuarios/consultar")
                  ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Consultar usuarios
            </Link>
          </nav>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
    </div>
  );
}
