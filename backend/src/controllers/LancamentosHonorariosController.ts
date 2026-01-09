import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { LancamentosHonorarios } from "../entities/LancamentosHonorarios";
import { PaginationService } from "../services/PaginationService";
import * as yup from "yup";
import { verifyToken } from "../Middleware/AuthMiddleware";
import { Not, Between, Like } from "typeorm";

const router = express.Router();

// listar todos os lancamentos - com filtro e paginação
router.get("/lancamentos", verifyToken, async (req: Request, res: Response) => {
  try {
    const repository = AppDataSource.getRepository(LancamentosHonorarios);

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { empresa, cpf_cnpj, nome_cliente, data_inicio, data_fim } = req.query;

    const where: any = {};

    if (empresa) where.empresa = Like(`%${empresa}%`);
    if (cpf_cnpj) where.cpf_cnpj = Like(`%${cpf_cnpj}%`);
    if (nome_cliente) where.nome_cliente = Like(`%${nome_cliente}%`);
    if (data_inicio && data_fim)
      where.data_lancamento = Between(new Date(data_inicio as string), new Date(data_fim as string));

    // Usar QueryBuilder para aplicar filtros dinamicamente
    let query = repository.createQueryBuilder("lancamento");

    if (empresa) query = query.where("lancamento.empresa LIKE :empresa", { empresa: `%${empresa}%` });
    if (cpf_cnpj) query = query.andWhere("lancamento.cpf_cnpj LIKE :cpf_cnpj", { cpf_cnpj: `%${cpf_cnpj}%` });
    if (nome_cliente) query = query.andWhere("lancamento.nome_cliente LIKE :nome_cliente", { nome_cliente: `%${nome_cliente}%` });
    if (data_inicio && data_fim)
      query = query.andWhere("lancamento.data_lancamento BETWEEN :data_inicio AND :data_fim", {
        data_inicio: new Date(data_inicio as string),
        data_fim: new Date(data_fim as string),
      });

    // Contar total antes de aplicar paginação
    const totalRecords = await query.getCount();
    const lastPage = Math.ceil(totalRecords / limit);

    const offset = (page - 1) * limit;

    const lancamentos = await query
      .orderBy("lancamento.id", "DESC")
      .skip(offset)
      .take(limit)
      .getMany();

    res.status(200).json({
      data: lancamentos,
      total: totalRecords,
      page,
      last_page: lastPage,
    });
  } catch (error) {
    console.error("Erro ao listar lançamentos:", error);
    res.status(500).json({ mensagem: "Erro ao listar lançamentos" });
  }
});

// buscar lancamento pelo id 
router.get("/lancamentos/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const repository = AppDataSource.getRepository(LancamentosHonorarios);

    const lancamento = await repository.findOneBy({ id: parseInt(id) });
    if (!lancamento)
      return res.status(404).json({ mensagem: "Lançamento não encontrado" });

    res.status(200).json(lancamento);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao buscar lançamento" });
  }
});

// criar novo lancamento
router.post("/lancamentos", verifyToken, async (req: Request, res: Response) => {
  try {
    const schema = yup.object().shape({
      codigo_pessoaUAU: yup.string().nullable().optional(),
      cpf_cnpj: yup.string().required(),
      nome_cliente: yup.string().required(),
      empresa: yup.string().required(),
      qtde_parcelas_pagas: yup.number().required().min(0),
      numero_vendas: yup.string().required(),
      valor_honorarios: yup.number().required().min(0),
      valor_parcela: yup.number().required().min(0),
      vencimento_honorario: yup.date().required(),
      id_user_lancamento: yup.number().required(),
      observacoes: yup.string().nullable().optional(),
      tipo_inclusao: yup.string().required().oneOf(["INDIVIDUAL", "LOTE"]),
      id_lote: yup.number().nullable().optional(),
    });

    await schema.validate(req.body, { abortEarly: false });

    const repository = AppDataSource.getRepository(LancamentosHonorarios);

    // Preparar dados e converter tipos
    const dados = {
      codigo_pessoaUAU: req.body.codigo_pessoaUAU || null,
      cpf_cnpj: req.body.cpf_cnpj,
      nome_cliente: req.body.nome_cliente,
      empresa: req.body.empresa,
      qtde_parcelas_pagas: Number(req.body.qtde_parcelas_pagas),
      numero_vendas: req.body.numero_vendas,
      valor_honorarios: String(req.body.valor_honorarios),
      valor_parcela: String(req.body.valor_parcela),
      vencimento_honorario: req.body.vencimento_honorario,
      id_user_lancamento: Number(req.body.id_user_lancamento),
      observacoes: req.body.observacoes || null,
      tipo_inclusao: req.body.tipo_inclusao,
      id_lote: req.body.id_lote || null,
      auditado: false,
      id_user_auditou: null,
      data_lancamento: new Date(),
      data_ult_edicao: new Date(),
      id_fechamento_auditoria: null,
    };

    const lancamento = repository.create(dados);

    await repository.save(lancamento);

    res.status(201).json({ mensagem: "Lançamento criado com sucesso", lancamento });
  } catch (error) {
    if (error instanceof yup.ValidationError)
      return res.status(400).json({ mensagem: error.errors });

    console.error("Erro ao criar lançamento:", error);
    res.status(500).json({ mensagem: "Erro ao criar lançamento", erro: error });
  }
});

// atualizar o lancamento 
router.put("/lancamentos/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const schema = yup.object().shape({
      codigo_pessoaUAU: yup.string(),
      cpf_cnpj: yup.string(),
      nome_cliente: yup.string(),
      empresa: yup.string(),
      qtde_parcelas_pagas: yup.number().min(0),
      numero_vendas: yup.string(),
      valor_honorarios: yup.number().min(0),
      valor_parcela: yup.number().min(0),
      vencimento_honorario: yup.date(),
    });

    await schema.validate(req.body, { abortEarly: false });

    const repository = AppDataSource.getRepository(LancamentosHonorarios);

    const lancamento = await repository.findOneBy({ id: parseInt(id) });
    if (!lancamento)
      return res.status(404).json({ mensagem: "Lançamento não encontrado" });

    repository.merge(lancamento, { ...req.body, data_ult_edicao: new Date() });
    const updated = await repository.save(lancamento);

    res.status(200).json({ mensagem: "Lançamento atualizado", lancamento: updated });
  } catch (error) {
    if (error instanceof yup.ValidationError)
      return res.status(400).json({ mensagem: error.errors });

    res.status(500).json({ mensagem: "Erro ao atualizar lançamento" });
  }
});

// remover o lancamento 
router.delete("/lancamentos/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const repository = AppDataSource.getRepository(LancamentosHonorarios);

    const lancamento = await repository.findOneBy({ id: parseInt(id) });
    if (!lancamento)
      return res.status(404).json({ mensagem: "Lançamento não encontrado" });

    await repository.remove(lancamento);

    res.status(200).json({ mensagem: "Lançamento removido com sucesso" });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao remover lançamento" });
  }
});

export default router;
