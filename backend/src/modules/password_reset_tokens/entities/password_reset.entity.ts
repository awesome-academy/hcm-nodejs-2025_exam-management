import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('password_reset_tokens')
export class PasswordResetToken {
  @PrimaryColumn()
  email: string;

  @Column()
  token: string;

  @CreateDateColumn()
  created_at: Date;

  @CreateDateColumn()
  expires_at: Date;
}
