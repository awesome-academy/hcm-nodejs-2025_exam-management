import { ApiProperty } from '@nestjs/swagger';
import { UserSerializer } from '@/modules/users/serializers/user.serializer';

export class LoginResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty({ type: () => UserSerializer })
  user: UserSerializer;
}
