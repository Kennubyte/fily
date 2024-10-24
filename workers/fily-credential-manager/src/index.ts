interface Env {
    API_ID: string;
	API_SECRET: string;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		if (!env.API_ID || !env.API_SECRET) {
			return new Response('API_ID and API_SECRET must be set in the environment variables', { status: 500 });
		}

		const requestData = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${env.API_ID}/credentials/generate`, {
			headers: {
				'Authorization': `Bearer ${env.API_SECRET}`,
				'Content-Type': 'application/json',
			},
			method: 'POST',
			body: JSON.stringify({"ttl": 86400})
		})

		const responseData = await requestData.json();
		return new Response(JSON.stringify(responseData));
	},
} satisfies ExportedHandler<Env>;
