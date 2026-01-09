import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { LoteLancamento } from "../entities/LoteLancamento";
import { Users } from "../entities/Users";
import * as yup from "yup";

const router = express.Router();

// listar todos os lotes
router.get("/lotes", async (req: Request, res: Response) => {
  try {
    const loteRepository = AppDataSource.getRepository(LoteLancamento);

    const lotes = await loteRepository.find({
      relations: ["usuario"],
      order: { data_lancamento: "DESC" },
    });

    res.status(200).json(lotes);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao listar lotes" });
  }
});

// criar novo lote
router.post("/lotes", async (req: Request, res: Response) => {
  try {
    const schema = yup.object().shape({
      usuario_id: yup.number().required("ID do usuário é obrigatório"),
      total_registros_incluidos: yup.number().required("Total de registros é obrigatório"),
    });

    await schema.validate(req.body, { abortEarly: false });

    const { usuario_id, total_registros_incluidos } = req.body;

    const userRepository = AppDataSource.getRepository(Users);
    const loteRepository = AppDataSource.getRepository(LoteLancamento);

    const usuario = await userRepository.findOneBy({ id: usuario_id });
    if (!usuario) return res.status(404).json({ mensagem: "Usuário não encontrado" });

    const novoLote = loteRepository.create({
      usuario,
      total_registros_incluidos,
      data_lancamento: new Date(),
    });

    await loteRepository.save(novoLote);

    res.status(201).json({ mensagem: "Lote criado com sucesso", lote: novoLote });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return res.status(400).json({ mensagem: error.errors });
    }
    res.status(500).json({ mensagem: "Erro ao criar lote" });
  }
});

// remover lote
router.delete("/lotes/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const loteRepository = AppDataSource.getRepository(LoteLancamento);

    const lote = await loteRepository.findOneBy({ id: parseInt(id) });
    if (!lote) return res.status(404).json({ mensagem: "Lote não encontrado" });

    await loteRepository.remove(lote);
    res.status(200).json({ mensagem: "Lote removido com sucesso" });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao remover lote" });
  }
});

export default router;
