import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export interface JwtPayload {
  username: string;
  useremail: string;
  iat?: number;
  expiresIn?: number;
  issuer?: string;
  sub?: string;
  audience?: string;
}

export class ValidateTokenDTO {
  @IsBoolean()
  @IsNotEmpty()
  valid: boolean;

  decoded?: JwtPayload;

  @IsString()
  message?: string;
}
