import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpException,
  UseInterceptors,
  ClassSerializerInterceptor,
  ConflictException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SETTINGS } from 'src/app.utils';
import { SerializedUser, User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private configService: ConfigService,
  ) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async create(
    @Body(SETTINGS.VALIDATION_PIPE)
    createUserDto: CreateUserDto,
  ): Promise<User> {
    try {
      const user = await this.userService.userRegistration(createUserDto);
      if (user) return new SerializedUser(user);
    } catch (error) {
      if (error.errno === 1062) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  @Get()
  async findAll() {
    const users = this.userService.findAll();
    const usersWithoutPasswords = (await users).map((user) => {
      return Object.assign({}, user, { password: String });
    });
    return usersWithoutPasswords;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(+id);
    if (user) return new SerializedUser(user);
    else throw new HttpException('User not found!', HttpStatus.BAD_REQUEST);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
