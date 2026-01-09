import { Entity, PrimaryGeneratedColumn, Column, OneToMany,} from "typeorm";
import { LancamentosHonorarios } from "./LancamentosHonorarios";
import { LoteLancamento } from "./LoteLancamento";
import { Fechamento } from "./Fechamento";

@Entity("users")
export class Users {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nome!: string;

  @Column()
  senha_hash!: string;

  @Column()
  role!: number;

  @Column({ default: true })
  ativo!: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  data_cadastro!: Date;

  /* RELAÇÕES */
  @OneToMany(() => LancamentosHonorarios, (l) => l.usuarioLancamento)
  lancamentos!: LancamentosHonorarios[];

  @OneToMany(() => LoteLancamento, (l) => l.usuario)
  lotes!: LoteLancamento[];

  @OneToMany(() => Fechamento, (f) => f.usuarioAuditoria)
  auditorias!: Fechamento[];
}
