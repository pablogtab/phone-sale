import { Body, Controller, Post } from '@nestjs/common';

import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { PurchasesService } from './purchases.service';
import { User } from '@/common/decorators/user.decorator';
import { UserToken } from '../../auth/dto/token-info.dto';

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post('')
  async newPurchase(@Body() data: CreatePurchaseDto, @User() user: UserToken) {
    return this.purchasesService.newPurchase(data, user.id);
  }
}
