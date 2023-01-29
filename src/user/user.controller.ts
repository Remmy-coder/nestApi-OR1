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
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SETTINGS } from 'src/app.utils';
import { SerializedUser, User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { ApiBadRequestResponse, ApiTags } from '@nestjs/swagger/dist';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private configService: ConfigService,
  ) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/create')
  @ApiCreatedResponse({
    description: 'Created user object as response',
    type: SerializedUser,
  })
  @ApiBadRequestResponse({
    description: 'User cannot be created, Try again!',
  })
  async create(
    @Body(SETTINGS.VALIDATION_PIPE)
    createUserDto: CreateUserDto,
  ): Promise<User> {
    try {
      // const newUser = await this.userService.create(createUserDto);
      const user = await this.userService.userRegistration(createUserDto);
      if (user) return new SerializedUser(user);
    } catch (error) {
      if (error.errno === 1062) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    limit = limit > 100 ? 100 : limit;
    // const users = this.userService.findAll();
    // const usersWithoutPasswords = (await users).map((user) => {
    //   return Object.assign({}, user, { password: String });
    // });
    // return usersWithoutPasswords;
    return this.userService.paginate({
      page,
      limit,
      route: '/cats',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async findAll() {
    const users = this.userService.findAll();
    const usersWithoutPasswords = (await users).map((user) => {
      return Object.assign({}, user, { password: String });
    });
    return usersWithoutPasswords;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('getUserBy/:id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(+id);
    if (user) return new SerializedUser(user);
    else throw new HttpException('User not found!', HttpStatus.BAD_REQUEST);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('/getUserBy/:email')
  async findOneEmail(@Param('email') email: string) {
    const user = await this.userService.findOneByEmail(email);
    if (user) return new SerializedUser(user);
    else throw new HttpException('User not found!', HttpStatus.BAD_REQUEST);
  }

  @ApiCreatedResponse({
    description: 'Updated user object as response',
    type: SerializedUser,
  })
  @ApiBadRequestResponse({
    description: 'User cannot be updated, Try again!',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch('/update/:id')
  async update(
    @Param('id') id: string,
    @Body(SETTINGS.VALIDATION_PIPE)
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    try {
      const user = await this.userService.updateUser(+id, updateUserDto);
      if (user) return new SerializedUser(user);
    } catch (error) {
      if (error.errno === 1062) {
        throw new ConflictException('Email already exists');
      }
    }
  }

  @Delete('/delete/:id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
