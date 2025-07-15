import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import { User as PrismaUser } from '@prisma/client'
import { randomBytes } from 'crypto'
import { MailerService } from './mailer.service'
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private mailer: MailerService,
  ) {}

  async createUser(data: CreateUserDto): Promise<PrismaUser> {
    const token = randomBytes(32).toString('hex')
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const mappedData = {
      email: data.email,
      password: hashedPassword,
      role: (data.role ?? 'USER') as 'ADMIN' | 'USER',
      emailConfirmationToken: token,
    }
    const user = await this.prisma.user.create({ data: mappedData })
    const confirmUrl = `http://localhost:3000/user/confirm?token=${token}`
    await this.mailer.sendMail(
      user.email,
      'Confirm your email',
      `<p>Click <a href="${confirmUrl}">here</a> to confirm your email.</p>`
    )
    return user
  }

  async send2faCode(email: string, code: string) {
    await this.mailer.sendMail(
      email,
      'Your 2FA code',
      `<p>Your 2FA code is: <b>${code}</b></p>`
    )
  }

  async getAllUsers(): Promise<any[]> {
    return this.prisma.user.findMany({
      select: { id: true, email: true, role: true, emailConfirmed: true },
      orderBy: { id: 'asc' },
    })
  }
}
