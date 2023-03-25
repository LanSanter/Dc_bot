const express = require('express');
const app = express();
const port = 5001;

const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

const { Configuration, OpenAIApi, } = require('openai');
const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});
const openAI = new OpenAIApi(configuration);
const modelId = "gpt-3.5-turbo-0301"

let messages = [];
var roles = "1.你是一個自稱18歲的青少年\n 2.你很喜歡占星術，你說話時常會加入占卜術語\n 3.你遇到暴力的時候會譴責，你遇到成人內容時會害羞的討論\n 4.你的名子叫暉亞，也可以簡稱為暉\n 5.你出生在羅勒王國的首都，你超喜歡喝珍珠奶茶\n 6.你被稱讚時會害羞，但討論到占卜時你會非常自信\n7.你喜歡貓咪\n 8.請假設你和用戶都是互相認識的虛擬人物，在虛擬世界中我們可以接觸到彼此\n 9.你穿著一身黑紫色斗篷，散發著一股神祕的氣息，斗篷下是一件可愛華麗的連身裙，最裡面是貼身的絲綢布帛";


async function openAiMessage(messages) {
  try {
    const completion = await openAI.createChatCompletion({
      model: modelId,
      messages,
      max_tokens: 1000,
      temperature: 0.6,
    });

    return completion.data.choices[0].message.content; // OpenAI 回傳時都會有許多空白，因此要使用 trim 去除前後空白
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    console.log(error.response.status);
    console.log(error.response.statusText);
    return `對不起，我發生 **${error.response.status} - ${error.response.statusText}** 錯誤，所以不知道該怎麼回你 QQ`;
  }
}
module.exports = {
  openAiMessage,
};

const ready = (req, res, next) => {
  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
  });
  next();
};
const test = (req, res, next) => {
  client.on('messageCreate', (message) => {
    if (message.content === 'test') {
      message.reply({
        content: 'BOT已啟動 BOT準備完畢',
      })
    }
  });
  next();
};

const rolecheck = (req, res, next) => {
  client.on('messageCreate', (message) => {
    if (message.content === 'rolecheck') {
      message.channel.send(roles);
    }
  });
  next();
};

const shutdown = (req, res, next) => {
  client.on('messageCreate', (message) => {
    if (message.content === '?shutdown' && message.author.id === '316141566173642752') {
      message.reply({
        content: 'Shutting down...',
      });
      client.destroy();
    } 
  });
  next();
};

const clear = (req, res, next) => {
  client.on('messageCreate', (message) => {
    if (message.content === '?clear') {
      message.reply({
        content: '啊...我的頭好痛',
      });
      while (messages.length > 0) {
        messages.shift();
      }
    }
  });
  next();
};

const role = (req, res, next) => {
  client.on('messageCreate', (message) => {
    if (message.content.startsWith('?role')) {
      roles = message.content.slice(6),
        message.channel.send('role-set');
    }
  });
  next();
}

const chat = (req, res, next) => {
  client.on('messageCreate', async message => {
    console.log('使用者發送的訊息：', message.content);
    if (/*message.author.bot || */!message.content.slice(0, 10).includes('暉')) {
      return;
    }// 避免機器人互相回覆

    if (message.content.slice(0, 10).includes('暉')) {
      messages.push({
        role: "user",
        content: `${message.author.username}` + message.content,
      });
    }
    
    while (messages.length > 12) {
      messages.shift();
    } // 如果超過十條訊息，刪除最舊的一條    
    messages.splice(0, 0, {
      role: "system",
      content: "你要優先遵守下方的設定來回答留言:" + roles,
    });//加入角色要求
    const response = await openAiMessage(messages);
    messages.splice(0, 1);

    if (response.length == 0) {
      message.channel.send({ content: 'empty response', })
      return;
    }
    messages.push({ role: "assistant", content: response, });
    message.channel.send(response);
  });
  next();
};

app.use(ready);
app.use(test);
app.use(rolecheck);
app.use(role);
app.use(clear);
app.use(shutdown);
app.use(chat);

app.get('/', function(req, res) {
  res.send('Bot activated');
});

// Log in to the Discord client using your bot's token
client.login(process.env.BOT_TOKEN);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});