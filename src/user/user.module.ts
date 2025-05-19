// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // ✅ REGISTER HERE
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService], // ✅ export if used in AuthModule
})
export class UserModule {}

