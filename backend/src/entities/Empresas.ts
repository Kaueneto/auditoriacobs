import { Entity, PrimaryGeneratedColumn, Column,} from "typeorm";

@Entity("empresas")
export class Empresas {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  codigo!: string;

  @Column()
  nome!: string;
}
