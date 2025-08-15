import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { NotFoundError } from 'rxjs';
import { UserEntity } from 'src/model/entities/user.entity';
import { UserRepository } from 'src/model/repositories/user.repository';
import { CreateUserDto } from '../auth/dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(UserEntity) private userRepo: UserRepository) {}
  async getUserById(userId: number): Promise<UserEntity> {
    const user = await this.userRepo.findOne({
      where: {
        id: userId,
      },
    });
    return user;
  }
  async createUser(createUserDto: CreateUserDto): Promise<string> {
    const responseStatus = await this.registrationValidation(createUserDto);
    if (responseStatus) {
      return responseStatus;
    }
    const user = this.userRepo.create({
      email: createUserDto.email,
      password: await this.getPasswordHash(createUserDto.password),
      name: createUserDto.name,
    });
    user.save();
    return 'success create new user';
  }

  async showById(id: number): Promise<UserEntity> {
    const user = await this.findById(id);
    delete user.password;
    return user;
  }
  async findById(id: number): Promise<UserEntity> {
    return await this.userRepo.findOne({
      where: {
        id: id,
      },
    });
  }
  async findByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({
      where: {
        email: email,
      },
    });
    return user;
  }
  async findUserById(id: number): Promise<UserEntity> {
    const user = await this.userRepo.findOne({ where: { id: id } });
    if (!user) {
      throw new NotFoundException('Not found account');
    }
    return user;
  }
  private async getPasswordHash(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 12);
    return hash;
  }

  private async registrationValidation(
    createUserDto: CreateUserDto,
  ): Promise<string> {
    if (!createUserDto.email) {
      return 'Email can not be empty';
    }
    const emailRule =
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if (!emailRule.test(createUserDto.email.toLowerCase())) {
      return 'Invalid email';
    }
    const user = await this.userRepo.findOne({
      where: {
        email: createUserDto.email,
      },
    });
    if (user != null && user.email) {
      return 'Email already exist';
    }
    if (createUserDto.password != createUserDto.confirmPassword) {
      return 'Confirm password not matching';
    }
    return '';
  }
}
