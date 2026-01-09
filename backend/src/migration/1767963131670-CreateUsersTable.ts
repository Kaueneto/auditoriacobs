import { MigrationInterface, QueryRunner, Table } from "typeorm";


export class CreateUsersTable1767963131670 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "users",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment"
                    },
                    {
                        name: "nome",
                        type: "varchar",
                        length: "150",
                        isNullable: false
                    },

                    {
                        name: "senha_hash",
                        type: "varchar",
                        length: "255",
                        isNullable: false
                    },
                    {
                        name: "ativo",
                        type: "boolean",
                        default: true
                    },
                     {
                        name: "role",
                        type: "int",
                        default: 1
                    },
                    {
                        name: "data_cadastro",
                        type: "timestamp",
                        default: "now()"
                    },
                    {
                        name: "data_ult_edicao",
                        type: "timestamp",
                        default: "now()"
                    }
                ]
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("users");
    }

}