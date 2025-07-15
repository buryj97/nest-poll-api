import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreatePollDto } from './dto/create-poll.dto'

@Injectable()
export class PollService {
  constructor(private prisma: PrismaService) {}

  async createPoll(dto: CreatePollDto, user: any) {
    if (user.role !== 'ADMIN') throw new ForbiddenException('Admins only')
    return this.prisma.poll.create({
      data: {
        question: dto.question,
        options: dto.options,
        createdById: user.sub,
      },
    })
  }

  async findAll() {
    return this.prisma.poll.findMany({
      select: {
        id: true,
        question: true,
        options: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getResults(pollId: number) {
    const poll = await this.prisma.poll.findUnique({ where: { id: pollId } })
    if (!poll) throw new Error('Poll not found')
    const votes = await this.prisma.vote.findMany({ where: { pollId } })
    const results = poll.options.map(option => ({
      option,
      votes: votes.filter(v => v.option === option).length,
    }))
    return {
      pollId: poll.id,
      question: poll.question,
      results,
      totalVotes: votes.length,
    }
  }
}
