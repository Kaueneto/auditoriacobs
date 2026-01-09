"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "@/lib/api";

const schema = yup.object().shape({
  nome: yup.string().required("Nome obrigatorio"),
  role: yup.number().required("Nivel obrigatorio"),
  senha: yup.string().required("Senha obrigatoria"),
  ativo: yup.boolean().required(),
});

interface CadastroForm {
  nome: string;
  role: number;
  senha: string;
  ativo: boolean;
}

export default function CadastrarUsuariosPage() {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CadastroForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      ativo: true,
    },
  });

  const onSubmit = async (data: CadastroForm) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Mapear 'senha' para 'senha_hash' que o backend espera
      await api.post("/users", {
        nome: data.nome,
        senha_hash: data.senha,
        role: Number(data.role),
        ativo: data.ativo,
      });
      setSuccess("Usuario cadastrado com sucesso!");
      reset();
    } catch (err: any) {
      setError(
        err.response?.data?.mensagem || "Erro ao cadastrar usuario"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Cadastrar usuarios
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Nome de usuario
            </label>
            <input
              {...register("nome")}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.nome && (
              <p className="mt-1 text-xs text-red-600">{errors.nome.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Nivel de usuario (role)
            </label>
            <select
              {...register("role")}
              className="w-full px-4 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Selecione...</option>
              <option value="1">1 - Administrador</option>
              <option value="2">2 - Usuario Cobranca</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Senha Padrao
            </label>
            <input
              {...register("senha")}
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.senha && (
              <p className="mt-1 text-xs text-red-600">{errors.senha.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Status
            </label>
            <select
              {...register("ativo")}
              className="w-full px-4 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#3b5998] text-white px-16 py-2 rounded hover:bg-[#2d4373] disabled:opacity-50 transition-colors"
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </div>
      </form>
    </div>
  );
}
