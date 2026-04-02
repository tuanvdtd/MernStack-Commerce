import { Client, GatewayIntentBits  } from "discord.js"
import { env } from "~/configs/enviroments";
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ] 
});

client.on('clientReady', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', message => {
  console.log(`Message received: ${message.content} from ${message.author.tag}`);
  
  if (message.author.bot) return;
  
  if (message.content === 'ping') {
    message.reply('Pong!');
  }
})

client.on('error', error => {
  console.error('Discord client error:', error);
});

const TOKEN = env.DISCORD_TOKEN;

client.login(TOKEN).catch(error => {
  console.error('Failed to login to Discord:', error);
});

export { client };