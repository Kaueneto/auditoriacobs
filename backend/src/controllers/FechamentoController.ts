import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Fechamento } from "../entities/Fechamento";
import * as yup from "yup";

const router = express.Router();

// listar fechamentos
router.get("/fechamentos", async (req: Request, res: Response) => {
  try {
    const fechamentoRepository = AppDataSource.getRepository(Fechamento);
    const fechamentos = await fechamentoRepository.find({
      order: { data_auditoria: "DESC" },
    });
    res.status(200).json(fechamentos);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao listar fechamentos" });
  }
});

// criar registro fechamento
router.post("/fechamentos", async (req: Request, res: Response) => {
  try {
    const schema = yup.object().shape({
      periodo_inicio: yup.date().required(),
      periodo_fim: yup.date().required(),
      empresa: yup.string().required(),
      usuario_cobranca_id: yup.number().required(),
    });

    await schema.validate(req.body, { abortEarly: false });

    const fechamentoRepository = AppDataSource.getRepository(Fechamento);

    //  implementar aqui a lógica de cálculo dos valores, metas, impostos etc

//  implementar aqui a lógica de cálculo dos valores, metas, impostos etc






    const novoFechamento = fechamentoRepository.create({
      ...req.body,
      data_auditoria: new Date(),
    });

    await fechamentoRepository.save(novoFechamento);
    res.status(201).json({ mensagem: "Fechamento criado", fechamento: novoFechamento });
  } catch (error) {
    if (error instanceof yup.ValidationError)
      return res.status(400).json({ mensagem: error.errors });
    res.status(500).json({ mensagem: "Erro ao criar fechamento" });
  }
});

export default router;
