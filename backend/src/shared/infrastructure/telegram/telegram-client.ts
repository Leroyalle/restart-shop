import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from '@grammyjs/conversations';
import { Bot, type Context } from 'grammy';
import z from 'zod';

import { createProductZodSchema } from '@/modules/product/schemas/create-product.schema';
import { getEnv } from '@/shared/lib/helpers/get-env.helper';

type Product = {
  name: string;
  price: number;
  details: Record<string, unknown>;
  description: string;
  inStock: number;
  image: string;
  aliases: string[];
  categories: string[];
};

interface Deps {
  createProduct: (data: Product) => Promise<unknown>;
  removeProduct: (productId: string) => Promise<unknown>;
}

export type MyContext = Context & ConversationFlavor<Context>;

export function createTelegramBot(deps: Deps): Bot<MyContext> {
  async function createProductConversation(
    conversation: Conversation<MyContext, MyContext>,
    ctx: MyContext,
  ) {
    await ctx.reply('Пришли JSON массив продуктов');

    const { message } = await conversation.wait();

    if (!message?.text) {
      await ctx.reply('Ожидается текст.');
      return;
    }

    try {
      const raw = JSON.parse(message.text);
      const parsed = z.array(createProductZodSchema).parse(raw);

      if (!Array.isArray(parsed)) {
        await ctx.reply('Нужен массив.');
        return;
      }
      for (const product of parsed) {
        await deps.createProduct?.(product as Product);
      }

      await ctx.reply('✔️ Готово. Продукт проиндексирован и создан.');
    } catch {
      await ctx.reply('❌ Невалидный JSON.');
    }
  }

  async function removeProductConversation(
    conversation: Conversation<MyContext, MyContext>,
    ctx: MyContext,
  ) {
    await ctx.reply('Пришли ID продукта');

    const { message } = await conversation.wait();

    if (!message?.text) {
      await ctx.reply('Ожидается текст.');
      return;
    }

    try {
      const productId = message.text;
      await deps.removeProduct(productId);
      await ctx.reply('✔️ Готово. Продукт удален.');
    } catch {
      await ctx.reply('❌ Невалидный ID. Либо продукт не найден.');
    }
  }

  const bot = new Bot<MyContext>(getEnv('BOT_API_KEY'));
  bot.use(conversations());
  bot.use(createConversation(createProductConversation, 'createProduct'));
  bot.use(createConversation(removeProductConversation, 'removeProduct'));
  return bot;
}
