import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Role } from '@/modules/roles/entities/role.entity';
import { Subject } from '@/modules/subjects/entities/subject.entity';
import { Test } from '@/modules/tests/entities/test.entity';
import { Question } from '@/modules/questions/entities/question.entity';
import { TestSession } from '@/modules/test_sessions/entities/test_session.entity';
import { UserAnswer } from '@/modules/user_answers/entities/user_answer.entity';
import { EmailVerificationToken } from '@/modules/email_verification_tokens/entities/email_verify.entity';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column()
  full_name: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  email_verified_at: Date;

  @Column({ nullable: true })
  remember_token: string;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column()
  role_id: number;

  @OneToMany(() => Subject, (subject) => subject.creator)
  subjects: Subject[];

  @OneToMany(() => Test, (test) => test.creator)
  tests: Test[];

  @OneToMany(() => Question, (question) => question.creator)
  questions: Question[];

  @OneToMany(() => TestSession, (testSession) => testSession.user)
  test_sessions: TestSession[];

  @OneToMany(() => UserAnswer, (userAnswer) => userAnswer.grader)
  graded_answers: UserAnswer[];

  @OneToMany(() => EmailVerificationToken, (token) => token.user)
  email_verification_tokens: EmailVerificationToken[];
}

