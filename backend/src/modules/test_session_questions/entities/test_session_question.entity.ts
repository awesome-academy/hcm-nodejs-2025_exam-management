import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TestSession } from '@/modules/test_sessions/entities/test_session.entity';
import { Question } from '@/modules/questions/entities/question.entity';

@Entity('test_session_questions')
export class TestSessionQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TestSession, (session) => session.test_session_questions)
  @JoinColumn({ name: 'session_id' })
  session: TestSession;

  @Column()
  session_id: number;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column()
  question_id: number;

  @Column({ type: 'json', nullable: true })
  answers_snapshot: {
    id: number;
    answer_text: string;
    is_correct: boolean;
    explanation: string;
  }[];

  @Column()
  order_number: number;
}
