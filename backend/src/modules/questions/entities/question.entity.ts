import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { Subject } from '@/modules/subjects/entities/subject.entity';
import { Answer } from '@/modules/answers/entities/answer.entity';
import { UserAnswer } from '@/modules/user_answers/entities/user_answer.entity';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('questions')
export class Question extends BaseEntity {
  @ManyToOne(() => Subject, (subject) => subject.questions)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column()
  subject_id: number;

  @Column('text')
  question_text: string;

  @Column()
  question_type: string;

  @Column()
  points: number;

  @Column()
  difficulty_level: string;

  @ManyToOne(() => User, (user) => user.questions)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column()
  creator_id: number;

  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];

  @OneToMany(() => UserAnswer, (userAnswer) => userAnswer.question)
  user_answers: UserAnswer[];

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: 1 })
  version: number;
}
