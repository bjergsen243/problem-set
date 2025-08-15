import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';
import { CreateUserDto } from '../auth/dto/create-user.dto';

// GET POST PUT PATCH DELETE

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  async getMe() {
    const userId = 5;
    const data = this.userService.getUserById(userId);
    return data;
  }

  @Post('registration')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get(':id')
  show(@Param('id') id: number) {
    return this.userService.showById(+id);
  }
}
