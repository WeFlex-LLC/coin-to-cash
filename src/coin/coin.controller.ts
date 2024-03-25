import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CoinService } from './coin.service';
import { JwtAdminAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateCoinDto } from './dto/create-coin.dto';
import { UpdateCoinDto } from './dto/update-coin.dto';
import { CreateCoinToTypeDto } from './dto/create-coin-to-type.dto';
import { UpdateCoinToTypeDto } from './dto/update-coin-to-type.dto';

@Controller('api/coins')
export class CoinController {
  constructor(private readonly coinService: CoinService) {}

  @Get()
  findCoins(){
    return this.coinService.findCoins();
  }

  @Get('types')
  findCoinToTypes(){
    return this.coinService.findCoinToTypes();
  }

  @Get(':id')
  findCoinById(@Param('id', ) id: string){
    return this.coinService.findCoinById(+id);
  }

  @Get('types/:id')
  findCoinToTypeById(@Param('id', ) id: string){
    return this.coinService.findCoinToTypeById(+id);
  }

  @Post()
  @UseGuards(JwtAdminAuthGuard)
  createCoin(
    @Body() createCoinDto: CreateCoinDto,
  ){
    return this.coinService.createCoin(createCoinDto);
  }

  @Post('types')
  @UseGuards(JwtAdminAuthGuard)
  createCoinToType(
    @Body() createCoinToTypeDto: CreateCoinToTypeDto,
  ){
    return this.coinService.createCoinToType(createCoinToTypeDto);
  }

  @Put(':id')
  @UseGuards(JwtAdminAuthGuard)
  updateCoinToType(
    @Param('id') id: string,
    @Body() updateCoinToTypeDto: UpdateCoinToTypeDto,
  ){
    return this.coinService.updateCoinToType(+id, updateCoinToTypeDto);
  }

  @Put(':id')
  @UseGuards(JwtAdminAuthGuard)
  updateCoin(
    @Param('id') id: string,
    @Body() updateCoinDto: UpdateCoinDto,
  ){
    return this.coinService.updateCoin(+id, updateCoinDto);
  }

  @Delete(':id')
  @UseGuards(JwtAdminAuthGuard)
  deleteCoinToType(
    @Param('id') id: string,
  ){
    return this.coinService.deleteCoin(+id);
  }

  @Delete(':id')
  @UseGuards(JwtAdminAuthGuard)
  deleteCoin(
    @Param('id') id: string,
  ){
    return this.coinService.deleteCoinToType(+id);
  }
}
