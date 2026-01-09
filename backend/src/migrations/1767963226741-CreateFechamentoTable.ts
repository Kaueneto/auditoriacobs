import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";


export class CreateFechamentoTable1767963226741 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "fechamento",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },

          {
            name: "periodo_inicio",
            type: "timestamp",
            isNullable: false,
          },
          {
            name: "periodo_fim",
            type: "timestamp",
            isNullable: false,
          },
          {
            name: "empresa",
            type: "varchar",
            isNullable: false,
          },

          {
            name: "usuario_cobranca_id",
            type: "int",
            isNullable: false,
          },

          {
            name: "total_custas_recebidas",
            type: "decimal",
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: "total_excecoes",
            type: "decimal",
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: "total_descontos",
            type: "decimal",
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: "base_calculo",
            type: "decimal",
            precision: 15,
            scale: 2,
            default: 0,
          },


          {
            name: "percentual_comissao",
            type: "decimal",
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: "valor_usuario",
            type: "decimal",
            precision: 15,
            scale: 2,
            default: 0,
          },



          {
            name: "percentual_comissao_gerencia",
            type: "decimal",
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: "valor_gerencia",
            type: "decimal",
            precision: 15,
            scale: 2,
            default: 0,
          },


          {
            name: "percentual_aliquota_imposto",
            type: "decimal",
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: "valor_imposto",
            type: "decimal",
            precision: 15,
            scale: 2,
            default: 0,
          },



          {
            name: "valor_gratificacao",
            type: "decimal",
            precision: 15,
            scale: 2,
            default: 0,
          },


          {
            name: "valor_liquido_total",
            type: "decimal",
            precision: 15,
            scale: 2,
            default: 0,
          },


          {
            name: "usuario_auditoria_id",
            type: "int",
            isNullable: true,
          },
          {
            name: "data_auditoria",
            type: "timestamp",
            isNullable: true,
          },

          {
            name: "qtde_registros_auditados",
            type: "int",
            default: 0,
          },
        ],
      })
    );

    await queryRunner.createForeignKeys("fechamento", [
      new TableForeignKey({
        columnNames: ["usuario_cobranca_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      }),
      new TableForeignKey({
        columnNames: ["usuario_auditoria_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("fechamento");
  }

}
