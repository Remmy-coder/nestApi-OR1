import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from 'src/common/abstract/abstract.service';
import { Repository } from 'typeorm';
import { SerializedUser, User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { Pagination } from 'nestjs-typeorm-paginate/dist/pagination';

@Injectable()
export class UserService extends AbstractService<User> {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  private comparePasswords(password: string, confirmPassword: string): boolean {
    return password === confirmPassword;
  }

  async userRegistration(createUserDto: CreateUserDto): Promise<User> {
    if (
      !this.comparePasswords(
        createUserDto.confirmPassword,
        createUserDto.password,
      )
    ) {
      throw new BadRequestException(
        'Password and confirm password do not match',
      );
    }

    return await this.userRepository.create(createUserDto);
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    return await this.userRepository.save({ id, ...updateUserDto });
  }

  async paginate(
    options: IPaginationOptions,
  ): Promise<Pagination<SerializedUser>> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    queryBuilder.orderBy('user.lastName', 'DESC');
    return paginate<SerializedUser>(this.userRepository, options);
  }
}
