/**
 * @public
 */
export class PublisherError extends Error {
	status: number;

	constructor(status: number, message?: string) {
		super(message);
		this.status = status;
	}
}

/**
 * @public
 */
export class Publisher {
	#baseUrl: string;
	#apiKey: string;

	constructor(clientId: string, clientSecret: string) {
		this.#baseUrl = "http://localhost:8080";
		this.#apiKey = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
	}

	/**
	 * @throws {PublisherError}
	 */
	async publish(channelId: string, body: unknown): Promise<void> {
		const response = await fetch(new URL(channelId, this.#baseUrl), {
			method: "POST",
			body: JSON.stringify(body),
			headers: {
				"Content-Type": "application/json",
				// biome-ignore lint/style/useNamingConvention: standard header name
				Authorization: `Basic ${this.#apiKey}`,
			},
		});
		if (!response.ok) {
			throw new PublisherError(response.status, await response.text());
		}
	}

	/**
	 * @throws {PublisherError}
	 */
	async getAccessToken(action: "pub" | "sub", channelId: string): Promise<string> {
		const response = await fetch(new URL(`access-token/${action}/${channelId}`, this.#baseUrl), {
			headers: {
				// biome-ignore lint/style/useNamingConvention: standard header name
				Authorization: `Basic ${this.#apiKey}`,
			},
		});
		if (!response.ok) {
			throw new PublisherError(response.status, await response.text());
		}
		return response.text();
	}
}
