import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginUsernameDto } from './dto/login-username.dto';
import { TokenService } from '@/auth/token.service';
import { IsPublic } from '@/common/decorators/is-public.decorator';

@Controller('login')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @IsPublic()
  @Post('username')
  async loginUsername(@Body() data: LoginUsernameDto) {
    const auth = await this.authService.validateUsernameAndPassword(
      data.username,
      data.password,
    );

    const userInfo = await this.authService.getUserData(auth.userId);

    const token = this.tokenService.generateToken(userInfo);

    return {
      token: token,
      user: userInfo,
    };
  }
}
