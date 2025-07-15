import { Controller, Post, Body, Req, UseGuards, Get, Query } from '@nestjs/common'
import { VoteService } from './vote.service'
import { CreateVoteDto } from './dto/create-vote.dto'
import { JwtAuthGuard } from '../user/jwt-auth.guard'
import { Roles } from '../user/roles.decorator'
import { RolesGuard } from '../user/roles.guard'
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiBody, ApiOkResponse, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiQuery } from '@nestjs/swagger'
import { VoteResponseDto } from './dto/vote-response.dto'

@ApiTags('vote')
@ApiBearerAuth()
@Controller('vote')
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @Post()
  @ApiOperation({ summary: 'Vote on a poll (user only, one vote per poll)' })
  @ApiBody({ type: CreateVoteDto })
  @ApiResponse({ status: 201, description: 'Vote cast', type: VoteResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Already voted or invalid option' })
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateVoteDto, @Req() req: any): Promise<VoteResponseDto> {
    return this.voteService.createVote(dto, req.user)
  }

  @Get()
  @ApiOperation({ summary: 'Get all votes (admin only)' })
  @ApiOkResponse({ description: 'List of all votes', type: [VoteResponseDto] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max number of results' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of results to skip' })
  @ApiQuery({ name: 'pollId', required: false, type: Number, description: 'Filter by poll ID' })
  @ApiQuery({ name: 'userId', required: false, type: Number, description: 'Filter by user ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('pollId') pollId?: number,
    @Query('userId') userId?: number,
  ): Promise<VoteResponseDto[]> {
    return this.voteService.findAll({ limit, offset, pollId, userId })
  }

  @Get('mine')
  @ApiOperation({ summary: 'Get votes by the authenticated user' })
  @ApiOkResponse({ description: 'List of user votes', type: [VoteResponseDto] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max number of results' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of results to skip' })
  @ApiQuery({ name: 'pollId', required: false, type: Number, description: 'Filter by poll ID' })
  @UseGuards(JwtAuthGuard)
  async findMine(
    @Req() req: any,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('pollId') pollId?: number,
  ): Promise<VoteResponseDto[]> {
    return this.voteService.findMine(req.user, { limit, offset, pollId })
  }
}
