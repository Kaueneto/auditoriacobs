import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateEmpresasTable1767972725095 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
     await queryRunner.createTable(
       new Table({
         name: "empresas",
         columns: [
           {
             name: "id",
             type: "int",
             isPrimary: true,
             isGenerated: true,
             generationStrategy: "increment",
           },
 
           {
             name: "codigo",
             type: "varchar",
             isNullable: false,
           },
            {
             name: "nome",
             type: "varchar",
             isNullable: false,
           }
         ],
       })
     );
   }
 
   public async down(queryRunner: QueryRunner): Promise<void> {
     await queryRunner.dropTable("empresas");
   }
 
 }
 