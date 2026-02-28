import { Index } from 'meilisearch';

import { Product } from '@/shared/infrastructure/db/schemes/product.schema';

import { IDataCounterCommands } from '../data-counter/data-counter.commands';

import { IProductRepository } from './product.repo';

interface Deps {
  productRepo: IProductRepository;
  searchIndex: Index<Pick<Product, 'id' | 'name' | 'price'>>;
  dataCounterCommands: IDataCounterCommands;
}

export class ProductCommands {
  constructor(private readonly deps: Deps) {}

  public create = async (data: {
    name: string;
    price: number;
    inStock: number;
    details: Record<string, unknown>;
    description: string;
    image: string;
    aliases: string[];
    categories: string[];
  }) => {
    const product = await this.deps.productRepo.create(data);
    await this.deps.searchIndex.addDocuments([product]);
    await this.deps.dataCounterCommands.updateCount('increment', 'products');
    return product;
  };

  public remove = async (id: string) => {
    await this.deps.productRepo.remove(id);
    await this.deps.searchIndex.deleteDocument(id);
    await this.deps.dataCounterCommands.updateCount('decrement', 'products');
  };
}
