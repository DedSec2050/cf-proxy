import { drizzle } from 'drizzle-orm/d1';
import { schools } from './db/schema';

export interface Env {
	DB: D1Database;
}

export default {
	async fetch(request): Promise<Response> {
    	const corsHeaders = {
      		"Access-Control-Allow-Origin": "educase.marsalsoren2050.workers.dev,localhost,",
      		"Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
     		"Access-Control-Max-Age": "86400",
        };
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		const db = drizzle(env.DB);

		// Accepts: POST /add-school
		if (url.pathname === '/add-school' && request.method === 'POST') {
			let body: Record<string, any> = {};
			const contentType = request.headers.get('content-type') || '';

			// Support JSON body or query params
			if (contentType.includes('application/json')) {
				body = await request.json();
			} else {
				// Fallback: query params
				body = {
					name: url.searchParams.get('name'),
					address: url.searchParams.get('address'),
					latitude: url.searchParams.get('latitude'),
					longitude: url.searchParams.get('longitude'),
				};
			}

			const { name, address, latitude, longitude } = body;

			// Validate
			const lat = parseFloat(latitude);
			const long = parseFloat(longitude);

			if (!name || !address || isNaN(lat) || isNaN(long)) {
				return new Response(JSON.stringify({ error: 'Missing or invalid fields' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			// Insert into D1
			await db.insert(schools).values({
				name,
				address,
				latitude: lat,
				longitude: long,
			});

			return new Response(JSON.stringify({ message: 'School added successfully' }), {
				status: 201,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		if (url.pathname === '/list-schools' && request.method === 'GET') {
			const inputLat = parseFloat(url.searchParams.get('latitude') || '');
			const inputLng = parseFloat(url.searchParams.get('longitude') || '');

			if (isNaN(inputLat) || isNaN(inputLng)) {
				return new Response(JSON.stringify({ error: 'Missing or invalid latitude/longitude' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			const query = `
    SELECT
      id, name, address, latitude, longitude,
      (
        6371 * acos(
          cos(radians(?)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(?)) +
          sin(radians(?)) * sin(radians(latitude))
        )
      ) AS distance_km
    FROM schools
    ORDER BY distance_km ASC
    LIMIT 20;
  `;

			const results = await env.DB.prepare(query).bind(inputLat, inputLng, inputLat).all();

			return new Response(JSON.stringify(results.results), {
				headers: { 'Content-Type': 'application/json' },
			});
		}

		return new Response('Not found', { status: 404 });
	},
};
