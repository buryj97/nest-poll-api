import { IsString, IsArray, ArrayMinSize } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreatePollDto {
  @ApiProperty()
  @IsString()
  question: string

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(2)
  options: string[]
} 