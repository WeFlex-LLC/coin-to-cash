import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CoinService } from './coin.service';
import { JwtAdminAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateCoinDto } from './dto/create-coin.dto';
import { UpdateCoinDto } from './dto/update-coin.dto';
import { CreateCoinToTypeDto } from './dto/create-coin-to-type.dto';
import { UpdateCoinToTypeDto } from './dto/update-coin-to-type.dto';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { CreatePairDto } from './dto/create-pair.dto';
import { UpdatePairDto } from './dto/update-pair.dto';

@Controller('api/coins')
export class CoinController {
  constructor(private readonly coinService: CoinService) {}

  @Get()
  findCoins(
    @Query('name') name: string
  ){
    return this.coinService.findCoins({ name });
  }

  @Get('types')
  findCoinToTypes(
    @Query('exclude') exclude: string
  ){
    let filter: { exclude?: string[] } = { };

    if(exclude)
      filter.exclude = exclude.split(',');

    return this.coinService.findCoinToTypes(filter);
  }

  @Get('places')
  findPlaces(){
    return this.coinService.findPlaces();
  }

  @Get(':id')
  findCoinById(@Param('id', ) id: string){
    return this.coinService.findCoinById(+id);
  }

  @Get('types/:id')
  findCoinToTypeById(@Param('id', ) id: string){
    return this.coinService.findCoinToTypeById(+id);
  }

  @Get('types/:id/pairs')
  findPairsByCoinToTypeId(
    @Param('id') id: string,
    @Query('join') join: string
  ){
    let filter: { fromId?: number } = { fromId: +id };

    return this.coinService.findPairs(filter, { to: join?.includes('to') });
  }

  @Get('places/:id')
  findPlaceById(@Param('id') id: string){
    return this.coinService.findPlaceById(+id);
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

  @Post('types/:id/pairs')
  @UseGuards(JwtAdminAuthGuard)
  createPair(
    @Param('id') id: string,
    @Body() createPairDto: CreatePairDto,
  ){
    createPairDto.fromId = +id;

    return this.coinService.createPair(createPairDto);
  }

  @Post('places')
  @UseGuards(JwtAdminAuthGuard)
  createPlace(
    @Body() createPlaceDto: CreatePlaceDto,
  ){
    return this.coinService.createPlace(createPlaceDto);
  }

  @Put(':id')
  @UseGuards(JwtAdminAuthGuard)
  updateCoin(
    @Param('id') id: string,
    @Body() updateCoinDto: UpdateCoinDto,
  ){
    return this.coinService.updateCoin(+id, updateCoinDto);
  }

  @Put('types/:id')
  @UseGuards(JwtAdminAuthGuard)
  updateCoinToType(
    @Param('id') id: string,
    @Body() updateCoinToTypeDto: UpdateCoinToTypeDto,
  ){
    return this.coinService.updateCoinToType(+id, updateCoinToTypeDto);
  }

  @Put('types/:id/pairs/:pairId')
  @UseGuards(JwtAdminAuthGuard)
  updatePair(
    @Param('pairId') pairId: string,
    @Body() updatePairDto: UpdatePairDto,
  ){
    return this.coinService.updatePair(+pairId, updatePairDto);
  }

  @Put('places/:id')
  @UseGuards(JwtAdminAuthGuard)
  updatePlace(
    @Param('id') id: string,
    @Body() updatePlaceDto: UpdatePlaceDto,
  ){
    return this.coinService.updatePlace(+id, updatePlaceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAdminAuthGuard)
  deleteCoin(
    @Param('id') id: string,
  ){
    return this.coinService.deleteCoin(+id);
  }

  @Delete('types/:id')
  @UseGuards(JwtAdminAuthGuard)
  deleteCoinToType(
    @Param('id') id: string,
  ){
    return this.coinService.deleteCoinToType(+id);
  }

  @Delete('types/:id/pairs/:pairId')
  @UseGuards(JwtAdminAuthGuard)
  deletePair(
    @Param('pairId') pairId: string,
  ){
    return this.coinService.deletePair(+pairId);
  }

  @Delete('places/:id')
  @UseGuards(JwtAdminAuthGuard)
  deletePlace(
    @Param('id') id: string,
  ){
    return this.coinService.deletePlace(+id);
  }
}
