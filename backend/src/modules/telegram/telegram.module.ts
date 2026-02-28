import type { Bot } from 'grammy';
import Redis from 'ioredis';

import { createTelegramBot } from '@/shared/infrastructure/telegram/telegram-client';
import { CreateModuleResult } from '@/shared/types/create-module.result.type';

import type { ProductCommands } from '../product/product.commands';

import { TelegramCommands } from './telegram.commands';
import { createTelegramConsumer } from './telegram.consumer';

interface Deps {
  redis: Redis;
  productCommands: ProductCommands;
}

export function createTelegramModule(
  deps: Deps,
): CreateModuleResult<TelegramCommands> & { bot: Bot<any> } {
  const bot = createTelegramBot({
    createProduct: deps.productCommands.create,
    removeProduct: deps.productCommands.remove,
  });

  const commands = new TelegramCommands(bot);
  createTelegramConsumer({
    redis: deps.redis,
    telegramCommands: commands,
  });

  return { commands, bot };
}
