interface Env {
    API_ID: string;
    API_SECRET: string;
}

const ALLOWED_ORIGIN = 'https://fily.aupas.eu'
//const ALLOWED_ORIGIN = null;

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        // Check for required environment variables
        if (!env.API_ID || !env.API_SECRET) {
            return new Response('API_ID and API_SECRET must be set in the environment variables', { status: 500 });
        }

        // Handle preflight request for CORS
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: {
                    'Access-Control-Allow-Origin': ALLOWED_ORIGIN || '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                },
            });
        }

        // Fetch data from the API
        const requestData = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${env.API_ID}/credentials/generate`, {
            headers: {
                'Authorization': `Bearer ${env.API_SECRET}`,
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({ "ttl": 86400 })
        });

        const responseData = await requestData.json();

        // Set CORS headers for the response
        return new Response(JSON.stringify(responseData), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': ALLOWED_ORIGIN || '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    },
} satisfies ExportedHandler<Env>;
