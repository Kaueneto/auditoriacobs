"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface Usuario {
  id: number;
  nome: string;
  role: number;
  ativo: boolean;
  data_cadastro: string;
  data_ult_edicao?: string;
}

export default function ConsultarUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  // Filtros
  const [nomeFilter, setNomeFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [dataFilter, setDataFilter] = useState("");

  const fetchUsuarios = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/users");
      setUsuarios(response.data);
      setFilteredUsuarios(response.data);
    } catch (err: any) {
      setError("Erro ao buscar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleConsultar = () => {
    let filtered = usuarios;

    if (nomeFilter) {
      filtered = filtered.filter((u) =>
        u.nome.toLowerCase().includes(nomeFilter.toLowerCase())
      );
    }

    if (roleFilter) {
      filtered = filtered.filter((u) => u.role.toString() === roleFilter);
    }

    if (dataFilter) {
      filtered = filtered.filter((u) =>
        u.data_cadastro.startsWith(dataFilter)
      );
    }

    setFilteredUsuarios(filtered);
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Deseja realmente deletar este usuario?")) return;

    try {
      await api.delete(`/users/${id}`);
      fetchUsuarios();
      alert("Usuario deletado com sucesso!");
    } catch (err) {
      alert("Erro ao deletar usuario");
    }
  };

  const handleResetPassword = async (id: number) => {
    const novaSenha = prompt("Digite a nova senha:");
    if (!novaSenha) return;

    try {
      await api.patch(`/users/${id}/reset-senha`, { senha: novaSenha });
      alert("Senha resetada com sucesso!");
    } catch (err) {
      alert("Erro ao resetar senha");
    }
  };

  const handleEditUser = (id: number) => {
    // TODO: implementar edicao
    alert("Funcionalidade de edicao em desenvolvimento");
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Consultar usuarios
      </h2>

      {/* Filtros */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Nome de usuario
          </label>
          <input
            type="text"
            value={nomeFilter}
            onChange={(e) => setNomeFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Nivel de usuario (role)
          </label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="1">1 - Administrador</option>
            <option value="2">2 - Usuario Cobranca</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Periodo de cadastro
          </label>
          <input
            type="date"
            value={dataFilter}
            onChange={(e) => setDataFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleConsultar}
            className="w-full bg-[#3b5998] text-white px-8 py-2 rounded hover:bg-[#2d4373] transition-colors"
          >
            Consultar
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-gray-100 rounded-lg p-8 min-h-[300px] mb-6">
        {loading && (
          <div className="text-center text-gray-600">Carregando...</div>
        )}

        {error && <div className="text-center text-red-600">{error}</div>}

        {!loading && !error && filteredUsuarios.length === 0 && (
          <div className="text-center text-gray-600">
            Usuarios cadastrados serao exibidos aqui.
          </div>
        )}

        {!loading && !error && filteredUsuarios.length > 0 && (
          <div className="bg-white rounded overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    Selecionar
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    Ativo
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    Data Cadastro
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    Data Ult. Edicao
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsuarios.map((usuario) => (
                  <tr
                    key={usuario.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedUser === usuario.id}
                        onChange={() => setSelectedUser(selectedUser === usuario.id ? null : usuario.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded cursor-pointer focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{usuario.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{usuario.nome}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {usuario.role === 1 ? "Administrador" : "Usuario Cobranca"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {usuario.ativo ? "Ativo" : "Inativo"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(usuario.data_cadastro).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {usuario.data_ult_edicao 
                        ? new Date(usuario.data_ult_edicao).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Botões de ação */}
      <div className="flex gap-4">
        <button
          onClick={() => selectedUser && handleDeleteUser(selectedUser)}
          disabled={!selectedUser}
          className="bg-red-600 text-white px-8 py-2 rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Deletar usuario
        </button>

        <button
          onClick={() => selectedUser && handleResetPassword(selectedUser)}
          disabled={!selectedUser}
          className="bg-orange-600 text-white px-8 py-2 rounded hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Resetar Senha
        </button>

        <button
          onClick={() => selectedUser && handleEditUser(selectedUser)}
          disabled={!selectedUser}
          className="bg-blue-600 text-white px-8 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Editar
        </button>
      </div>
    </div>
  );
}
