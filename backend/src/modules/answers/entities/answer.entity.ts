import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Question } from '@/modules/questions/entities/question.entity';
import { UserAnswer } from '@/modules/user_answers/entities/user_answer.entity';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('answers')
export class Answer extends BaseEntity {
  @ManyToOne(() => Question, (question) => question.answers)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column()
  question_id: number;

  @Column('text')
  answer_text: string;

  @Column({ default: false })
  is_correct: boolean;

  @Column({ nullable: true })
  explanation: string;

  @OneToMany(() => UserAnswer, (userAnswer) => userAnswer.answer)
  user_answers: UserAnswer[];
}
