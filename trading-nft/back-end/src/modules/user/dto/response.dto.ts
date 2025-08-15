import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../schemas/user.schema';

@Exclude()
export class UserProfileResponseDto implements Partial<User> {
  @Expose()
  @ApiProperty({
    type: String,
    example: '665d9073c420b2b3e4927c78',
  })
  id: string;

  @Expose()
  @ApiProperty({
    type: String,
    example: 'test@gmail.com',
  })
  email: string;

  @Expose()
  @ApiProperty({
    type: String,
    example: 'vippro',
  })
  username?: string;
}
