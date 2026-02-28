import type { Bot } from 'grammy';

import type { MyContext } from '@/shared/infrastructure/telegram/telegram-client';
import { getEnv } from '@/shared/lib/helpers/get-env.helper';

import type { ProductCommands } from '../product/product.commands';

interface Deps {
  bot: Bot<MyContext>;
  productCommands: ProductCommands;
}

type HandlerName = 'createProduct' | 'deleteProduct';

export function createTelegramRouter(deps: Deps) {
  deps.bot.command('start', async ctx => {
    const adminIds = getEnv('TELEGRAM_ADMIN_IDS')
      .split(',')
      .map(id => parseInt(id.trim()));
    const userId = ctx.message?.from.id;
    if (!userId || !adminIds.includes(userId)) {
      return await ctx.reply('Вы не являетесь администратором 👨‍💼');
    }
    return await ctx.reply('Выбери действие:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Создать продукт', callback_data: 'createProduct' }],
          [{ text: 'Удалить продукт', callback_data: 'deleteProduct' }],
        ],
      },
    });
  });

  deps.bot.on('callback_query:data', async ctx => {
    const adminIds = getEnv('TELEGRAM_ADMIN_IDS')
      .split(',')
      .map(id => parseInt(id.trim()));
    if (!adminIds.includes(ctx.callbackQuery.from.id)) {
      await ctx.answerCallbackQuery();
      return await ctx.reply('Вы не являетесь администратором 👨‍💼');
    }

    const data = ctx.callbackQuery.data;

    const productHandlers: Record<HandlerName, (ctx: MyContext) => Promise<void>> = {
      createProduct: async (ctx: MyContext) => {
        await ctx.answerCallbackQuery();
        await ctx.conversation.enter('createProduct');
      },
      deleteProduct: async (ctx: MyContext) => {
        await ctx.answerCallbackQuery();
        await ctx.conversation.enter('removeProduct');
      },
    };

    if (data in productHandlers) {
      const handler = productHandlers[data as HandlerName];
      return await handler(ctx);
    }
  });

  deps.bot.start();
}
