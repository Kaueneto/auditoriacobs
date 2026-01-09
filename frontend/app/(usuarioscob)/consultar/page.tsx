"use client";

import { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { ptBR } from "date-fns/locale/pt-BR";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ColDef, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import api from "@/lib/api";

ModuleRegistry.registerModules([AllCommunityModule]);
registerLocale("pt-BR", ptBR);

interface Lancamento {
  id: number;
  codigo_pessoaUAU?: string;
  cpf_cnpj: string;
  nome_cliente: string;
  empresa: string;
  qtde_parcelas_pagas: number;
  numero_vendas: string;
  valor_honorarios: number;
  valor_parcela: number;
  vencimento_honorario: string;
  data_lancamento: string;
  tipo_inclusao: string;
}

interface Empresa {
  id: number;
  codigo: string;
  nome: string;
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
}

export default function ConsultarLancamentosPage() {
  const [empresa, setEmpresa] = useState("");
  const [empresaNome, setEmpresaNome] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [nomeCliente, setNomeCliente] = useState("");
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataFim, setDataFim] = useState<Date | null>(null);
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [selectedLancamento, setSelectedLancamento] = useState<Lancamento | null>(null);
  const [selectedLancamentos, setSelectedLancamentos] = useState<Lancamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    pageSize: 15,
  });
  const gridRef = useRef<AgGridReact<Lancamento>>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleEmpresaChange = (codigo: string) => {
    setEmpresa(codigo);
    const empresaSelecionada = empresas.find((e) => e.codigo === codigo);
    setEmpresaNome(empresaSelecionada?.nome || "");
  };

  const handleLimpar = () => {
    setEmpresa("");
    setEmpresaNome("");
    setCpfCnpj("");
    setNomeCliente("");
    setDataInicio(null);
    setDataFim(null);
    setLancamentos([]);
    setSelectedLancamento(null);
    setSelectedLancamentos([]);
    setPagination({ currentPage: 1, totalPages: 1, totalRecords: 0, pageSize: 15 });
  };

  useEffect(() => {
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

  const handlePesquisar = async (pageNumber: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", pageNumber.toString());
      params.append("limit", pagination.pageSize.toString());

      if (empresa) params.append("empresa", empresa);
      if (cpfCnpj) params.append("cpf_cnpj", cpfCnpj);
      if (nomeCliente) params.append("nome_cliente", nomeCliente);

      if (dataInicio) {
        const dataInicioStr = dataInicio.toISOString().split("T")[0];
        const dataInicioTimestamp = new Date(dataInicioStr + "T00:00:00").toISOString();
        params.append("data_inicio", dataInicioTimestamp);
      }

      if (dataFim) {
        const dataFimStr = dataFim.toISOString().split("T")[0];
        const dataFimTimestamp = new Date(dataFimStr + "T23:59:59").toISOString();
        params.append("data_fim", dataFimTimestamp);
      }

      const response = await api.get(`/lancamentos?${params.toString()}`);
      setLancamentos(response.data.data || []);
      setPagination({
        currentPage: response.data.page,
        totalPages: response.data.last_page,
        totalRecords: response.data.total,
        pageSize: pagination.pageSize,
      });
      setSelectedLancamento(null);
      setSelectedLancamentos([]);
    } catch (error) {
      console.error("Erro ao buscar lançamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async () => {
    const registrosSelecionados = gridRef.current?.api.getSelectedRows() || [];
    
    if (registrosSelecionados.length === 0) {
      alert("Selecione ao menos um registro para excluir");
      return;
    }

    const mensagem = registrosSelecionados.length === 1
      ? `Deseja excluir o registro de ${registrosSelecionados[0].nome_cliente}?`
      : `Deseja excluir ${registrosSelecionados.length} registros selecionados?`;

    if (confirm(mensagem)) {
      try {
        await Promise.all(
          registrosSelecionados.map((lancamento) =>
            api.delete(`/lancamentos/${lancamento.id}`)
          )
        );
        
        const idsExcluidos = registrosSelecionados.map((l) => l.id);
        setLancamentos(lancamentos.filter((l) => !idsExcluidos.includes(l.id)));
        setSelectedLancamentos([]);
        gridRef.current?.api.deselectAll();
        alert(`${registrosSelecionados.length} registro(s) excluído(s) com sucesso!`);
      } catch (error) {
        console.error("Erro ao excluir lançamento(s):", error);
        alert("Erro ao excluir registro(s)");
      }
    }
  };

  const handleEditar = () => {
    const registrosSelecionados = gridRef.current?.api.getSelectedRows() || [];
    
    if (registrosSelecionados.length === 0) {
      alert("Selecione um registro para editar");
      return;
    }
    
    if (registrosSelecionados.length > 1) {
      alert("Selecione apenas um registro para editar");
      return;
    }
    
    alert(`Edição do registro: ${registrosSelecionados[0].nome_cliente}\nFuncionalidade será implementada em breve.`);
  };

  const tipoInclusaoRenderer = (params: any) => {
    const tipo = params.value;
    const bgColor = tipo === "LOTE" ? "bg-purple-100" : "bg-blue-100";
    const textColor = tipo === "LOTE" ? "text-purple-800" : "text-blue-800";
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${bgColor} ${textColor}`}>
        {tipo}
      </span>
    );
  };

  const moedaRenderer = (params: any) => {
    return formatCurrency(parseFloat(String(params.value)));
  };

  const dataRenderer = (params: any) => {
    return new Date(params.value).toLocaleDateString("pt-BR");
  };

  const columnDefs: ColDef<Lancamento>[] = [
    {
      headerName: "",
      field: "id",
      width: 50,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      showDisabledCheckboxes: true,
      suppressHeaderMenuButton: true,
    },
    {
      headerName: "Cód. UAU",
      field: "codigo_pessoaUAU",
      width: 100,
      valueFormatter: (params) => params.value || "-",
    },
    {
      headerName: "CPF/CNPJ",
      field: "cpf_cnpj",
      width: 130,
    },
    {
      headerName: "Nome Cliente",
      field: "nome_cliente",
      width: 260,
      wrapText: true,
      autoHeight: true,
    },
    {
      headerName: "Empresa",
      field: "empresa",
      width: 100,
    },
    {
      headerName: "Parcelas",
      field: "qtde_parcelas_pagas",
      width: 100,
      type: "numericColumn",
    },
    {
      headerName: "N° Vendas",
      field: "numero_vendas",
      width: 120,
    },
    {
      headerName: "Valor Hon.",
      field: "valor_honorarios",
      width: 130,
      type: "numericColumn",
      cellRenderer: moedaRenderer,
    },
    {
      headerName: "Valor Parcela",
      field: "valor_parcela",
      width: 140,
      type: "numericColumn",
      cellRenderer: moedaRenderer,
    },
    {
      headerName: "Vencimento",
      field: "vencimento_honorario",
      width: 100,
      cellRenderer: dataRenderer,
    },
    {
      headerName: "Data Lanc.",
      field: "data_lancamento",
      width: 100,
      cellRenderer: dataRenderer,
    },
    {
      headerName: "Tipo Lanc.",
      field: "tipo_inclusao",
      width: 110,
      cellRenderer: tipoInclusaoRenderer,
    },
  ];

  return (
    <div>
      <style jsx global>{`
        /* Estilização dos checkboxes do AG Grid */
        .ag-theme-quartz .ag-checkbox-input-wrapper {
          width: 20px;
          height: 20px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Esconder todos os elementos nativos do AG Grid */
        .ag-theme-quartz .ag-checkbox-input-wrapper input,
        .ag-theme-quartz .ag-checkbox-input-wrapper::before,
        .ag-theme-quartz .ag-checkbox-input-wrapper > * {
          opacity: 0 !important;
          width: 0 !important;
          height: 0 !important;
          position: absolute !important;
          pointer-events: none !important;
        }
        
        /* Criar checkbox customizado */
        .ag-theme-quartz .ag-checkbox-input-wrapper::after {
          content: '';
          display: block;
          width: 20px;
          height: 20px;
          border: 2px solid #d1d5db;
          border-radius: 5px;
          background-color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 1;
          pointer-events: auto;
        }
        
        .ag-theme-quartz .ag-checkbox-input-wrapper:hover::after {
          border-color: #3b82f6;
        }
        
        .ag-theme-quartz .ag-checkbox-input-wrapper.ag-checked::after {
          background-color: #3b82f6;
          border-color: #3b82f6;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='white'%3E%3Cpath fill-rule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clip-rule='evenodd'/%3E%3C/svg%3E");
          background-size: 16px 16px;
          background-position: center;
          background-repeat: no-repeat;
        }
        
        .ag-theme-quartz .ag-checkbox-input-wrapper.ag-indeterminate::after {
          background-color: #3b82f6;
          border-color: #3b82f6;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='white'%3E%3Cpath fill-rule='evenodd' d='M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z' clip-rule='evenodd'/%3E%3C/svg%3E");
          background-size: 16px 16px;
          background-position: center;
          background-repeat: no-repeat;
        }
        
        /* Ajuste de altura das linhas */
        .ag-theme-quartz .ag-row {
          min-height: 32px !important;
        }
        
        .ag-theme-quartz .ag-cell {
          line-height: 25px !important;
          padding-top: 6px;
          padding-bottom: 6px;
        }
      `}</style>
      {/* Filtros */}
      <div className="space-y-4 mb-6">
        {/* Linha 1: Empresa e Nome da Empresa */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-2">
            <label className="block text-sm text-gray-900 font-medium mb-1">Empresa</label>
            <select
              value={empresa}
              onChange={(e) => handleEmpresaChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Selecione</option>
              {empresas.map((emp) => (
                <option key={emp.id} value={emp.codigo}>
                  {emp.codigo}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-10">
            <label className="block text-sm text-gray-900 font-medium mb-1">Nome da Empresa</label>
            <input
              type="text"
              value={empresaNome}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 bg-gray-50 cursor-not-allowed"
              placeholder="Selecione uma empresa"
            />
          </div>
        </div>

        {/* Linha 2: CPF/CNPJ, Nome Cliente, Período e Botões */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-2">
            <label className="block text-sm text-gray-900 font-medium mb-1">CPF/CNPJ</label>
            <input
              type="text"
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="col-span-3">
            <label className="block text-sm text-gray-900 font-medium mb-1">Nome cliente</label>
            <input
              type="text"
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="col-span-5">
            <label className="block text-sm text-gray-900 font-medium mb-1">
              Período de lançamento
            </label>
            <DatePicker
              selectsRange
              startDate={dataInicio}
              endDate={dataFim}
              onChange={(dates: [Date | null, Date | null]) => {
                const [start, end] = dates;
                setDataInicio(start);
                setDataFim(end);
              }}
              dateFormat="dd/MM/yyyy"
              locale="pt-BR"
              placeholderText="Selecione o período"
              className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              isClearable
            />
          </div>

          <div className="col-span-2 flex items-end gap-2">
            <button
              onClick={() => handlePesquisar(1)}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 transition-colors text-sm"
            >
              Pesquisar
            </button>
            <button
              onClick={handleLimpar}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors text-sm"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Informações de Paginação */}
      {pagination.totalRecords > 0 && (
        <div className="mb-3 text-sm text-gray-600">
          Total: <strong>{pagination.totalRecords}</strong> registros | 
          Página <strong>{pagination.currentPage}</strong> de <strong>{pagination.totalPages}</strong>
        </div>
      )}

      {/* AG Grid */}
      {lancamentos.length === 0 && !loading ? (
        <div className="border border-gray-300 rounded bg-white p-4 mb-4">
          <p className="text-center text-gray-500">
            Nenhum lançamento encontrado. Use os filtros acima para pesquisar.
          </p>
        </div>
      ) : (
        <div className="ag-theme-quartz mb-4" style={{ height: "600px", width: "100%" }}>
          <AgGridReact
            ref={gridRef}
            columnDefs={columnDefs}
            rowData={lancamentos}
            pagination={false}
            domLayout="normal"
            loading={loading}
            rowSelection="multiple"
            suppressRowClickSelection={true}
            rowHeight={42}
            headerHeight={44}
            onSelectionChanged={() => {
              const selected = gridRef.current?.api.getSelectedRows() || [];
              setSelectedLancamentos(selected);
            }}
            defaultColDef={{
              resizable: true,
              sortable: true,
              filter: false,
            }}
          />
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleEditar}
          disabled={lancamentos.length === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Editar
        </button>
        <button
          onClick={handleExcluir}
          disabled={lancamentos.length === 0}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Excluir
        </button>
        {selectedLancamentos.length > 0 && (
          <span className="text-sm text-gray-600 flex items-center ml-2">
            {selectedLancamentos.length} registro(s) selecionado(s)
          </span>
        )}
      </div>
    </div>
  );
}
