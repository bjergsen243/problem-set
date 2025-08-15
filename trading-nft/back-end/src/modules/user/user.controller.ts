import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from './commands/impl/create-user.command';
import { UpdateUserCommand } from './commands/impl/update-user.command';
import { DeleteUserCommand } from './commands/impl/delete-user.command';
import { GetUserByIdQuery } from './queries/impl/get-user-by-id.query';
import { GetUserByEmailQuery } from './queries/impl/get-user-by-email.query';
import { GetAllUsersQuery } from './queries/impl/get-all-users.query';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../../shared/shared.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User created successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.commandBus.execute(
        new CreateUserCommand(
          createUserDto.email,
          createUserDto.password,
          createUserDto.firstName,
          createUserDto.lastName,
        ),
      );
    } catch (error) {
      // Handle specific errors (e.g., duplicate email)
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User updated successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const result = await this.commandBus.execute(
        new UpdateUserCommand(
          id,
          updateUserDto.firstName,
          updateUserDto.lastName,
          updateUserDto.isActive,
        ),
      );

      if (!result) {
        throw new NotFoundException('User not found');
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'User deleted successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found.' })
  async deleteUser(@Param('id') id: string) {
    try {
      const result = await this.commandBus.execute(new DeleteUserCommand(id));
      
      if (!result) {
        throw new NotFoundException('User not found');
      }

      return;
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User found.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found.' })
  async getUserById(@Param('id') id: string) {
    const user = await this.queryBus.execute(new GetUserByIdQuery(id));
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Get a user by email' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User found.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found.' })
  async getUserByEmail(@Param('email') email: string) {
    const user = await this.queryBus.execute(new GetUserByEmailQuery(email));
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of users.' })
  async getAllUsers(@Query() paginationDto: PaginationQueryDto) {
    const { page = 1, limit = 10, sortBy, order = 'desc' } = paginationDto;
    
    const result = await this.queryBus.execute(
      new GetAllUsersQuery({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: sortBy ? { [sortBy]: order } : { createdAt: order },
      }),
    );

    return {
      items: result.items,
      meta: {
        page,
        limit,
        totalItems: result.total,
        totalPages: Math.ceil(result.total / limit),
        hasNextPage: page < Math.ceil(result.total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }
}
