import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { LancamentosHonorarios } from "../entities/LancamentosHonorarios";
import * as yup from "yup";
import { verifyToken } from "../Middleware/AuthMiddleware";
import { Not, Between, Like } from "typeorm";

const router = express.Router();

// listar todos os lancamentos - com filtro
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

    const [lancamentos, total] = await repository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { id: "DESC" },
    });

    res.status(200).json({
      data: lancamentos,
      total,
      page,
      last_page: Math.ceil(total / limit),
    });
  } catch (error) {
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
      codigo_pessoaUAU: yup.string().required(),
      cpf_cnpj: yup.string().required(),
      nome_cliente: yup.string().required(),
      empresa: yup.string().required(),
      qtde_parcelas_pagas: yup.number().required().min(0),
      numero_vendas: yup.string().required(),
      valor_honorarios: yup.number().required().min(0),
      valor_parcela: yup.number().required().min(0),
      vencimento_honorario: yup.date().required(),
      id_user_lancamento: yup.number().required(),
      tipo_inclusao: yup.string().oneOf(["individual", "lote"]).required(),
      id_lote: yup.number().nullable(),
    });

    await schema.validate(req.body, { abortEarly: false });

    const repository = AppDataSource.getRepository(LancamentosHonorarios);

    const lancamento = repository.create({
      ...req.body,
      auditado: false,
      id_user_auditou: null,
      data_lancamento: new Date(),
      data_ult_edicao: new Date(),
      id_fechamento_auditoria: null,
    });

    await repository.save(lancamento);

    res.status(201).json({ mensagem: "Lançamento criado com sucesso", lancamento });
  } catch (error) {
    if (error instanceof yup.ValidationError)
      return res.status(400).json({ mensagem: error.errors });

    res.status(500).json({ mensagem: "Erro ao criar lançamento" });
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
