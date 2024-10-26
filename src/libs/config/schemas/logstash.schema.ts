import { IsIP, IsNumber } from "class-validator";

export class LogstashSchema {
  @IsIP(4)
  public readonly host!: string;

  @IsNumber()
  public readonly port!: number;
}