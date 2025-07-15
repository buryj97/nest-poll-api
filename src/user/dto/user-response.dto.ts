export class UserResponseDto {
  id: number
  email: string
  role: string
  emailConfirmed: boolean

  constructor(user: any) {
    this.id = user.id
    this.email = user.email
    this.role = user.role
    this.emailConfirmed = user.emailConfirmed
  }
} 