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
export class IsEmailAvailableConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly userRepository: UserRepository) {}
  async validate(email: string) {
    if (!email) return true;
    const user = await this.userRepository.findOne({ email });
    return !user;
  }

  defaultMessage() {
    return `Username $value already exists`;
  }
}

export function IsEmailAvailable(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      name: 'IsEmailAvailable',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsEmailAvailableConstraint,
    });
  };
}
