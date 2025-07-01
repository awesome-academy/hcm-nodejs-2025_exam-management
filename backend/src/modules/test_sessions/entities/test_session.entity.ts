import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { Test } from '@/modules/tests/entities/test.entity';
import { UserAnswer } from '@/modules/user_answers/entities/user_answer.entity';

@Entity('test_sessions')
export class TestSession {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Test, (test) => test.test_sessions)
  @JoinColumn({ name: 'test_id' })
  test: Test;

  @Column()
  test_id: number;

  @ManyToOne(() => User, (user) => user.test_sessions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;

  @Column({ type: 'timestamp' })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  submitted_at: Date;

  @Column({ nullable: true })
  score: number;

  @Column({ nullable: true })
  time_spent: number;

  @Column()
  status: string;

  @Column({ default: false })
  is_completed: boolean;

  @Column({ default: true })
  auto_graded: boolean;

  @Column({ nullable: true })
  supervisor_id: number;

  @OneToMany(() => UserAnswer, (userAnswer) => userAnswer.session)
  user_answers: UserAnswer[];
}

