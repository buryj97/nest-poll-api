import { IsInt, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateVoteDto {
  @ApiProperty()
  @IsInt()
  pollId: number

  @ApiProperty()
  @IsString()
  option: string
} 