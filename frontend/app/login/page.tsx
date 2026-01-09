"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Image from "next/image";
import api from "@/lib/api";
import { setAuthData } from "@/lib/auth";

const schema = yup.object().shape({
  nome: yup.string().required("Usuario obrigatorio"),
  senha: yup.string().required("Senha obrigatoria"),
});

interface LoginForm {
  nome: string;
  senha: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", data);
      const { token, usuario } = response.data;

      setAuthData(token, usuario);
      
      // redireciona baseado no role do usuario
      if (usuario.role === 1) {
        router.push("/adm/usuarios/cadastrar");
      } else {
        router.push("/realizarLancamento");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.mensagem || "Erro ao fazer login. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-white pt-32">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-20">
          <Image
            src="/LogoCastelPretoAzul.png"
            alt="Grupo Castel"
            width={200}
            height={60}
            priority
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              {...register("nome")}
              type="text"
              placeholder="Usuario"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            />
            {errors.nome && (
              <p className="mt-1 text-xs text-red-600">{errors.nome.message}</p>
            )}
          </div>

          <div>
            <input
              {...register("senha")}
              type="password"
              placeholder="Senha"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            />
            {errors.senha && (
              <p className="mt-1 text-xs text-red-600">{errors.senha.message}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3b5998] text-white py-3 px-4 rounded-md hover:bg-[#2d4373] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? "Entrando..." : "Acessar"}
          </button>
        </form>
      </div>
    </div>
  );
}
