import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Users } from "../entities/Users";
import * as yup from "yup";
import bcrypt from "bcrypt";

const router = express.Router();

// criar usuario
router.post("/users", async (req: Request, res: Response) => {
  try {
    const schema = yup.object().shape({
      nome: yup.string().required("O nome é obrigatório").min(3),
      senha_hash: yup.string().required("A senha é obrigatória").min(6),
      role: yup.number().required("O role é obrigatório"),
      ativo: yup.boolean().required("O campo ativo é obrigatório"),
    });

    await schema.validate(req.body, { abortEarly: false });

    const userRepository = AppDataSource.getRepository(Users);

    // verificar se ja existe usuario com esse nome 
    const existingUser = await userRepository.findOneBy({ nome: req.body.nome });
    if (existingUser) {
      return res.status(400).json({ mensagem: "Usuário com esse nome já existe" });
    }

    // criptografar a senha 
    const hashedPassword = await bcrypt.hash(req.body.senha_hash, 10);

    const user = userRepository.create({
      nome: req.body.nome,
      senha_hash: hashedPassword,
      role: req.body.role,
      ativo: req.body.ativo,
      data_cadastro: new Date(),
    });

    await userRepository.save(user);

    res.status(201).json({ mensagem: "Usuário criado com sucesso", user });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return res.status(400).json({ mensagem: error.errors });
    }
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao criar usuário", error: (error as Error).message });
  }
});

// listar usuarios
router.get("/users", async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(Users);

    const users = await userRepository.find({
      order: { id: "DESC" },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao listar usuários", error: (error as Error).message });
  }
});

// buscar usuario pelo id 
router.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRepository = AppDataSource.getRepository(Users);

    const user = await userRepository.findOneBy({ id: parseInt(id) });

    if (!user) return res.status(404).json({ mensagem: "Usuário não encontrado" });

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao buscar usuário", error: (error as Error).message });
  }
});

// atualizar usuario 
router.put("/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const schema = yup.object().shape({
      nome: yup.string().min(3),
      senha: yup.string().min(6),
      role: yup.number(),
      ativo: yup.boolean(),
    });

    await schema.validate(req.body, { abortEarly: false });

    const userRepository = AppDataSource.getRepository(Users);
    const user = await userRepository.findOneBy({ id: parseInt(id) });
    if (!user) return res.status(404).json({ mensagem: "Usuário não encontrado" });

    // atualizar campos
    if (req.body.nome) user.nome = req.body.nome;
    if (req.body.role !== undefined) user.role = req.body.role;
    if (req.body.ativo !== undefined) user.ativo = req.body.ativo;
    if (req.body.senha) {
      user.senha_hash = await bcrypt.hash(req.body.senha, 10);
    }

    await userRepository.save(user);

    res.status(200).json({ mensagem: "Usuário atualizado com sucesso", user });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return res.status(400).json({ mensagem: error.errors });
    }
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao atualizar usuário", error: (error as Error).message });
  }
});

// deletar usuario
router.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRepository = AppDataSource.getRepository(Users);

    const user = await userRepository.findOneBy({ id: parseInt(id) });
    if (!user) return res.status(404).json({ mensagem: "Usuário não encontrado" });

    await userRepository.remove(user);

    res.status(200).json({ mensagem: "Usuário removido com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao remover usuário", error: (error as Error).message });
  }
});

export default router;
