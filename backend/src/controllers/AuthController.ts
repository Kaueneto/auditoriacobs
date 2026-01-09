import express, { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { verifyToken } from "../Middleware/AuthMiddleware";

const router = express.Router();

// rota de login
router.post("/auth/login", async (req: Request, res: Response) => {
  try {
    // extrair nome e senha do corpo da requisição
    const { nome, senha } = req.body;
    
    if (!nome || !senha) {
      res.status(400).json({
        message: "Nome e senha são obrigatórios!",
      });
      return;
    }
    
    //criar uma instancia do servico de autenticacao
    const authService = new AuthService();
    
    //chamar o metodo de login para validar as credencias 
    const userData = await authService.login(nome, senha);
    
    // retornar a resposta de sucesso
    res.status(200).json({
      mensagem: "Login realizado com sucesso!",
      token: userData.token,
      usuario: {
        id: userData.id,
        nome: userData.nome,
        role: userData.role,
      },
    });
    return;
  } catch (error: any) {
    // retornar erro em caso de falha
    res.status(401).json({
      message: error.message || "Erro ao realizar o login",
    });
    return;
  }
});

// rota de validação de token
router.get("/auth/validate-token", verifyToken, async (req: Request, res: Response) => {
  res.status(200).json({
    message: "Token válido!",
    userId: (req as any).userId,
  });
});

export default router;
