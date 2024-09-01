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
	#baseUrl: string;
	#projectId: string;
	#apiKey: string;

	constructor(
		region: "southeast-asia" | "eu-west" | "us-east" | "us-west",
		projectId: string,
		apiKey: string,
	) {
		// biome-ignore lint/style/noNonNullAssertion: guaranteed by @t3-oss/env-core
		this.#baseUrl = process.env.BASE_URL!.replace("{{REGION}}", region);
		this.#projectId = projectId;
		this.#apiKey = apiKey;

		this.publish = this.publish.bind(this);
		this.getAccessToken = this.getAccessToken.bind(this);
	}

	/**
	 * @throws {PublisherError}
	 */
	async publish<ChannelName extends keyof Channels>(
		channelName: ChannelName,
		body: Channels[ChannelName],
	): Promise<void> {
		const response = await fetch(
			new URL(`${this.#projectId}/${encodeURIComponent(channelName)}`, this.#baseUrl),
			{
				method: "POST",
				body: JSON.stringify(body),
				headers: {
					"Content-Type": "application/json",
					// biome-ignore lint/style/useNamingConvention: standard header name
					Authorization: `Basic ${this.#apiKey}`,
				},
			},
		);
		if (!response.ok) {
			throw new PublisherError(response.status, await response.text());
		}
	}

	/**
	 * @throws {PublisherError}
	 */
	async getAccessToken(action: "pub" | "sub", channelName: keyof Channels): Promise<string> {
		const response = await fetch(
			new URL(
				`access-token/${this.#projectId}/${action}/${encodeURIComponent(channelName)}`,
				this.#baseUrl,
			),
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
