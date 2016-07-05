# GA-Bot
A general purpose slackbot for queueing TA appointments & taking attendance

Using the [slackbot NPM](https://github.com/rmcdaniel/node-slackbot)
by [Richard McDaniel](https://github.com/rmcdaniel)

Based on [dianabot](https://github.com/maxrpeterson/dianabot) by [Max R. Peterson](https://github.com/maxrpeterson)

This version written & maintained by [Bryan Mytko](https://github.com/bryanmytko)

-----
# Setup

1. Create a bot on Slack [here](https://my.slack.com/services/new/bot) and invite the bot to your channel.
1. Set the bot's key to an environment variable `SLACKBOT_KEY`
1. Set up the datbase by running `node db/migrations.js`
1. Run `node app.js` to start the bot.
1. Communicate with the bot by typing commands directly to the bot via mention or private message in Slack.
1. There are permission levels for certain commands. These can be set with environment variables `TA_ID` and `ADMIN_ID`

-------
# Customization

GA-Bot allows for custom interaction via the `bot_flavor.js` file. You can override the default messages here by adding data for the specific flavor keys:

- `present` Response when a student sends the attendance secret word.
- `already_queued` Response when you try to queue again.
- `secret_set` Message logged to the server when the secret changes.
- `remove` Response for leaving the queue.
- `empty_queue` Display message for clearing the queue.
- `attendance_cleared` Display message for clearing attendnace.
- `quotes` An array of quotes chosen at random when a user queues.
- `greeting` Message logged to the server when the bot has connected successfully.

-------

### List of commands:
All commands work by mentioning the bot directly, using the `@` mention system of Slack. For instance, to use the queue command, you would write: `@bot-name q me`
- `hello` - the bot will greet you back.
- `queue me` or `q me` - add yourself to the queue for help
- `remove` or `remove me` - remove yourself from the queue
- `status` - display the current status of/who is in the queue
- `what is my user id?` - the bot will give you your Slack internal user id.
- `<secret word>` - send the secret word to be marked as present for attendance.
- `help` - displays a list of the commands available to anyone who is not the admin/TA

Commands only available for the TA & Admin:
- `next` - removes the first person from the queue and sends a message to alert them that it is their turn. It also displays the new status of the queue
- `clear queue` - clears the queue.
- `attendance` - outputs the current attendance list.
- `clear attendance` - clears the current attendance list.

Commands only available for the Admin:
- `set secret <secret word>` - sets the secret word for attendance.

-------

### Issues

To request a feature, create an issue on the [GitHub](https://github.com/bryanmytko/ga-bot)  page

For more info on bots/bot users, check out [this page](https://api.slack.com/bot-users).
