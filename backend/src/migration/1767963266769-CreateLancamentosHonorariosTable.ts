import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateLancamentosHonorariosTable1767963266769 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "lancamentos_honorarios",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "codigo_pessoaUAU",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "cpf_cnpj",
            type: "varchar",
            length: "14",
            isNullable: false,
          },
          {
            name: "nome_cliente",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "empresa",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "qtde_parcelas_pagas",
            type: "int",
            isNullable: false,
          },
          {
            name: "numero_vendas",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "valor_honorarios",
            type: "decimal",
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: "valor_parcela",
            type: "decimal",
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: "vencimento_honorario",
            type: "date",
            isNullable: false,
          },
          {
            name: "id_user_lancamento",
            type: "int",
            isNullable: false,
          },
          {
            name: "auditado",
            type: "boolean",
            default: false,
          },
          {
            name: "id_user_auditou",
            type: "int",
            isNullable: true,
          },
          {
            name: "data_lancamento",
            type: "timestamptz",
            default: "now()",
          },
          {
            name: "data_auditoria",
            type: "timestamptz",
            isNullable: true,
          },
          {
            name: "data_ult_edicao",
            type: "timestamptz",
            isNullable: true,
          },
          {
            name: "observacoes",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "tipo_inclusao",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "id_lote",
            type: "int",
            isNullable: true,
          },
          {
            name: "id_fechamento_auditoria",
            type: "int",
            isNullable: true,
          },
          {
            name: "status_lancamento",
            type: "varchar",
            default: "'PENDENTE'",
          },
        ],
      })
    );

    await queryRunner.createForeignKeys("lancamentos_honorarios", [
      new TableForeignKey({
        columnNames: ["id_lote"],
        referencedTableName: "lotes_lancamento",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        columnNames: ["id_fechamento_auditoria"],
        referencedTableName: "fechamento",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        columnNames: ["id_user_auditou"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("lancamentos_honorarios");
  }

}
