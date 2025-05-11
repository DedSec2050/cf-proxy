import { integer, text, real } from 'drizzle-orm/sqlite-core';

export const idColumn = integer('id').primaryKey({ autoIncrement: true });

export const nameColumn = (name = 'name') => text(name);
export const addressColumn = (name = 'address') => text(name);

export const latitudeColumn = (name = 'latitude') => real(name);
export const longitudeColumn = (name = 'longitude') => real(name);
