import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Test } from '@/modules/tests/entities/test.entity';
import { Question } from '@/modules/questions/entities/question.entity';

@Entity('test_questions')
export class TestQuestion {
  @PrimaryColumn()
  test_id: number;

  @PrimaryColumn()
  question_id: number;

  @ManyToOne(() => Test, (test) => test.test_questions)
  @JoinColumn({ name: 'test_id' })
  test: Test;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column()
  order_number: number;
}
