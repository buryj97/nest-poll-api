import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreateVoteDto } from './dto/create-vote.dto'
import { VoteResponseDto } from './dto/vote-response.dto'
import { plainToInstance } from 'class-transformer'

@Injectable()
export class VoteService {
  constructor(private prisma: PrismaService) {}

  async createVote(dto: CreateVoteDto, user: any): Promise<VoteResponseDto> {
    const poll = await this.prisma.poll.findUnique({ where: { id: dto.pollId } })
    if (!poll) throw new BadRequestException('Poll not found')
    if (!poll.options.includes(dto.option)) throw new BadRequestException('Invalid option')
    const existing = await this.prisma.vote.findUnique({ where: { userId_pollId: { userId: user.sub, pollId: dto.pollId } } })
    if (existing) throw new ForbiddenException('Already voted')
    const vote = await this.prisma.vote.create({
      data: {
        userId: user.sub,
        pollId: dto.pollId,
        option: dto.option,
      },
    })
    return plainToInstance(VoteResponseDto, vote)
  }

  async findAll(options?: { limit?: number; offset?: number; pollId?: number; userId?: number }): Promise<VoteResponseDto[]> {
    const { limit, offset, pollId, userId } = options || {}
    const where: any = {}
    if (pollId) where.pollId = Number(pollId)
    if (userId) where.userId = Number(userId)
    const votes = await this.prisma.vote.findMany({
      where,
      include: {
        poll: { select: { id: true, question: true } },
        user: { select: { id: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? Number(limit) : undefined,
      skip: offset ? Number(offset) : undefined,
    })
    return votes.map(vote => plainToInstance(VoteResponseDto, vote))
  }

  async findMine(user: any, options?: { limit?: number; offset?: number; pollId?: number }): Promise<VoteResponseDto[]> {
    const { limit, offset, pollId } = options || {}
    const where: any = { userId: user.sub }
    if (pollId) where.pollId = Number(pollId)
    const votes = await this.prisma.vote.findMany({
      where,
      include: {
        poll: { select: { id: true, question: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? Number(limit) : undefined,
      skip: offset ? Number(offset) : undefined,
    })
    return votes.map(vote => plainToInstance(VoteResponseDto, vote))
  }
}
