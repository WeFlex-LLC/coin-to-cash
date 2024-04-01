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
import { CreateIntervalDto } from './dto/create-interval.dto';
import { UpdateIntervalDto } from './dto/update-interval.dto';

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

  @Get('pairs')
  @UseGuards(JwtAdminAuthGuard)
  findPairs(
    @Query('fromId') fromId: string,
    @Query('toId') toId: string,
    @Query('join') join: string
  ){
    let filter: { fromId?: number, toId?: number } = { fromId: +fromId, toId: +toId };

    return this.coinService.findPairs(filter, { to: join?.includes('to'), from: join?.includes('from') });
  }

  @Get('pairs/:id/intervals')
  findIntervals(@Param('id') id: string){
    return this.coinService.findIntervals(+id);
  }

  @Get(':id')
  findCoinById(@Param('id') id: string){
    return this.coinService.findCoinById(+id);
  }

  @Get('types/:id')
  findCoinToTypeById(@Param('id') id: string){
    return this.coinService.findCoinToTypeById(+id);
  }

  @Get('types/:id/pairs')
  @UseGuards(JwtAdminAuthGuard)
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

  @Post('pairs/:id/intervals')
  createInterval(
    @Param('id') id: string,
    @Body() createIntervalDto: CreateIntervalDto
  ){
    return this.coinService.createInterval(+id, createIntervalDto);
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

  @Put('pairs/:id')
  @UseGuards(JwtAdminAuthGuard)
  updatePair(
    @Param('id') id: string,
    @Body() updatePairDto: UpdatePairDto,
  ){
    return this.coinService.updatePair(+id, updatePairDto);
  }

  @Put('pairs/:pairId/intervals/:id')
  updateInterval(
    @Param('id') id: string,
    @Body() updateIntervalDto: UpdateIntervalDto
  ){
    return this.coinService.updateInterval(+id, updateIntervalDto);
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

  @Delete('pairs/:pairId')
  @UseGuards(JwtAdminAuthGuard)
  deletePair(
    @Param('pairId') pairId: string,
  ){
    return this.coinService.deletePair(+pairId);
  }

  @Delete('pairs/:pairId/intervals/:id')
  deleteInterval(@Param('id') id: string){
    return this.coinService.deleteInterval(+id);
  }

  @Delete('places/:id')
  @UseGuards(JwtAdminAuthGuard)
  deletePlace(
    @Param('id') id: string,
  ){
    return this.coinService.deletePlace(+id);
  }
}
