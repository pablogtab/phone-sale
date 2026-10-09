import { User } from '@/common/decorators/user.decorator';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';

import { UserToken } from '../../auth/dto/token-info.dto';
import { ContinueOrderDto } from './dto/continue-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { FindOrdersDto } from './dto/find-orders.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('continue/:uuid')
  continue(
    @Body() data: ContinueOrderDto,
    @User() user: UserToken,
    @Param('uuid', ParseUUIDPipe) publicId: string,
  ) {
    return this.ordersService.continue(publicId, data, user);
  }

  @Post('cancel/:uuid')
  deleteOrder(
    @Param('uuid', ParseUUIDPipe) publicId: string,
    @User() user: UserToken,
  ) {
    return this.ordersService.cancelOrder(publicId, user);
  }

  @Post('')
  create(@Body() data: CreateOrderDto, @User() user: UserToken) {
    return this.ordersService.create(data, user);
  }

  @Get('/:uuid')
  getDetailedOrderByPublic(@Param('uuid', ParseUUIDPipe) publicId: string) {
    return this.ordersService.getDetailedOrderByPublic(publicId);
  }

  @Get('')
  findOrders(@Query() query: FindOrdersDto) {
    return this.ordersService.findOrders(query);
  }
}
