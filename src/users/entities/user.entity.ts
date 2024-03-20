import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { Lang } from '../enums/lang.enum';
  
  @Entity('user')
  export class User {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'int', unique: true })
    telegramId: number;

    @Column({ type: 'enum', enum: Lang })
    lang: Lang;
  }
  