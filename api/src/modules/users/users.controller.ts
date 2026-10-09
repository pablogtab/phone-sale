import { HasPermission } from '@/common/decorators/has-permission.decorator';
import { User } from '@/common/decorators/user.decorator';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { UserToken } from '../../auth/dto/token-info.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { PublicUserDto } from './dto/public-user.dto';
import { UsersService } from './users.service';
import { FileService } from '@/common/files/file.service';
import { Response } from 'express';
import { SearchUserQueryDto } from './dto/search-user-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly fileService: FileService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('me')
  me(@User() user: UserToken): Promise<PublicUserDto> {
    return this.usersService.getPublicUser(user.userId);
  }

  @Post('profile-picture')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @User() user: UserToken,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const optimizedFile = await this.fileService.uploadFile(file, {
      allowedTypes: 'image',
      optimizeImage: true,
    });

    await this.usersService.updateProfilePicture(
      user.userId,
      optimizedFile.url,
    );

    return res.json(optimizedFile.url);
  }

  @Get('search')
  search(@Query() data: SearchUserQueryDto) {
    return this.usersService.search(data);
  }

  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserById(id);
  }

  @Patch(':id')
  update(@Body() updateUser: UpdateUserDto) {
    return this.usersService.update(updateUser);
  }
}
