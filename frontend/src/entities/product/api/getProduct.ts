import { baseFetch } from '@/shared/api/base';

import type { TProduct } from '../model/types';

export const getProduct = (id: string) => {
  return baseFetch<TProduct & { isFavorite: boolean }>(`/product/${id}`, { method: 'GET' });
};
