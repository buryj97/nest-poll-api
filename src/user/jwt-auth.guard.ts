import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>()
    const auth = req.headers['authorization']
    if (!auth || !auth.startsWith('Bearer ')) throw new UnauthorizedException('No token')
    const token = auth.split(' ')[1]
    try {
      const payload = await this.jwtService.verifyAsync(token)
      req.user = payload
      return true
    } catch {
      throw new UnauthorizedException('Invalid token')
    }
  }
} 