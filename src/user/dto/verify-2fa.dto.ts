import { IsEmail, IsString, Length } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class Verify2faDto {
  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsString()
  @Length(6, 6)
  code: string
} 