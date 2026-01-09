import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn,} from "typeorm";
import { Users } from "./Users";
import { LancamentosHonorarios } from "./LancamentosHonorarios";

@Entity("lotes_lancamento")
export class LoteLancamento {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Users)
  @JoinColumn({ name: "usuario_id" })
  usuario!: Users;

  @Column()
  total_registros_incluidos!: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  data_lancamento!: Date;

  @OneToMany(() => LancamentosHonorarios, (l) => l.lote)
  lancamentos!: LancamentosHonorarios[];
}
