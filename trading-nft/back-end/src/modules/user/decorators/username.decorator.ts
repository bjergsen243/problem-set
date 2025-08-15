import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UserRepository } from '../repositories';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUsernameAvailableConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly userRepository: UserRepository) {}
  async validate(username: string) {
    if (!username) return true;
    const user = await this.userRepository.findOne({ username });
    return !user;
  }

  defaultMessage() {
    return `Username $value already exists`;
  }
}

export function IsUsernameAvailable(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      name: 'IsUsernameAvailable',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsUsernameAvailableConstraint,
    });
  };
}
