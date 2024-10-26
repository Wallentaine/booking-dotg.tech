import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { LogstashSchema, RedisSchema, TCompanySchema } from './schemas';
import { Type } from 'class-transformer';

export class ConfigSchema {
  @IsIn(['production', 'development', 'test'])
  @IsString()
  public readonly NODE_ENV: string;

  @IsString()
  public readonly name!: string;

  @IsNumber()
  public readonly port!: number;

  @ValidateIf(() => process.env.NODE_ENV === 'production')
  @Type(() => LogstashSchema)
  @IsNotEmpty()
  @ValidateNested()
  public readonly logstash!: LogstashSchema;

  @Type(() => TCompanySchema)
  @IsNotEmpty()
  @ValidateNested()
  public readonly tcompany: TCompanySchema;

  @Type(() => RedisSchema)
  @IsNotEmpty()
  @ValidateNested()
  public readonly redis: RedisSchema;
}
