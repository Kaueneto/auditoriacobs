import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";

//criar aplicacao express
const router = express.Router();

// rota principal da aplicacao
router.get("/test-connection", (req: Request, res: Response) => {
  res.status(200).json({ message: "Conexão com API realizada com sucesso" });
});

// rota para testar conexão com o banco de dados
router.get("/test-db", async (req: Request, res: Response) => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    // testar uma query simples
    await AppDataSource.query('SELECT 1');
    
    res.status(200).json({ 
      message: "Conexão com o banco de dados realizada com sucesso!",
      database: process.env.DB_DATABASE,
      host: process.env.DB_HOST
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erro ao conectar com o banco de dados",
      error: (error as Error).message 
    });
  }
});

export default router;
