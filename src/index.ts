import { drizzle } from 'drizzle-orm/d1';
import { schools } from './db/schema';

export interface Env {
	DB: D1Database;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		const db = drizzle(env.DB);

		// CORS Headers
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*', // Allow any origin for now, you can customize this.
			'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
			'Access-Control-Max-Age': '86400',
		};

		// Handle OPTIONS request for CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: corsHeaders });
		}

		// Serve the HTML page with the demo buttons
		if (url.pathname === '/' && request.method === 'GET') {
			return new Response(
				`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EDUCASE API Demo</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f9;
        margin: 0;
        padding: 20px;
      }
      h1 {
        color: #007bff;
      }
      .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 30px;
      }
      .endpoint-btn {
        background-color: #007bff;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin: 10px;
      }
      .endpoint-btn:hover {
        background-color: #0056b3;
      }
      .demo {
        display: none;
        margin-top: 20px;
        background-color: #f1f1f1;
        padding: 15px;
        border-radius: 5px;
        width: 80%;
        max-width: 600px;
        text-align: left;
        font-family: monospace;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      .show-demo {
        display: block;
      }
      .copy-btn {
        background-color: #28a745;
        color: white;
        padding: 8px 16px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 10px;
      }
      .copy-btn:hover {
        background-color: #218838;
      }
    </style>
  </head>
  <body>
    <h1>API Demo - Endpoints</h1>
    <div class="container">
      <button class="endpoint-btn" id="addSchoolBtn">POST /add-school</button>
      <div id="addSchoolDemo" class="demo">
        <h3>How to pass data:</h3>
        <pre>
POST /add-school
Body (JSON format):
{
  "name": "ABC School",
  "address": "123 Main St",
  "latitude": 12.3,
  "longitude": 45.6
}
        </pre>
        <button class="copy-btn" id="copyAddSchoolUrl">Copy URL</button>
      </div>

      <button class="endpoint-btn" id="listSchoolsBtn">GET /list-schools</button>
      <div id="listSchoolsDemo" class="demo">
        <h3>How to pass data:</h3>
        <pre>
GET /list-schools?latitude=12.3&longitude=45.6
        </pre>
        <button class="copy-btn" id="copyListSchoolsUrl">Copy URL</button>
      </div>
    </div>
    
    <script>
      // Toggle the visibility of demo examples
      document.getElementById('addSchoolBtn').addEventListener('click', function() {
        document.getElementById('addSchoolDemo').classList.toggle('show-demo');
      });

      document.getElementById('listSchoolsBtn').addEventListener('click', function() {
        document.getElementById('listSchoolsDemo').classList.toggle('show-demo');
      });

      // Function to copy URL to clipboard
      function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(function() {
          alert('URL copied to clipboard!');
        }).catch(function(err) {
          alert('Failed to copy: ' + err);
        });
      }

      // Event listener for "Copy URL" buttons
      document.getElementById('copyAddSchoolUrl').addEventListener('click', function() {
		const queryParams1 = new URLSearchParams({
			name: "ABC School",
			address: "123 Main St",
			latitude: "12.3",
			longitude: "45.6"
		}).toString();
        const url = \`https://educase.marsalsoren2050.workers.dev/add-school?\${queryParams1}\`;
        copyToClipboard(url);
      });

      document.getElementById('copyListSchoolsUrl').addEventListener('click', function() {
	  const queryParams = new URLSearchParams({
		name: "ABC School",
		address: "123 Main St",
		latitude: "12.3",
		longitude: "45.6"
		}).toString();
        const url = \`https://educase.marsalsoren2050.workers.dev/list-schools?\${queryParams}\`;
        copyToClipboard(url);
      });
    </script>
  </body>
  </html>
`,
				{
					status: 200,
					headers: {
						'Content-Type': 'text/html', // Ensure the Content-Type is set to 'text/html'
					},
				}
			);
		}

		// POST /add-school
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

		// GET /list-schools
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
