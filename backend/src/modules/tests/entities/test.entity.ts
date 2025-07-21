import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { Subject } from '@/modules/subjects/entities/subject.entity';
import { TestSession } from '@/modules/test_sessions/entities/test_session.entity';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('tests')
export class Test extends BaseEntity {
  @ManyToOne(() => Subject, (subject) => subject.tests)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column()
  subject_id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  time_limit: number;

  @Column()
  passing_score: number;

  @Column({ default: false })
  is_published: boolean;

  @Column({ default: 1, type: 'int' })
  version: number;

  @Column({ default: true })
  is_latest: boolean;

  @Column({ nullable: true, type: 'int' })
  question_count: number;

  @Column({ nullable: true, type: 'int' })
  easy_question_count: number;

  @Column({ nullable: true, type: 'int' })
  medium_question_count: number;

  @Column({ nullable: true, type: 'int' })
  hard_question_count: number;

  @ManyToOne(() => User, (user) => user.tests)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column()
  creator_id: number;

  @OneToMany(() => TestSession, (testSession) => testSession.test)
  test_sessions: TestSession[];
}
