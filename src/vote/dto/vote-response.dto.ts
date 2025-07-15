import { ApiProperty } from '@nestjs/swagger'

export class VoteResponseDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  userId: number

  @ApiProperty()
  pollId: number

  @ApiProperty()
  option: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty({ example: { id: 3, question: 'Favorite color?' }, required: false })
  poll?: { id: number; question: string }

  @ApiProperty({ example: { id: 2, email: 'user@example.com', role: 'USER' }, required: false })
  user?: { id: number; email: string; role: string }
} 