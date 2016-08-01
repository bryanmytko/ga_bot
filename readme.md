# GA-Bot
A general purpose slackbot for queueing TA appointments & taking attendance

Using the [slackbot NPM](https://github.com/rmcdaniel/node-slackbot)
by [Richard McDaniel](https://github.com/rmcdaniel)

Based on [dianabot](https://github.com/maxrpeterson/dianabot) by [Max R. Peterson](https://github.com/maxrpeterson)

This version written & maintained by [Bryan Mytko](https://github.com/bryanmytko)

-----
# Setup

1. Create a bot on Slack [here](https://my.slack.com/services/new/bot) and invite the bot to your channel.
1. Rename the file `env-vars.sample.js` to `env-vars.js`. Be careful not to add this file to your repository.
1. Set the bot's key to an environment variable `SLACKBOT_KEY` in your env-vars.js file.
1. Set up the datbase by running `node db/migrations.js`
1. Run `npm start` to start the bot. Alternatively, ga_bot implements [forever](https://www.npmjs.com/package/forever) which can be executed with `forever start app.js`.
1. Communicate with the bot by typing commands directly to the bot via mention or private message in Slack.
1. There are permission levels for certain commands. These can be set with environment variables in the `env-vars.js` file for `TA_ID` and `ADMIN_ID`. If you don't know these values, see the command belong to obtain your user id.

-------
# Customization

GA-Bot allows for custom interaction via the `bot_flavor.js` file. Rename the provided `custom_bot/bot_flavor.sample.js` file. You can override the default messages here by adding data for the specific flavor keys:

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
- `queue me [message]` or `q me [message]` - add yourself to the queue for help. Optional `message` parameter lets the TA know what topic you need help with.
- `remove` or `remove me` - remove yourself from the queue
- `status` - display the current status of/who is in the queue
- `what is my user id?` - the bot will give you your Slack internal user id.
- `<secret word>` - send the secret word to be marked as present for attendance.
- `help` - displays a list of the commands available to anyone who is not the admin/TA

Commands only available for the TA & Admin:
- `next` - removes the first person from the queue and sends a message to alert them that it is their turn. It also displays the new status of the queue.
- `remove [username,[username2...]]` - removes specific, by name, from the queue.
- `clear queue` - clears the queue.
- `attendance` - outputs the current attendance list.
- `clear attendance` - clears the current attendance list.

Commands only available for the Admin:
- `set secret <secret word>` - sets the secret word for attendance.

-------

### Issues

To request a feature, create an issue on the [GitHub](https://github.com/bryanmytko/ga-bot)  page

For more info on bots/bot users, check out [this page](https://api.slack.com/bot-users).
