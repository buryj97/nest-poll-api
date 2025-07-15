import { Controller, Post, Body, UsePipes, ValidationPipe, Get, Query, NotFoundException, BadRequestException, UseGuards } from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UserResponseDto } from './dto/user-response.dto'
import { PrismaService } from '../prisma.service'
import { LoginDto } from './dto/login.dto'
import { Verify2faDto } from './dto/verify-2fa.dto'
import * as bcrypt from 'bcryptjs'
import { JwtService } from '@nestjs/jwt'
import { Roles } from './roles.decorator'
import { RolesGuard } from './roles.guard'
import { ApiBearerAuth, ApiTags, ApiOperation, ApiOkResponse, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger'
import { JwtAuthGuard } from './jwt-auth.guard'

@ApiTags('user')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async register(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.createUser(createUserDto)
    return new UserResponseDto(user)
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() loginDto: LoginDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email: loginDto.email } })
    if (!user) throw new NotFoundException('User not found')
    if (!user.emailConfirmed) throw new BadRequestException('Email not confirmed')
    const valid = await bcrypt.compare(loginDto.password, user.password)
    if (!valid) throw new BadRequestException('Invalid credentials')
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 10 * 60 * 1000)
    await this.prisma.user.update({
      where: { id: user.id },
      data: { twoFactorCode: code, twoFactorCodeExpires: expires },
    })
    await this.userService.send2faCode(user.email, code)
    return { message: '2FA code sent to your email' }
  }

  @Post('verify-2fa')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async verify2fa(@Body() dto: Verify2faDto): Promise<{ access_token: string }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (!user) throw new NotFoundException('User not found')
    if (!user.twoFactorCode || !user.twoFactorCodeExpires) throw new BadRequestException('No 2FA code set')
    if (user.twoFactorCode !== dto.code) throw new BadRequestException('Invalid 2FA code')
    if (user.twoFactorCodeExpires < new Date()) throw new BadRequestException('2FA code expired')
    await this.prisma.user.update({
      where: { id: user.id },
      data: { twoFactorCode: null, twoFactorCodeExpires: null },
    })
    const payload = { sub: user.id, email: user.email, role: user.role }
    const access_token = await this.jwtService.signAsync(payload)
    return { access_token }
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiOkResponse({ description: 'List of all users', type: [UserResponseDto] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userService.getAllUsers()
    return users.map(u => new UserResponseDto(u))
  }

  @Get('confirm')
  async confirmEmail(@Query('token') token: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({ where: { emailConfirmationToken: token } })
    if (!user) throw new NotFoundException('Invalid or expired token')
    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailConfirmed: true, emailConfirmationToken: null },
    })
    return { message: 'Email confirmed successfully' }
  }
}
