"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { getAuthData } from "@/lib/auth";

interface LinhaLancamento {
  id: string;
  codigo_pessoaUAU: string;
  cpf_cnpj: string;
  nome_cliente: string;
  qtde_parcelas_pagas: string;
  numero_vendas: string;
  valor_honorarios: string;
  valor_parcela: string;
  vencimento_honorario: string;
  empresa: string;
  empresa_nome: string;
  observacoes: string;
}

interface Empresa {
  id: number;
  codigo: string;
  nome: string;
}

export default function IncluirMultiplosLancamentosPage() {
  const [linhas, setLinhas] = useState<LinhaLancamento[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  useEffect(() => {
    const { user } = getAuthData();
    if (user) {
      setUserId(user.id);
    }
    fetchEmpresas();
    const linhasIniciais: LinhaLancamento[] = Array.from({ length: 15 }, (_, i) => ({
      id: `linha-${i}`,
      codigo_pessoaUAU: "",
      cpf_cnpj: "",
      nome_cliente: "",
      qtde_parcelas_pagas: "",
      numero_vendas: "",
      valor_honorarios: "",
      valor_parcela: "",
      vencimento_honorario: "",
      empresa: "",
      empresa_nome: "",
      observacoes: "",
    }));
    setLinhas(linhasIniciais);
  }, []);

  const fetchEmpresas = async () => {
    try {
      const response = await api.get("/empresas");
      setEmpresas(response.data || []);
    } catch (err) {
      console.error("Erro ao buscar empresas");
    }
  };

  const handleCellChange = (id: string, field: keyof LinhaLancamento, value: string) => {
    setLinhas((prev) =>
      prev.map((linha) => {
        if (linha.id === id) {
          const updated = { ...linha, [field]: value };
          if (field === "empresa") {
            const empresaSelecionada = empresas.find((e) => e.codigo === value);
            updated.empresa_nome = empresaSelecionada?.nome || "";
          }
          return updated;
        }
        return linha;
      })
    );
  };

  const handleIncluirLinhas = () => {
    const novasLinhas: LinhaLancamento[] = Array.from({ length: 10 }, (_, i) => ({
      id: `linha-${Date.now()}-${i}`,
      codigo_pessoaUAU: "",
      cpf_cnpj: "",
      nome_cliente: "",
      qtde_parcelas_pagas: "",
      numero_vendas: "",
      valor_honorarios: "",
      valor_parcela: "",
      vencimento_honorario: "",
      empresa: "",
      empresa_nome: "",
      observacoes: "",
    }));
    setLinhas((prev) => [...prev, ...novasLinhas]);
  };

  const handleLimparTudo = () => {
    if (confirm("Deseja limpar todos os dados da tabela?")) {
      const linhasLimpas = linhas.map((linha) => ({
        ...linha,
        codigo_pessoaUAU: "",
        cpf_cnpj: "",
        nome_cliente: "",
        qtde_parcelas_pagas: "",
        numero_vendas: "",
        valor_honorarios: "",
        valor_parcela: "",
        vencimento_honorario: "",
        empresa: "",
        empresa_nome: "",
        observacoes: "",
      }));
      setLinhas(linhasLimpas);
    }
  };

  const handleConfirmarELancar = async () => {
    if (!userId) {
      alert("Usuário não identificado");
      return;
    }

    const linhasPreenchidas = linhas.filter(
      (linha) =>
        linha.cpf_cnpj.trim() !== "" ||
        linha.nome_cliente.trim() !== "" ||
        linha.empresa.trim() !== ""
    );

    if (linhasPreenchidas.length === 0) {
      alert("Nenhuma linha preenchida para lançar");
      return;
    }

    const erros: string[] = [];
    linhasPreenchidas.forEach((linha, index) => {
      if (!linha.cpf_cnpj) erros.push(`Linha ${index + 1}: CPF/CNPJ obrigatório`);
      if (!linha.nome_cliente) erros.push(`Linha ${index + 1}: Nome do cliente obrigatório`);
      if (!linha.empresa) erros.push(`Linha ${index + 1}: Empresa obrigatória`);
      if (!linha.qtde_parcelas_pagas) erros.push(`Linha ${index + 1}: Qtde de parcelas obrigatória`);
      if (!linha.numero_vendas) erros.push(`Linha ${index + 1}: Número de vendas obrigatório`);
      if (!linha.valor_honorarios) erros.push(`Linha ${index + 1}: Valor de honorários obrigatório`);
      if (!linha.valor_parcela) erros.push(`Linha ${index + 1}: Valor da parcela obrigatório`);
      if (!linha.vencimento_honorario) erros.push(`Linha ${index + 1}: Vencimento obrigatório`);
    });

    if (erros.length > 0) {
      alert("Erros encontrados:\n" + erros.join("\n"));
      return;
    }

    setLoading(true);

    try {
      const loteResponse = await api.post("/lotes", {
        usuario_id: userId,
        total_registros_incluidos: linhasPreenchidas.length,
      });

      const idLote = loteResponse.data.lote.id;

      const promises = linhasPreenchidas.map((linha) => {
        const valorHonorarios = parseFloat(linha.valor_honorarios);
        const valorParcela = parseFloat(linha.valor_parcela);

        return api.post("/lancamentos", {
          codigo_pessoaUAU: linha.codigo_pessoaUAU || null,
          cpf_cnpj: linha.cpf_cnpj,
          nome_cliente: linha.nome_cliente,
          empresa: linha.empresa,
          qtde_parcelas_pagas: parseInt(linha.qtde_parcelas_pagas),
          numero_vendas: linha.numero_vendas,
          valor_honorarios: valorHonorarios,
          valor_parcela: valorParcela,
          vencimento_honorario: linha.vencimento_honorario,
          id_user_lancamento: userId,
          tipo_inclusao: "LOTE",
          id_lote: idLote,
        });
      });

      await Promise.all(promises);

      alert(`${linhasPreenchidas.length} lançamentos incluídos com sucesso!`);
      handleLimparTudo();
    } catch (error) {
      console.error("Erro ao incluir lançamentos:", error);
      alert("Erro ao incluir lançamentos. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex gap-4 p-4 bg-white border-b border-gray-300 shrink-0">
        <button
          onClick={handleIncluirLinhas}
          className="bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded hover:bg-gray-50"
        >
          Incluir + Linhas
        </button>
        <button
          onClick={handleLimparTudo}
          className="bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded hover:bg-gray-50"
        >
          Limpar tudo
        </button>
        <button
          onClick={handleConfirmarELancar}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
        >
          {loading ? "Processando..." : "Confirmar e lançar"}
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="border-collapse text-sm w-full">
          <colgroup>
            <col style={{ width: "50px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "250px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "300px" }} />
            <col style={{ width: "250px" }} />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-gray-300">
            <tr>
              <th className="border border-gray-400 px-2 py-2 text-center font-semibold text-xs text-gray-800">#</th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-xs text-gray-800">COD. PESSOA UAU</th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-xs text-gray-800">CPF CLIENTE</th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-xs text-gray-800">NOME CLIENTE</th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-xs text-gray-800">QTDE PARCELAS</th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-xs text-gray-800">N° VENDAS</th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-xs text-gray-800">VLR.HONORARIOS</th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-xs text-gray-800">VLR.PARCELA</th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-xs text-gray-800">VENCIMENTO HON</th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-xs text-gray-800">EMPRESA</th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-xs text-gray-800">NOME EMPRESA</th>
              <th className="border border-gray-400 px-2 py-2 text-left font-semibold text-xs text-gray-800">OBSERVAÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha, index) => (
              <tr key={linha.id} className="hover:bg-blue-50">
                <td className="bg-gray-100 border border-gray-300 px-2 py-1 text-center text-xs text-gray-700 font-medium">
                  {index + 1}
                </td>
                <td className="border border-gray-300 p-0">
                  <input
                    type="text"
                    value={linha.codigo_pessoaUAU}
                    onChange={(e) => handleCellChange(linha.id, "codigo_pessoaUAU", e.target.value)}
                    className="w-full h-full px-2 py-1 border-0 text-gray-900 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500 text-xs"
                  />
                </td>
                <td className="border border-gray-300 p-0">
                  <input
                    type="text"
                    value={linha.cpf_cnpj}
                    onChange={(e) => handleCellChange(linha.id, "cpf_cnpj", e.target.value)}
                    className="w-full h-full px-2 py-1 border-0 text-gray-900 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500 text-xs"
                    maxLength={14}
                  />
                </td>
                <td className="border border-gray-300 p-0">
                  <input
                    type="text"
                    value={linha.nome_cliente}
                    onChange={(e) => handleCellChange(linha.id, "nome_cliente", e.target.value)}
                    className="w-full h-full px-2 py-1 border-0 text-gray-900 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500 text-xs"
                  />
                </td>
                <td className="border border-gray-300 p-0">
                  <input
                    type="number"
                    value={linha.qtde_parcelas_pagas}
                    onChange={(e) => handleCellChange(linha.id, "qtde_parcelas_pagas", e.target.value)}
                    className="w-full h-full px-2 py-1 border-0 text-gray-900 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500 text-xs"
                    min="0"
                  />
                </td>
                <td className="border border-gray-300 p-0">
                  <input
                    type="text"
                    value={linha.numero_vendas}
                    onChange={(e) => handleCellChange(linha.id, "numero_vendas", e.target.value)}
                    className="w-full h-full px-2 py-1 border-0 text-gray-900 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500 text-xs"
                  />
                </td>
                <td className="border border-gray-300 p-0">
                  <input
                    type="number"
                    step="0.01"
                    value={linha.valor_honorarios}
                    onChange={(e) => handleCellChange(linha.id, "valor_honorarios", e.target.value)}
                    className="w-full h-full px-2 py-1 border-0 text-gray-900 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500 text-xs"
                    min="0"
                  />
                </td>
                <td className="border border-gray-300 p-0">
                  <input
                    type="number"
                    step="0.01"
                    value={linha.valor_parcela}
                    onChange={(e) => handleCellChange(linha.id, "valor_parcela", e.target.value)}
                    className="w-full h-full px-2 py-1 border-0 text-gray-900 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500 text-xs"
                    min="0"
                  />
                </td>
                <td className="border border-gray-300 p-0">
                  <input
                    type="date"
                    value={linha.vencimento_honorario}
                    onChange={(e) => handleCellChange(linha.id, "vencimento_honorario", e.target.value)}
                    className="w-full h-full px-2 py-1 border-0 text-gray-900 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500 text-xs"
                  />
                </td>
                <td className="border border-gray-300 p-0">
                  <select
                    value={linha.empresa}
                    onChange={(e) => handleCellChange(linha.id, "empresa", e.target.value)}
                    className="w-full h-full px-2 py-1 border-0 text-gray-900 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500 text-xs appearance-none bg-white"
                  >
                    <option value=""></option>
                    {empresas.map((emp) => (
                      <option key={emp.id} value={emp.codigo}>
                        {emp.codigo}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border border-gray-300 p-0">
                  <input
                    type="text"
                    value={linha.empresa_nome}
                    readOnly
                    className="w-full h-full px-2 py-1 border-0 text-gray-700 bg-gray-50 cursor-not-allowed focus:outline-none text-xs"
                  />
                </td>
                <td className="border border-gray-300 p-0">
                  <input
                    type="text"
                    value={linha.observacoes}
                    onChange={(e) => handleCellChange(linha.id, "observacoes", e.target.value)}
                    className="w-full h-full px-2 py-1 border-0 text-gray-900 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500 text-xs"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
