import { IsString } from 'class-validator';

export class TCompanySchema {
  @IsString()
  public readonly host!: string;
}
