import {
    Update,
    Ctx,
    Start,
    Help,
    On,
    Hears,
  } from 'nestjs-telegraf';
import { Injectable } from '@nestjs/common';

@Injectable()
@Update()
export class TelegramBotService {

  @Start()
  async start(@Ctx() ctx) {
    console.log(ctx.update.message.from)
    await ctx.reply('Welcome');
  }

  @Help()
  async help(@Ctx() ctx) {
    await ctx.reply('Send me a sticker');
  }

  @On('sticker')
  async on(@Ctx() ctx) {
    await ctx.reply('👍');
  }

  @Hears('hi')
  async hears(@Ctx() ctx) {
    await ctx.reply('Hey there');
  }
}
