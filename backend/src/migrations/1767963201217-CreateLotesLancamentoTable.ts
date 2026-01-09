
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateLotesLancamentoTable1767963201217 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "lotes_lancamento",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "usuario_id",
            type: "int",
            isNullable: false,
          },
          {
            name: "total_registros_incluidos",
            type: "int",
            isNullable: false,
          },
          {
            name: "data_lancamento",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      })
    );

    await queryRunner.createForeignKey(
      "lotes_lancamento",
      new TableForeignKey({
        columnNames: ["usuario_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("lotes_lancamento");
  }

}
