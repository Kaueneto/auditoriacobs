import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Metas } from "../entities/Metas";
import * as yup from "yup";

const router = express.Router();

// Listar todas as metas
router.get("/metas", async (req: Request, res: Response) => {
  try {
    const metasRepository = AppDataSource.getRepository(Metas);
    const metas = await metasRepository.find({ order: { valor_meta: "ASC" } });
    res.status(200).json(metas);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao listar metas" });
  }
});

// Criar nova meta
router.post("/metas", async (req: Request, res: Response) => {
  try {
    const schema = yup.object().shape({
      descricao_meta: yup.string().required("Descrição é obrigatória"),
      valor_meta: yup.number().required("Valor da meta é obrigatório"),
      folga: yup.number().required("Folga é obrigatória"),
      gratificacao_valor: yup.number().required("Gratificação é obrigatória"),
      tipo_gratificacao: yup.string().oneOf(["dinheiro", "voucher"]).required(),
      ativa: yup.boolean().required(),
    });

    await schema.validate(req.body, { abortEarly: false });

    const metasRepository = AppDataSource.getRepository(Metas);
    const novaMeta = metasRepository.create(req.body);

    await metasRepository.save(novaMeta);
    res.status(201).json({ mensagem: "Meta criada com sucesso", meta: novaMeta });
  } catch (error) {
    if (error instanceof yup.ValidationError)
      return res.status(400).json({ mensagem: error.errors });
    res.status(500).json({ mensagem: "Erro ao criar meta" });
  }
});

// Atualizar meta
router.put("/metas/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const metasRepository = AppDataSource.getRepository(Metas);

    const meta = await metasRepository.findOneBy({ id: parseInt(id) });
    if (!meta) return res.status(404).json({ mensagem: "Meta não encontrada" });

    metasRepository.merge(meta, req.body);
    const updatedMeta = await metasRepository.save(meta);

    res.status(200).json({ mensagem: "Meta atualizada", meta: updatedMeta });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao atualizar meta" });
  }
});

// Remover meta
router.delete("/metas/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const metasRepository = AppDataSource.getRepository(Metas);

    const meta = await metasRepository.findOneBy({ id: parseInt(id) });
    if (!meta) return res.status(404).json({ mensagem: "Meta não encontrada" });

    await metasRepository.remove(meta);
    res.status(200).json({ mensagem: "Meta removida com sucesso" });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao remover meta" });
  }
});

export default router;
