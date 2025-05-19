import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './user.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      return null;
    }
    const { password, ...safeUser } = user;
    return safeUser;
  }
}