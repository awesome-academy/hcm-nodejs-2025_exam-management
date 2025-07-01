import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { TestSession } from '@/modules/test_sessions/entities/test_session.entity';
import { Question } from '@/modules/questions/entities/question.entity';
import { Answer } from '@/modules/answers/entities/answer.entity';

@Entity('user_answers')
export class UserAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TestSession, (testSession) => testSession.user_answers)
  @JoinColumn({ name: 'session_id' })
  session: TestSession;

  @Column()
  session_id: number;

  @ManyToOne(() => Question, (question) => question.user_answers)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column()
  question_id: number;

  @ManyToOne(() => Answer, (answer) => answer.user_answers, { nullable: true })
  @JoinColumn({ name: 'answer_id' })
  answer: Answer;

  @Column({ nullable: true })
  answer_id: number;

  @Column({ nullable: true })
  answer_text: string;

  @Column({ default: false })
  is_correct: boolean;

  @Column({ nullable: true })
  points_earned: number;

  @ManyToOne(() => User, (user) => user.graded_answers, { nullable: true })
  @JoinColumn({ name: 'grader_id' })
  grader: User;

  @Column({ nullable: true })
  grader_id: number;

  @Column({ type: 'timestamp', nullable: true })
  graded_at: Date;
}
