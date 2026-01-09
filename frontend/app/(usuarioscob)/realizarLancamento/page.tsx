"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { ptBR } from "date-fns/locale/pt-BR";
import api from "@/lib/api";
import { getAuthData } from "@/lib/auth";

registerLocale("pt-BR", ptBR);

interface LancamentoForm {
  codigo_pessoaUAU?: string;
  cpf_cnpj: string;
  nome_cliente: string;
  empresa: string;
  qtde_parcelas_pagas: number;
  numero_vendas: string;
  valor_honorarios: number;
  valor_parcela: number;
  vencimento_honorario: string;
}

interface Lancamento {
  id: number;
  nome_cliente: string;
  valor_honorarios: string;
  data_lancamento: string;
}

interface Empresa {
  id: number;
  codigo: string;
  nome: string;
}

export default function RealizarLancamentoPage() {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lancamentosRecentes, setLancamentosRecentes] = useState<Lancamento[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaNome, setEmpresaNome] = useState("");
  const [valorHonorariosDisplay, setValorHonorariosDisplay] = useState("");
  const [valorParcelaDisplay, setValorParcelaDisplay] = useState("");
  const [vencimentoHonorario, setVencimentoHonorario] = useState<Date | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatCurrencyInput = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");
    if (!numbers) return "";
    
    // Converte para número (os últimos 2 dígitos são centavos)
    const numValue = parseFloat(numbers) / 100;
    
    // Formata com separador de milhares e decimais
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);
  };

  const parseCurrencyInput = (value: string): number => {
    if (!value) return 0;
    // Remove pontos de milhar e substitui vírgula por ponto
    const cleanValue = value.replace(/\./g, "").replace(",", ".");
    return parseFloat(cleanValue) || 0;
  };

  const handleValorHonorariosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setValorHonorariosDisplay(formatted);
    setValue("valor_honorarios", parseCurrencyInput(formatted));
  };

  const handleValorParcelaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setValorParcelaDisplay(formatted);
    setValue("valor_parcela", parseCurrencyInput(formatted));
  };

  const handleEmpresaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const codigo = e.target.value;
    setValue("empresa", codigo);
    const empresaSelecionada = empresas.find((emp) => emp.codigo === codigo);
    setEmpresaNome(empresaSelecionada?.nome || "");
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LancamentoForm>({
    defaultValues: {
      qtde_parcelas_pagas: 1,
    },
  });

  const qtdeParcelas = watch("qtde_parcelas_pagas");

  useEffect(() => {
    const { user } = getAuthData();
    if (user) {
      setUserId(user.id);
      fetchLancamentosRecentes(user.id);
    }
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    try {
      const response = await api.get("/empresas");
      setEmpresas(response.data || []);
    } catch (err) {
      console.error("Erro ao buscar empresas");
    }
  };

  const fetchLancamentosRecentes = async (userId: number) => {
    try {
      const hoje = new Date().toISOString().split("T")[0];
      const response = await api.get(
        `/lancamentos?id_user_lancamento=${userId}&data_lancamento=${hoje}`
      );
      setLancamentosRecentes(response.data.data || []);
    } catch (err) {
      console.error("Erro ao buscar lancamentos recentes");
      setLancamentosRecentes([]);
    }
  };

  const onSubmit = async (data: LancamentoForm) => {
    if (!userId) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const vencimentoFormatado = vencimentoHonorario 
        ? vencimentoHonorario.toISOString().split("T")[0]
        : "";

      await api.post("/lancamentos", {
        ...data,
        vencimento_honorario: vencimentoFormatado,
        id_user_lancamento: userId,
        tipo_inclusao: "INDIVIDUAL",
        status_lancamento: "PENDENTE",
      });

      setSuccess("Lancamento incluido com sucesso!");
      reset({
        qtde_parcelas_pagas: 1,
      });
      setValorHonorariosDisplay("");
      setValorParcelaDisplay("");
      setEmpresaNome("");
      setVencimentoHonorario(null);
      fetchLancamentosRecentes(userId);
    } catch (err: any) {
      setError(err.response?.data?.mensagem || "Erro ao incluir lancamento");
    } finally {
      setLoading(false);
    }
  };

  const handleLimpar = () => {
    reset({
      qtde_parcelas_pagas: 1,
    });
    setValorHonorariosDisplay("");
    setValorParcelaDisplay("");
    setEmpresaNome("");
    setVencimentoHonorario(null);
    setSuccess("");
    setError("");
  };

  const incrementParcelas = () => {
    setValue("qtde_parcelas_pagas", (qtdeParcelas || 0) + 1);
  };

  const decrementParcelas = () => {
    if ((qtdeParcelas || 0) > 1) {
      setValue("qtde_parcelas_pagas", (qtdeParcelas || 0) - 1);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Formulário - 9 colunas */}
      <div className="col-span-9">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Código Pessoa UAU */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Codigo Pessoa UAU
            </label>
            <input
              {...register("codigo_pessoaUAU")}
              type="text"
              className="w-48 px-3 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* CPF/CNPJ e Nome Cliente */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                CPF/CNPJ
              </label>
              <input
                {...register("cpf_cnpj")}
                type="text"
                maxLength={14}
                className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.cpf_cnpj && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.cpf_cnpj.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Nome cliente
              </label>
              <input
                {...register("nome_cliente")}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.nome_cliente && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.nome_cliente.message}
                </p>
              )}
            </div>
          </div>

          {/* Empresa */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-gray-700 mb-1">Empresa</label>
              <select
                {...register("empresa")}
                onChange={handleEmpresaChange}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Selecione...</option>
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.codigo}>
                    {emp.codigo}
                  </option>
                ))}
              </select>
              {errors.empresa && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.empresa.message}
                </p>
              )}
            </div>
            <div className="col-span-10">
              <label className="block text-sm text-gray-700 mb-1">Nome da Empresa</label>
              <input
                type="text"
                value={empresaNome}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 bg-gray-50 cursor-not-allowed"
                placeholder="Selecione uma empresa"
              />
            </div>
          </div>

          {/* Qtde parcelas e Número vendas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Qtde parcelas pagas
              </label>
              <div className="flex items-center gap-2">
                <input
                  {...register("qtde_parcelas_pagas")}
                  type="number"
                  min="1"
                  className="w-24 px-3 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={incrementParcelas}
                    className="px-2 py-0 text-xs border border-gray-300 rounded-t hover:bg-gray-100"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={decrementParcelas}
                    className="px-2 py-0 text-xs border border-gray-300 rounded-b hover:bg-gray-100"
                  >
                    ▼
                  </button>
                </div>
              </div>
              {errors.qtde_parcelas_pagas && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.qtde_parcelas_pagas.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Numero vendas
              </label>
              <input
                {...register("numero_vendas")}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.numero_vendas && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.numero_vendas.message}
                </p>
              )}
            </div>
          </div>

          {/* Valores e Vencimento */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Valor honorarios
              </label>
              <input
                type="text"
                value={valorHonorariosDisplay}
                onChange={handleValorHonorariosChange}
                placeholder="0,00"
                className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.valor_honorarios && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.valor_honorarios.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Valor parcela
              </label>
              <input
                type="text"
                value={valorParcelaDisplay}
                onChange={handleValorParcelaChange}
                placeholder="0,00"
                className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.valor_parcela && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.valor_parcela.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Vencimento Honorario
              </label>
              <DatePicker
                selected={vencimentoHonorario}
                onChange={(date: Date | null) => setVencimentoHonorario(date)}
                dateFormat="dd/MM/yyyy"
                locale="pt-BR"
                placeholderText="Selecione a data"
                className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.vencimento_honorario && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.vencimento_honorario.message}
                </p>
              )}
            </div>
          </div>

          {/* Mensagens */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
              {success}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={handleLimpar}
              className="bg-blue-600 text-white px-12 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Limpar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-12 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Incluindo..." : "Incluir"}
            </button>
          </div>
        </form>
      </div>

      {/* Lançamentos Recentes - 3 colunas */}
      <div className="col-span-3">
        <div className="border-t border-gray-300 pt-4">
          <h3 className="text-sm text-gray-600 mb-4">
            Seus lancamentos recentes
          </h3>
          <div className="space-y-2">
            {lancamentosRecentes.length === 0 ? (
              <p className="text-sm text-gray-500">
                Nenhum lancamento hoje
              </p>
            ) : (
              lancamentosRecentes.map((lanc) => (
                <div
                  key={lanc.id}
                  className="bg-gray-50 p-3 rounded text-sm border border-gray-200"
                >
                  <p className="font-medium text-gray-800">{lanc.nome_cliente}</p>
                  <p className="text-gray-600">
                    {formatCurrency(parseFloat(lanc.valor_honorarios))}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(lanc.data_lancamento).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

