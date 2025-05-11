import { sqliteTable } from 'drizzle-orm/sqlite-core';
import { idColumn, nameColumn, addressColumn, latitudeColumn, longitudeColumn } from './columns';

export const schools = sqliteTable('schools', {
	id: idColumn,
	name: nameColumn(),
	address: addressColumn(),
	latitude: latitudeColumn(),
	longitude: longitudeColumn(),
});
