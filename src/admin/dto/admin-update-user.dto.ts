import { IsEnum, IsOptional } from 'class-validator';
import { UpdateUserDto } from '../../users/dto/update-user.dto';
import { UserRole } from '../../users/entities/user.entity';

export class AdminUpdateUserDto extends UpdateUserDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
} 