import { plainToInstance, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  PORT: number;

  @IsNotEmpty()
  @IsString()
  DATABASE_URL: string;

  @IsNotEmpty()
  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsNotEmpty()
  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsNotEmpty()
  @IsString()
  JWT_ACCESS_EXPIRY: string;

  @IsNotEmpty()
  @IsString()
  JWT_REFRESH_EXPIRY: string;

  @IsNotEmpty()
  @IsString()
  REDIS_URL: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  REDIS_PORT: number;

  @IsNotEmpty()
  @IsString()
  REDIS_HOST: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  THROTTLE_LIMIT: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  THROTTLE_TTL: number;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config);

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => Object.values(error.constraints || {}).join(', '))
      .join('\n');

    throw new Error(`Environment validation failed:\n${errorMessages}`);
  }

  return validatedConfig;
}
