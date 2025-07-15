import { Controller, Post, Body, Req, UseGuards, Get, Param } from '@nestjs/common'
import { PollService } from './poll.service'
import { CreatePollDto } from './dto/create-poll.dto'
import { JwtAuthGuard } from '../user/jwt-auth.guard'
import { Roles } from '../user/roles.decorator'
import { RolesGuard } from '../user/roles.guard'
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse } from '@nestjs/swagger'

@ApiTags('poll')
@ApiBearerAuth()
@Controller('poll')
export class PollController {
  constructor(private readonly pollService: PollService) {}

  @Post()
  @ApiOperation({ summary: 'Create a poll (admin only)' })
  @ApiResponse({ status: 201, description: 'Poll created' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(@Body() dto: CreatePollDto, @Req() req: any) {
    return this.pollService.createPoll(dto, req.user)
  }

  @Get()
  @ApiOperation({ summary: 'List all polls' })
  @ApiOkResponse({ description: 'List of polls', schema: { example: [{ id: 1, question: 'Favorite color?', options: ['Red', 'Blue'], createdAt: '2024-07-15T12:00:00.000Z' }] } })
  async findAll() {
    return this.pollService.findAll()
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Get poll results' })
  @ApiOkResponse({ description: 'Poll results', schema: { example: { pollId: 1, question: 'Favorite color?', results: [{ option: 'Red', votes: 2 }, { option: 'Blue', votes: 3 }], totalVotes: 5 } } })
  @ApiNotFoundResponse({ description: 'Poll not found' })
  async results(@Param('id') id: string) {
    return this.pollService.getResults(Number(id))
  }
}
