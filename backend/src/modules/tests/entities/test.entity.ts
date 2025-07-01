import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { Subject } from '@/modules/subjects/entities/subject.entity';
import { TestQuestion } from '@/modules/test_questions/entities/test_question.entity';
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
  total_points: number;

  @Column()
  passing_score: number;

  @Column({ default: false })
  is_published: boolean;

  @ManyToOne(() => User, (user) => user.tests)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column()
  creator_id: number;

  @OneToMany(() => TestQuestion, (testQuestion) => testQuestion.test)
  test_questions: TestQuestion[];

  @OneToMany(() => TestSession, (testSession) => testSession.test)
  test_sessions: TestSession[];
}
