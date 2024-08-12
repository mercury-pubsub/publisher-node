import type { Channels } from "@mercury-pubsub/types";

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
	static #baseUrl = process.env.BASE_URL;

	#apiKey: string;

	constructor(clientId: string, clientSecret: string) {
		this.#apiKey = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
	}

	/**
	 * @throws {PublisherError}
	 */
	async publish<ChannelId extends keyof Channels>(
		channelId: ChannelId,
		body: Channels[ChannelId],
	): Promise<void> {
		const response = await fetch(new URL(channelId, Publisher.#baseUrl), {
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
	async getAccessToken(action: "pub" | "sub", channelId: keyof Channels): Promise<string> {
		const response = await fetch(
			new URL(`access-token/${action}/${channelId}`, Publisher.#baseUrl),
			{
				headers: {
					// biome-ignore lint/style/useNamingConvention: standard header name
					Authorization: `Basic ${this.#apiKey}`,
				},
			},
		);
		if (!response.ok) {
			throw new PublisherError(response.status, await response.text());
		}
		return response.text();
	}
}
