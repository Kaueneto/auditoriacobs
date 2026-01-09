import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();


//criar interface de resquest pra receber o id do usuario
interface AuthRequest extends Request{
    user?: {id: number};


}


/**
 * middleware pra validar o token de autenticacao
 * @param req - objeto de requisicao
 * @param res - objeto de resposta da req
 * @param next - funcao para passar o controle pro proximo middleware
 */

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction): void {


    //obter o tok do cabeçalho da requisicao
    const authHeader = req.headers.authorization;
    //verificar se o cabeçalho contem o token
    if (!authHeader) {
        res.status(401).json ({
        mensagem: "Token invalido ou expirado"
       });
         return;
       }
       
       const [bearer, token] = authHeader.split(" ");
       if (!token || bearer.toLowerCase() !=="bearer"){
        res.status(401).json ({
        mensagem: "Token invalido ou expirado"
       });
         return;
       }

    //separa o token do prefixo "Bearer"

    //verificar se o token foi fornecido corretamente

    try{
        //verificar e decodificar o token 
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {id: number};

        //atribuir o id do usuario autenciado
         req.user = {id: decoded.id}

        //passar o controle para a proxima funcao na rota
         next();
    } catch (error) {
       res.status(401).json ({
        mensagem: "Token invalido ou expirado"
       });
         return;
       }

    }




