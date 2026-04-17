import { IsNotEmpty, IsString } from 'class-validator';

export class ExecuteCommandDto {
  @IsString()
  @IsNotEmpty()
  server: string;

  @IsString()
  @IsNotEmpty()
  command: string;
}
