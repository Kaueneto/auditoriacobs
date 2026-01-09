//importar a conexao com o banco de dados
import { AppDataSource } from "../data-source";
//importar a entidade
import { Users } from "../entities/Users";
//classe responsavel pela autenticacao do usuario
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export class AuthService {

    private userRepository = AppDataSource.getRepository(Users);
    /**
     * Metodo para autenticar um usuario com email e senha
     * @param email - email do usuario
     * @param password - senha do usuario 
     * @returns Dados do usuario autenticado e token de acesso
     * @throws Erro caso as credenciais sejam invalidas
     */
    async login(nome: string, senha: string): Promise<{id: number; nome: string; role: number; token: string}> {
        // buscar o usuario no banco de dados pelo nome 
        const user = await this.userRepository.findOneBy({ nome });

        // se o usuario nao for encontrado, lançar erro
        if(!user){
            throw new Error("Usuario ou senha invalidos");

        }
        //verificar se a senha informada corresponde a senha armazenada no banco
        const bcrypt = require('bcrypt');
        const isPasswordValid = await bcrypt.compare(senha, user.senha_hash);
        if(!isPasswordValid){
            throw new Error("Usuario ou senha invalidos");
        }
        // gerar um token jwt para o usuario autenticado

        //o token inclui o id do usuario e expira em sete dias
        const token = jwt.sign({ id: user.id, nome: user.nome, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: "7d"})
        

        //retornar os dados do usuario autenticado junto com o token gerado 
        return {id: user.id, nome: user.nome, role: user.role, token};
    }
}
