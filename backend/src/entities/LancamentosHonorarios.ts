import {Entity,PrimaryGeneratedColumn,Column,ManyToOne,JoinColumn,} from "typeorm";
import { Users } from "./Users";
import { LoteLancamento } from "./LoteLancamento";
import { Fechamento } from "./Fechamento";

@Entity("lancamentos_honorarios")
export class LancamentosHonorarios {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  codigo_pessoaUAU!: string;

  @Column()
  cpf_cnpj!: string;

  @Column()
  nome_cliente!: string;

  @Column()
  empresa!: string;

  @Column()
  qtde_parcelas_pagas!: number;

  @Column()
  numero_vendas!: string;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  valor_honorarios!: string;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  valor_parcela!: string;

  @Column({ type: "date" })
  vencimento_honorario!: Date;

  @ManyToOne(() => Users)
  @JoinColumn({ name: "id_user_lancamento" })
  usuarioLancamento!: Users;

  @ManyToOne(() => Users, { nullable: true })
  @JoinColumn({ name: "id_user_auditou" })
  usuarioAuditoria!: Users | null;

  @Column({ default: false })
  auditado!: boolean;

  @Column()
  tipo_inclusao!: string; // INDIVIDUAL | LOTE

  @ManyToOne(() => LoteLancamento, { nullable: true })
  @JoinColumn({ name: "id_lote" })
  lote!: LoteLancamento | null;

  @ManyToOne(() => Fechamento, { nullable: true })
  @JoinColumn({ name: "id_fechamento_auditoria" })
  fechamento!: Fechamento | null;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  data_lancamento!: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  data_ult_edicao!: Date;

  @Column({ type: "timestamp", nullable: true })
  data_auditoria!: Date | null;

  @Column({ type: "varchar", nullable: true })
  observacoes!: string | null;

  @Column({ type: "varchar", default: "PENDENTE" })
  status_lancamento!: string;
}
