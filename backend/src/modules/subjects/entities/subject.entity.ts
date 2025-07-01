import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { Test } from '@/modules/tests/entities/test.entity';
import { Question } from '@/modules/questions/entities/question.entity';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('subjects')
export class Subject extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User, (user) => user.subjects)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column()
  creator_id: number;

  @OneToMany(() => Test, (test) => test.subject)
  tests: Test[];

  @OneToMany(() => Question, (question) => question.subject)
  questions: Question[];
}
