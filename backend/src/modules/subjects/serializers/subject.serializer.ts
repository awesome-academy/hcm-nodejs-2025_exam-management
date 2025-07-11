import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserSerializer } from '@/modules/users/serializers/user.serializer';
import { TestSerializer } from '@/modules/tests/serializers/test.serializer';

export class SubjectSerializer {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  code: string;

  @ApiProperty({ required: false })
  @Expose()
  description?: string;

  @ApiProperty({ required: false })
  @Expose()
  image_url?: string;

  @ApiProperty()
  @Expose()
  creator_id: number;

  @ApiProperty({ type: () => UserSerializer })
  @Expose()
  @Type(() => UserSerializer)
  creator: UserSerializer;

  @ApiProperty({ type: () => [TestSerializer] })
  @Expose()
  @Type(() => TestSerializer)
  tests: TestSerializer[];

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  created_at: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  updated_at: Date;
}
