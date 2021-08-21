import { Request, Response } from "express";
import { ServerResponse } from "http";

require("@julianwebb/discord-logger")("discordMessaging");
if (process.env.NODE_ENVIRONMENT != "production") { require('dotenv').config(); }

const https = require('https');
const express = require("express");
import { validateRequest } from 'twilio';

interface discordMessage {
	from:string,
	title:string,
	body:string,
	recieved:string,
	color:Number
}

async function PostToDiscord(webhookLocation:string, message:discordMessage) {
	let requestOptions = {
		hostname: 'discord.com',
		port: 443,
		path: webhookLocation.replace('https://discord.com', ''),
		method: 'POST',
		headers: {
			'Content-Type': "application/json"
		}
	}

	const request = https.request(requestOptions, (response:ServerResponse) => {
		response.on("data", responseData => process.stdout.write(responseData));
	});

	request.on("error", (error:Error) => process.stderr.write(error.message));
	request.write(JSON.stringify({
		embeds: [{
			title: message.title,
			description: message.body,
			timestamp: message.recieved,
			color: message.color,
			footer: {
				text: message.from
			}
		}]
	}));
	request.end();
};

interface expressOptions {
	port:string
}

interface twilioOptions {
	authToken:string,
	URL:string
}

interface discordOptions {
	webhookLocation:string
}

async function discordMessaging(expressOptions:expressOptions, twilioOptions:twilioOptions, discordOptions:discordOptions) {
	const application = express();
	application.use(express.json());
	application.use(express.urlencoded({ extended: false }));
	application.post('/', (request:Request, response:Response) => {
		console.log(`Recieved request`);
		if (request.body) {
			let twilioSignature = request.headers['x-twilio-signature'];
			if (typeof twilioSignature == "string") {
				let twilioValidation = validateRequest(
					twilioOptions.authToken,
					twilioSignature,
					twilioOptions.URL,
					request.body
				)

				if (twilioValidation) {
					console.log(`Request Validated`)
					let message = {
						from: request.body.From,
						title: `Message from: ${request.body.From}`,
						body: request.body.Body,
						recieved: (new Date()).toISOString(),
						color: Math.floor((Math.abs(Math.sin(request.body.From) * 0xFFFFFF)) % 0xFFFFFF)
					};
					PostToDiscord(discordOptions.webhookLocation, message);
					response.send("<response></response>");
				} else {
					console.log(`Invalid Request`);
				}
			}
		}
		response.end();		
	})
	console.log(`Application listening at ${twilioOptions.URL}:${expressOptions.port}`)
	application.listen(expressOptions.port);
}

if (!process.env.EXPRESS_PORT) {
	console.error(`Express PORT Environment Variable not defined`);
	process.exit(1);
}

if (!process.env.TWILIO_URL) {
	console.error(`Twilio URL Environment Variable not defined`);
	process.exit(1);
}

if (!process.env.TWILIO_AUTH_TOKEN) {
	console.error(`Twilio Auth Token Environment Variable not defined`);
	process.exit(1);
}

if (!process.env.DISCORD_WEBHOOK) {
	console.error(`Discord Webhook URL Environment Variable not defined`);
	process.exit(1);
}

discordMessaging({
		port: process.env.EXPRESS_PORT
	}, {
		URL: process.env.TWILIO_URL,
		authToken: process.env.TWILIO_AUTH_TOKEN
	}, { 
		webhookLocation: process.env.DISCORD_WEBHOOK 
})