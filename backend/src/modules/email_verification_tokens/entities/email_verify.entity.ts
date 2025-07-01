import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';

@Entity('email_verification_tokens')
export class EmailVerificationToken {
  @PrimaryColumn()
  user_id: number;

  @OneToOne(() => User, (user) => user.email_verification_tokens)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  token: string;

  @CreateDateColumn()
  created_at: Date;
}
