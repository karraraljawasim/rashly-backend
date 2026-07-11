import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isFutureDate', async: false })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(propertyValue: Date) {
    if (!(propertyValue instanceof Date)) return false;
    return propertyValue.getTime() > Date.now();
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a future date`;
  }
}

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsFutureDateConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'isBefore', async: false })
export class IsBeforeConstraint implements ValidatorConstraintInterface {
  validate(propertyValue: unknown, args: ValidationArguments) {
    const relatedPropertyName = String(args.constraints[0]);
    const object = args.object as Record<string, unknown>;
    const relatedValue = object[relatedPropertyName];

    if (relatedValue == null) return true;

    if (!(propertyValue instanceof Date) || !(relatedValue instanceof Date)) {
      return false;
    }

    return propertyValue.getTime() < relatedValue.getTime();
  }

  defaultMessage(args: ValidationArguments) {
    const relatedPropertyName = String(args.constraints[0]);
    return `${args.property} must be strictly before ${relatedPropertyName}`;
  }
}

export function IsBefore(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsBeforeConstraint,
    });
  };
}
