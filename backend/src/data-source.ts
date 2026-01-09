import "reflect-metadata";
import { DataSource } from "typeorm";
const dialect = process.env.DB_DIALECT ?? "postgres";

import { Users } from "./entities/Users";
import { LancamentosHonorarios } from "./entities/LancamentosHonorarios";
import { LoteLancamento } from "./entities/LoteLancamento";
import { Fechamento } from "./entities/Fechamento";
import { Metas } from "./entities/Metas";

//importar variavies de ambiente
import dotenv from "dotenv";
import { Empresas } from "./entities/Empresas";
//carregar as variaveis  do arquivo .env
dotenv.config();

// carrega o .env do projeto
dotenv.config();

export const AppDataSource = new DataSource({
  type: dialect as "mysql" | "mariadb" | "postgres" | "mongodb",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: true,
  entities: [Users, LancamentosHonorarios, LoteLancamento, Fechamento, Metas, Empresas],
  subscribers: [],
  migrations: [__dirname + "/migrations/*.ts"],
});
//inicializar conexao com bd

AppDataSource.initialize()
  .then(async () => {
    console.log("Banco de dados conectado com sucesso!");
    
    // verificar e executar migrations pendentes
    const pendingMigrations = await AppDataSource.showMigrations();
    
    if (pendingMigrations) {
      console.log("Executando migrations pendentes...");
      await AppDataSource.runMigrations();
      console.log("Migrations executadas com sucesso!");
    } else {
      console.log("Nenhuma migration pendente.");
    }

    // Executar seeds
    const { seedEmpresas } = await import("./seeds/seedEmpresas");
    await seedEmpresas();
  })
  .catch((error) => {
    console.log("erro na conexao com o banco de dados!", error);
  });
