# Twilio2Discord-SMS

## Purpose
Allows a user to recieve SMS message on a Twilio number through a Discord Webhook

## Configuration

A Twilio Account and Phone Number is required.
This Application doesn't encrypt connections natively, it is suggested to use a reverse proxy in front of it.

### Environment Variables
| Variable | Description |
--- | ---
`DISCORD_WEBHOOK` | The URL of the Discord Webhook to push messages to
`EXPRESS_PORT` | The port for the Express Application to use
`TWILIO_URL` | The URL that Twilio uses, required for validation
`TWILIO_AUTH_TOKEN` | Twilio Auth Token, required for validation
