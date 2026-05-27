import mongoose from "mongoose";
import dns from "node:dns";
import process from "node:process";

let databaseMode = "memory";

export async function connectDatabase() {
	const uri = process.env.MONGODB_URI;

	if (!uri) {
		databaseMode = "memory";
		console.warn(
			"MONGODB_URI is not set; using in-memory backend storage.",
		);
		return databaseMode;
	}

	if (uri.startsWith("mongodb+srv://")) {
		const configuredServers = process.env.DNS_SERVERS?.split(",")
			.map((server) => server.trim())
			.filter(Boolean);

		const dnsServers =
			configuredServers && configuredServers.length > 0
				? configuredServers
				: ["1.1.1.1", "8.8.8.8"];

		dns.setServers(dnsServers);
		console.info(
			`Using DNS servers for MongoDB SRV lookup: ${dnsServers.join(", ")}`,
		);
	}

	try {
		mongoose.set("strictQuery", true);
		await mongoose.connect(uri, {
			serverSelectionTimeoutMS: 3000,
		});
		databaseMode = "mongo";
		return databaseMode;
	} catch (error) {
		databaseMode = "memory";
		console.warn(
			`MongoDB unavailable (${error.message}). Falling back to in-memory backend storage.`,
		);
		return databaseMode;
	}
}

export function getDatabaseMode() {
	return databaseMode;
}

export function isMongoConnected() {
	return databaseMode === "mongo";
}
