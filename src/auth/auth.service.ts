import { Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findOneByEmail(email);
      const isMatch = await bcrypt.compare(password, user.password);
      if (user && isMatch) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      console.log(error);
      if (error) {
        throw new NotFoundException();
      }
    }
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      name: `${user.firstName} ${user.lastName}`,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
