"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthData, clearAuthData } from "@/lib/auth";
import { LogOut, Users, FileCheck, DollarSign, Target } from "lucide-react";

export default function AdmPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const { token, user } = getAuthData();
    if (!token) {
      router.push("/login");
    } else if (user?.role !== 1) {
      // se nao for admin, redireciona para area de cobranca
      router.push("/usuarioscob");
    } else {
      setUser(user);
    }
  }, [router]);

  const handleLogout = () => {
    clearAuthData();
    router.push("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Administracao - Auditoria
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                <strong>{user.nome}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileCheck className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Auditoria
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Auditar lancamentos de honorarios
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Fechamentos
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Gerenciar fechamentos de auditoria
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Usuarios
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Gerenciar usuarios do sistema
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Target className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Metas
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Configurar metas e gratificacoes
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
