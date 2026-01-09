import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn,} from "typeorm";
import { Users } from "./Users";
import { LancamentosHonorarios } from "./LancamentosHonorarios";

@Entity("fechamento")
export class Fechamento {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "timestamp" })
  periodo_inicio!: Date;

  @Column({ type: "timestamp" })
  periodo_fim!: Date;

  @Column()
  empresa!: string;

  @ManyToOne(() => Users)
  @JoinColumn({ name: "usuario_cobranca_id" })
  usuarioCobranca!: Users;

  @ManyToOne(() => Users)
  @JoinColumn({ name: "usuario_auditoria_id" })
  usuarioAuditoria!: Users;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  total_custas_recebidas!: string;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  total_excecoes!: string;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  total_descontos!: string;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  base_calculo!: string;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  percentual_comissao!: string;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  valor_usuario!: string;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  percentual_comissao_gerencia!: string;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  valor_gerencia!: string;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  percentual_aliquota_imposto!: string;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  valor_imposto!: string;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  valor_gratificacao!: string;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  valor_liquido_total!: string;

  @Column()
  qtde_registros_auditados!: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  data_auditoria!: Date;

  @OneToMany(() => LancamentosHonorarios, (l) => l.fechamento)
  lancamentos!: LancamentosHonorarios[];
}
