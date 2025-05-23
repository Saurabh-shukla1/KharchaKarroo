import { IsEnum, IsOptional } from 'class-validator';
import { UpdateUserDto } from '../../users/dto/update-user.dto';
import { UserRole } from '../../users/enums/user-role.enum';

export class AdminUpdateUserDto extends UpdateUserDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
} 