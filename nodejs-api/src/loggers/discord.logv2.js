import { Client, GatewayIntentBits  } from "discord.js"
import { env } from "~/configs/enviroments";

class LoggerDiscordV2 {
  constructor(){
    this.client = new Client({ 
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ] 
    });
    this.channelId = env.DISCORD_CHANNEL_ID

    this.client.on('clientReady', () => {
      console.log(`Logged in as ${this.client.user.tag}!`);
    })
    
    this.client.on('messageCreate', message => {
      console.log(`Message received: ${message.content} from ${message.author.tag}`);
      
      if (message.author.bot) return;
      
      if (message.content === 'ping') {
        message.reply('Pong!');
      }
    })

    this.client.login(env.DISCORD_TOKEN)
  }
  sendToFormatCode(logData) {
    const {code, message = 'This is some additional information about the code', title = 'Code example'} = logData;
    
    const codeMessage = {
      content: message,
      embeds: [
        {
          color: parseInt("00ff00", 16),
          title,
          description: '```json\n' + JSON.stringify(code, null, 2) + '\n```'
        }
      ]
    }
    // const channel = this.client.channels.cache.get(this.channelId);
    // if (!channel) {
    //   console.error("Channel not found");
    //   return;
    // }
    // channel.send(codeMessage).catch(err => {
    //   console.error("Failed to send formatted code message to Discord channel:", err);
    // });
    this.sendToMessage(codeMessage)
  }

  sendToMessage(message = "message" ){
    const channel = this.client.channels.cache.get(this.channelId);
    if (channel) {
      channel.send(message).catch(err => {
        console.error("Failed to send message to Discord channel:", err);
      });
    } else {
      console.error("Channel not found");
    }
  }
}

export const loggerDiscordV2 = new LoggerDiscordV2();