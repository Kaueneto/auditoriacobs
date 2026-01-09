import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateMetasTable1767963305247 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "metas",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },

          {
            name: "descricao_meta",
            type: "varchar",
            isNullable: false,
          },

          {
            name: "valor_meta",
            type: "decimal",
            precision: 15,
            scale: 2,
            isNullable: false,
          },

          {
            name: "folga",
            type: "int",
            default: 0,
          },

          {
            name: "gratificacao_valor",
            type: "decimal",
            precision: 15,
            scale: 2,
            default: 0,
          },

          {
            name: "tipo_gratificacao",
            type: "varchar",
            isNullable: false,
            comment: "dinheiro | voucher",
          },

          {
            name: "ativa",
            type: "boolean",
            default: true,
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("metas");
  }

}
