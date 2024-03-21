import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Update, Ctx, Start, Help, On, Hears, Action } from 'nestjs-telegraf';
import { chunk } from 'lodash';
import { CoinService } from 'src/coin/coin.service';
import { UsersService } from 'src/users/users.service';
import { Lang } from 'src/users/enums/lang.enum';
import { User } from 'src/users/entities/user.entity';
import { CoinType } from 'src/coin/enums/coin-type.enum';
import { ExchangeOption } from 'src/users/enums/exchange-option.enum';
import { Order } from 'src/users/entities/order.entity';
import { CreateOrderDto } from 'src/users/dto/create-order.dto';
import { LanguagesService } from 'src/languages/languages.service';

@Injectable()
@Update()
export class TelegramBotService {
  private pendingOrders: {
    [id: number]: {
      pairId: number;
      option: ExchangeOption;
      amount?: number;
      placeId?: number;
    };
  } = {};

  constructor(
    private readonly coinService: CoinService,
    private readonly usersService: UsersService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly languagesService: LanguagesService,
  ) {}

  @Start()
  async start(@Ctx() ctx) {
    const { id, language_code } = ctx.update.message.from;

    let user = await this.usersService.getUserByTelegramId(id);

    if (!user)
      user = await this.usersService.addUser({
        telegramId: id,
        lang: language_code,
      });

    this.showWhatYouWant(ctx, user);
  }

  @Help()
  async help(@Ctx() ctx) {
    const options = {
      reply_markup: {
        keyboard: [['/start'], ['/chooseLang']],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    };

    await ctx.reply('Choose command', options);
  }

  @On('sticker')
  async on(@Ctx() ctx) {
    await ctx.reply('👍');
  }

  @Hears('New exchange')
  async chooseCoin(@Ctx() ctx) {
    const { id } = ctx.update.message.from;

    const user = await this.usersService.getUserByTelegramId(id);

    this.showWhatYouWant(ctx, user);
  }

  @Hears('Make order')
  async makeOrder(@Ctx() ctx) {
    const { id } = ctx.update.message.from;
    let order: Order;

    if (this.pendingOrders[id]) {
      const { pairId, option, placeId, amount } = this.pendingOrders[id];
      const user = await this.usersService.getUserByTelegramId(id);

      const payload: CreateOrderDto = {
        amount,
        user: {
          id: user.id,
        },
        pair: {
          id: pairId,
        },
        option,
      };

      if (placeId)
        payload.place = {
          id: placeId,
        };

      order = await this.usersService.createOrder(payload);

      delete this.pendingOrders[id];
      this.schedulerRegistry.deleteTimeout(id.toString());
    }

    const options = {
      reply_markup: {
        keyboard: [['New exchange']],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    };

    await ctx.reply(
      order
        ? `Your order number: ${order.orderNumber}. We will contact you.`
        : 'New exchange',
      options,
    );
  }

  @Hears(/^\d+$/)
  async writeAmount(@Ctx() ctx) {
    const { id } = ctx.update.message.from;
    const amount = ctx.match[0];

    let text = '';
    const options = {
      reply_markup: {
        keyboard: [],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    };

    if (this.pendingOrders[id]) {
      this.pendingOrders[id].amount = amount;
      const { pairId, option } = this.pendingOrders[id];
      const interval = await this.coinService.getInterval(pairId, amount);
      const pair = await this.coinService.getPairInfo(pairId);
      const user = await this.usersService.getUserByTelegramId(id);

      let price;

      if (option == ExchangeOption.Take){
        price = ((amount - interval.fixedPrice) * 100) / ((100 + interval.percent) * pair.rate);
        price = Math.ceil(price);
        
        text = `You should pay ${price} ${pair.from['name_' + user.lang]}`;
      }else{
        price = amount * pair.rate * (1 - interval.percent / 100) - interval.fixedPrice;
        price = Math.ceil(price);

        text = `You will get ${price} ${pair.to['name_' + user.lang]}`;
      }

      options.reply_markup.keyboard.push(['Make order']);
    } else {
      options.reply_markup.keyboard.push(['New exchange']);
      text = 'New exchange';
    }

    await ctx.reply(text, options);
  }

  @Hears('/changelang')
  async changeLang(@Ctx() ctx) {
    const keyboard = [
      Object.values(Lang).map((e) => ({
        text: e,
        callback_data: 'selectLang(' + e + ')',
      })),
    ];

    const options = {
      reply_markup: {
        inline_keyboard: keyboard,
        resize_keyboard: true,
      },
    };

    await ctx.reply('Select language', options);
  }

  @Action(/selectLang\((.*?)\)/)
  async selectLang(@Ctx() ctx) {
    const lang = ctx.match[1];

    await this.usersService.changeLang(ctx.update.callback_query.from.id, lang);

    const options = {
      reply_markup: {
        keyboard: [['New exchange']],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    };

    await ctx.reply('Language changed', options);
  }

  @Action(/buyCoin\((\d+)\)/)
  async buyCoin(@Ctx() ctx) {
    const toId = ctx.match[1];
    const coinToPairsFrom = await this.coinService.getCoinPairs(toId);
    const user = await this.usersService.getUserByTelegramId(
      ctx.update.callback_query.from.id,
    );

    if (!coinToPairsFrom.length) {
      await ctx.reply('Empty');
      return;
    }

    const keyboard = chunk(
      coinToPairsFrom.map((e) => ({
        text: e['name_' + user.lang],
        callback_data: 'selectOption(' + e.pairId + ')',
      })),
      2,
    );

    const options = {
      reply_markup: {
        inline_keyboard: keyboard,
        resize_keyboard: true,
      },
    };

    await ctx.reply('What you give?', options);
  }

  @Action(/selectOption\((\d+)\)/)
  async selectOption(@Ctx() ctx) {
    const pairId = ctx.match[1];
    const pair = await this.coinService.getPairInfo(pairId);
    const user = await this.usersService.getUserByTelegramId(
      ctx.update.callback_query.from.id,
    );

    const keyboard = [
      [
        {
          text: `Give ${pair.from['name_' + user.lang]}`,
          callback_data: `registerPair(${pairId},0)`,
        },
      ],
      [
        {
          text: `Take ${pair.to['name_' + user.lang]}`,
          callback_data: `registerPair(${pairId},1)`,
        },
      ],
    ];

    const options = {
      reply_markup: {
        inline_keyboard: keyboard,
        resize_keyboard: true,
      },
    };

    await ctx.reply('Select option', options);
  }

  @Action(/registerPair\((\d+),(\d+)\)/)
  async registerPair(@Ctx() ctx) {
    const pairId = ctx.match[1];
    const option = +ctx.match[2] as ExchangeOption;
    const pair = await this.coinService.getPairInfo(pairId);
    const user = await this.usersService.getUserByTelegramId(
      ctx.update.callback_query.from.id,
    );

    if (!this.pendingOrders[user.telegramId])
      this.addTimeout(user.telegramId.toString(), 1000 * 60 * 10);

    this.pendingOrders[user.telegramId] = { pairId: pairId, option };

    if (pair.from.type == CoinType.Cash || pair.to.type == CoinType.Cash) {
      const places = await this.coinService.getPlaces(
        option == ExchangeOption.Take ? pair.toId : pair.fromId,
      );

      const keyboard = chunk(
        places.map((e) => ({
          text: e['name_' + user.lang],
          callback_data: 'selectPlace(' + e.id + ')',
        })),
        2,
      );

      const options = {
        reply_markup: {
          inline_keyboard: keyboard,
          resize_keyboard: true,
        },
      };

      await ctx.reply('Your city', options);
    } else {
      const coinToType = await this.coinService.getCoinToTypeInfo(
        this.pendingOrders[user.telegramId].option == ExchangeOption.Take
          ? pair.toId
          : pair.fromId,
      );

      await ctx.reply(
        `Write the amount you want to ${this.pendingOrders[user.telegramId].option == ExchangeOption.Take ? 'take' : 'give'} ${coinToType['name_' + user.lang]}`,
      );
    }
  }

  @Action(/selectPlace\((\d+)\)/)
  async selectPlace(@Ctx() ctx) {
    const placeId = ctx.match[1];
    const user = await this.usersService.getUserByTelegramId(
      ctx.update.callback_query.from.id,
    );
    const pair = await this.coinService.getPairInfo(
      this.pendingOrders[user.telegramId].pairId,
    );
    const coinToType = await this.coinService.getCoinToTypeInfo(
      this.pendingOrders[user.telegramId].option == ExchangeOption.Take
        ? pair.toId
        : pair.fromId,
    );

    this.pendingOrders[user.telegramId].placeId = placeId;

    await ctx.reply(
      `Write the amount you want to ${this.pendingOrders[user.telegramId].option == ExchangeOption.Take ? 'take' : 'give'} ${coinToType['name_' + user.lang]}`,
    );
  }

  async showWhatYouWant(@Ctx() ctx, user: User) {
    const coinToTypes = await this.coinService.getCoinToTypes();
    const keyboard = chunk(
      coinToTypes.map((e) => ({
        text: e['name_' + user.lang],
        callback_data: 'buyCoin(' + e.id + ')',
      })),
      2,
    );

    const options = {
      reply_markup: {
        inline_keyboard: keyboard,
        resize_keyboard: true,
      },
      reply_to_message_id: ctx.message?.message_id,
      disable_notification: true,
    };

    await ctx.reply('What you want?', options);
  }

  addTimeout(name: string, milliseconds: number) {
    const callback = () => {
      if (this.pendingOrders[+name]) {
        delete this.pendingOrders[+name];
        this.schedulerRegistry.deleteTimeout(name);
      }
    };

    const timeout = setTimeout(callback, milliseconds);
    this.schedulerRegistry.addTimeout(name, timeout);
  }
}
