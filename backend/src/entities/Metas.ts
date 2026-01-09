import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("metas")
export class Metas {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  descricao_meta!: string;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  valor_meta!: string;

  @Column()
  folga!: number;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  gratificacao_valor!: string;

  @Column()
  tipo_gratificacao!: string; // DINHEIRO | VOUCHER

  @Column({ default: true })
  ativa!: boolean;
}
