import { Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserSerializer {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  username: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  full_name: string;

  @ApiProperty({ required: false })
  @Expose()
  avatar_url?: string;

  @ApiProperty()
  @Expose()
  is_active: boolean;

  @ApiProperty({ required: false })
  @Expose()
  email_verified_at?: Date;

  @ApiProperty()
  @Expose()
  role_id: number;

  @Expose()
  @Transform(({ obj }) => obj.role?.name)
  @ApiProperty()
  role_name: string;

  @ApiProperty()
  @Expose()
  created_at: Date;

  @ApiProperty()
  @Expose()
  updated_at: Date;
}
