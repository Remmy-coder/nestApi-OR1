import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from 'src/common/abstract/abstract.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

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

    const user = new User();
    user.email = createUserDto.email;
    user.firstName = createUserDto.firstName;
    user.lastName = createUserDto.lastName;
    user.password = createUserDto.password;

    return await user.save();
  }
}
