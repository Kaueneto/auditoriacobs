import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Empresas } from "../entities/Empresas";
import { verifyToken } from "../Middleware/AuthMiddleware";

const router = express.Router();

// listar todas as empresas
router.get("/empresas", verifyToken, async (req: Request, res: Response) => {
  try {
    const repository = AppDataSource.getRepository(Empresas);
    const empresas = await repository.find({
      order: { nome: "ASC" },
    });
    res.status(200).json(empresas);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao listar empresas" });
  }
});

// criar nova empresa
router.post("/empresas", verifyToken, async (req: Request, res: Response) => {
  try {
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({ mensagem: "Nome da empresa é obrigatório" });
    }

    const repository = AppDataSource.getRepository(Empresas);
    const empresa = repository.create({ nome });
    await repository.save(empresa);

    res.status(201).json({ mensagem: "Empresa criada com sucesso", empresa });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao criar empresa" });
  }
});

export default router;
