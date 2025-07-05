import { Injectable, ConflictException, InternalServerErrorException, HttpStatus } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/auth.dto';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const user = await this.usersService.create({
        username: registerDto.username,
        email: registerDto.email,
        passwordHash: hashedPassword,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user;
      return result as User;
    } catch (error) {
      if (error.code === '23505') {            // PostgreSQL unique violation error code
        if (error.detail.includes('username')) {
          throw new ConflictException('Username already exists');
        }
        if (error.detail.includes('email')) {
          throw new ConflictException('Email already exists');
        }
      }
      throw new InternalServerErrorException( 'Registration Failed due to unexpected error')
    }
  }

  async validateUser(username: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user;
      return result as User;
    }
    return null;
  }

  login(user: User): { access_token: string } {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
