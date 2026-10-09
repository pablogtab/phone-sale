import { Client } from '@/database/entities';

export type PublicClient = Omit<Client, 'id' | 'deletedAt'>;
