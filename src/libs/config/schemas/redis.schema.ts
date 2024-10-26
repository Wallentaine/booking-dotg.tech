import { IsString } from "class-validator";

export class RedisSchema {
  @IsString()
  public readonly username!: string;

  @IsString()
  public readonly password!: string;

  @IsString()
  public readonly host!: string;

  @IsString()
  public readonly port!: number;

  @IsString()
  public get connectionString(): string {
    return `redis://${this.username}:${this.password}@${this.host}:${this.port}`;
  }
}