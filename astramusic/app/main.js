const Discord = require("discord.js");
const { Client, Util } = require("discord.js");
const moment = require("moment");
const env = require('./env.json')
const YouTube = require("simple-youtube-api");
const bot = new Discord.Client();
const ytdl = require("ytdl-core");
const dotenv = require("dotenv").config();
require("./server.js");

const TOKEN = env.BOT_TOKEN;
const PREFIX = env.PREFIX;
const GOOGLE_API_KEY = env.YTAPI_KEY;
const sahip = env.AUTHOR;
const developer = env.DEVELOPER;

bot.on("ready", () => {
  bot.user.setActivity(`♫ Astra Music Bot | a!help   `, {
    type: "LISTENING"
  });
});

bot.on("warn", console.warn);
bot.on("error", console.error);

bot.login(TOKEN).then(
  function() {
    console.log(
      `[${moment().format(
        "ss:mm:HH DD-MM-YYYY"
      )}] Astra : Token Already Active.`
    );
    console.log(`[${moment().format("ss:mm:HH DD-MM-YYYY")}] Astra : Active!`);
    console.log(
      `[${moment().format("ss:mm:HH DD-MM-YYYY")}] Astra : Servers Online!`
    );
    console.log(
      `[${moment().format("ss:mm:HH DD-MM-YYYY")}] Astra : ` +
        bot.channels.cache.size +
        ` Channel, ` +
        bot.guilds.cache.size +
        ` Server `
    );
  },
  function(err) {
    console.log(
      `[${moment().format("ss:mm:HH DD-MM-YYYY")}] Astra : Renew Token` + err
    );
    setInterval(function() {
      process.exit(0);
    }, 20000);
  }
);

// Lore Yapay Zeka Sistemi.
/*--------------------------------------------------------------------------------------------------*/

bot.on("guildCreate", async guild => {
  let channel = guild.channels.cache.random();
  channel.send(
    `Thanks For Adding Me :heart: \n Support Server: **https://discord.gg/s96Svev**`
  );
});

bot.on("guildDelete", async guild => {
  guild.owner.send(
    `Im Kicked From Your Server \n Support Server: **https://discord.gg/s96Svev**`
  );
});

/*--------------------------------------------------------------------------------------------------*/

const youtube = new YouTube(GOOGLE_API_KEY);
const queue = new Map();

bot.on("message", async msg => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith(PREFIX)) return;

  const args = msg.content.split(" ");
  const searchString = args.slice(1).join(" ");
  const url = args[1] ? args[1].replace(/<(.+)>/g, "$1") : "";
  const serverQueue = queue.get(msg.guild.id);

  let command = msg.content.toLowerCase().split(" ")[0];
  command = command.slice(PREFIX.length);

  if (command === "help") {
    const helpembed = new Discord.MessageEmbed()
      .setColor("36393F")
      .setAuthor(bot.user.username, bot.user.displayAvatarURL())
      .setTimestamp()
      .setFooter(`Used by. ${msg.author.username}`)
      .setTimestamp()
      .setTitle("Prefix: ``a!``")
      .addField(
        "Play Command:",
        "``a!play (title/url)`` or ``a!p (title/url)``"
      )
      .addField("Search Command:", "``a!search (title)`` or ``a!sc (title)``")
      .addField("Leave Command:", "``a!leave``")
      .addField("Skip Command:", "``a!skip `` or ``a!s``")
      .addField("Volume Command:", "``a!volume 1-120`` or ``a!vol 1-120``")
      .addField("Now Playing Command:", "``a!nowplaying`` or ``a!np``")
      .addField("Queue Command:", "``a!queue`` or ``a!q``")
      .addField("Pause Command:", "``a!pause``")
      // .addField("Loop Command:", "``s!sloop`` or ``s!lp``")
      .addField("Resume Command:", "``a!resume``")
      .addField("Author Command:", "``a!author``")
      .addField("Invite Command:", "``a!invite``");
    msg.channel.send(helpembed);
    msg.delete();
  }
  if (command === "author") {
    const embed = new Discord.MessageEmbed()
      .setColor("36393F")
      .setAuthor(bot.user.username, bot.user.displayAvatarURL())
      .setTimestamp()
      .setFooter(`Used by. ${msg.author.username}`)
      .setTimestamp()
      .addField(
        `Bot Authors:`,
        `Leader: **<@!277803523628990465>** \n Senior Developer: ** <@!377152186234437633>**`
      );
    msg.channel.send(embed);
  }
  if (command === "invite") {
    const embed = new Discord.MessageEmbed()
      .setColor("36393F")
      .setAuthor(bot.user.username, bot.user.displayAvatarURL())
      .setTimestamp()
      .setFooter(`Used by. ${msg.author.username}`)
      .setTimestamp()
      .addField(
        `Args:`,
        `My Invite Link: https://discord.com/oauth2/authorize?client_id=733716314962526219&scope=bot&permissions=8 \n My Support Server: https://discord.gg/s96Svev`
      );
    msg.channel.send(embed);
  }
  if (command === "restart") {
    if (msg.author.id != sahip) return msg.reply(`**You Need a Author ID**`);
    msg.channel.send(`**The Bot Has Been Restarted**`).then(msg => {
      console.log("Restart Command Has Been Used.");
      process.exit(0);
    });
  }
  if (command === "dev-restart") {
    if (msg.author.id != developer)
      return msg.reply(`**You Need a Author ID**`);
    msg.channel.send(`**The Bot Has Been Restarted**`).then(msg => {
      console.log("Restart Command Has Been Used.");
      process.exit(0);
    });
  }
  if (command === "play" || command === "p") {
    const voiceChannel = msg.member.voice.channel;
    if (!voiceChannel)
      return msg.channel.send("You Should in a Voice Channel to Use Command!");
    const permissions = voiceChannel.permissionsFor(msg.client.user);
    if (!permissions.has("CONNECT")) {
      return msg.channel.send(
        `:x: I Need **CONNECT** Permission To Proceed!`
      );
    }
    if (!permissions.has("SPEAK")) {
      return msg.channel.send(
        `:x: I Need **SPEAK** Permission To Proceed!`
      );
    }
    if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
      const playlist = await youtube.getPlaylist(url);
      const videos = await playlist.getVideos();
      for (const video of Object.values(videos)) {
        const video2 = await youtube.getVideoByID(video.id);
        await handleVideo(video2, msg, voiceChannel, true);
      }
      return msg.channel.send(
        `:white_check_mark: **・** **\`${playlist.title}\`** Has been Added To The Queue!`
      );
    } else {
      try {
        var video = await youtube.getVideo(url);
      } catch (error) {
        try {
          var videos = await youtube.searchVideos(searchString, 10);
          var video = await youtube.getVideoByID(videos[0].id);
          if (!video)
            return msg.channel.send(
              ` **・**  I could not obtain any search results.`
            );
        } catch (err) {
          console.error(err);
          return msg.channel.send(
            `**・**  I could not obtain any search results.`
          );
        }
      }
      return handleVideo(video, msg, voiceChannel);
    }
  }
  if (command === "search" || command === "sc") {
    const voiceChannel = msg.member.voice.channel;
    if (!voiceChannel)
      return msg.channel.send("You Should in a Voice Channel to Use Command!");
    const permissions = voiceChannel.permissionsFor(msg.client.user);
    if (!permissions.has("CONNECT")) {
      return msg.channel.send(
        `:x: I Need **CONNECT** Permission To Proceed!`
      );
    }
    if (!permissions.has("SPEAK")) {
      return msg.channel.send(
        `:x: I Need **SPEAK** Permission To Proceed!`
      );
    }
    if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
      const playlist = await youtube.getPlaylist(url);
      const videos = await playlist.getVideos();
      for (const video of Object.values(videos)) {
        const video2 = await youtube.getVideoByID(video.id);
        await handleVideo(video2, msg, voiceChannel, true);
      }
      return msg.channel.send(
        `:white_check_mark:**・** **\`${playlist.title}\`** Has been Added To The Queue!`
      );
    } else {
      try {
        var video = await youtube.getVideo(url);
      } catch (error) {
        try {
          var videos = await youtube.searchVideos(searchString, 10);
          let index = 0;
          const embed234222 = new Discord.MessageEmbed()
            .setColor("36393F")
            .setAuthor(bot.user.username, bot.user.displayAvatarURL())
            .setTimestamp()
            .setFooter(`Used by. ${msg.author.username}`)
            .setTimestamp()
            /*------*/
            .setTitle("**Search Results**")
            .setDescription(
              `${videos
                .map(video2 => `**${++index}**  **・**  ${video2.title}`)
                .join("\n")}`,
              "Please Provide a Value To Select One Of The Result."
            );
          /*------*/

          msg.channel.send(embed234222);
          try {
            var response = await msg.channel.awaitMessages(
              msg2 => msg2.content > 0 && msg2.content < 11,
              {
                max: 1,
                time: 10000,
                errors: ["time"]
              }
            );
          } catch (err) {
            console.error(err);
            return msg.channel.send(
              `Video Search are canceled! :x: \n**Reason:** Timeout`
            );
          }
          const videoIndex = parseInt(response.first().content);
          var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
        } catch (err) {
          console.error(err);
          return msg.channel.send(
            `I Couldnt Obtain Any Search Results. :x:`
          );
        }
      }
      return handleVideo(video, msg, voiceChannel);
    }
  } else if (command === "skip" || command === "s") {
    if (!msg.member.voice.channel)
      return msg.channel.send("You Should in a Voice Channel to Use Command!");
    if (!serverQueue)
      return msg.channel.send(
        `There is Nothing Playing. :x:`
      );
    serverQueue.connection.dispatcher.end("Skip command has been used!");
    return msg.channel.send("⏭️  **|**  Skip command has been used!");
  } else if (command === "leave") {
    if (!msg.member.voice.channel)
      return msg.channel.send("You Should in a Voice Channel to Use Command!");
    if (!serverQueue)
      return msg.channel.send(
        `There is Nothing Playing. :x:`
      );
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end("Leave Command Has Been Used!");
    return msg.channel.send("⏹️  **|**  Leave Command Has Been Used!");
  } else if (command === "volume" || command === "vol") {
    if (!msg.member.voice.channel)
      return msg.channel.send(
        "I'm sorry but you need to be in a voice channel to play music!"
      );
    if (!serverQueue)
      return msg.channel.send(
        `There is Nothing Playing. :x:`
      );

    if (!args[1])
      return msg.channel.send(
        `**・** The Current Value: **${serverQueue.volume}%**`
      );
    if (isNaN(args[1]) || args[1] > 120)
      return msg.channel.send("**This Commands Values: min. 1 \n max. 120**");
    serverQueue.volume = args[1];
    serverQueue.connection.dispatcher.setVolume(args[1] / 120);
    return msg.channel.send(
      ` **・** New Value: **${args[1]}%**`
    );
  } else if (command === "nowplaying" || command === "np") {
    if (!serverQueue)
      return msg.channel.send(
        `There is Nothing Playing. :x:`
      );

    return msg.channel.send(`Now Playing: **${serverQueue.songs[0].title}**`);
  } else if (command === "queue" || command === "q") {
    if (!serverQueue)
      return msg.channel.send(
        `There is Nothing Playing. :x:`
      );
    const embed23422 = new Discord.MessageEmbed()
      .setColor("#36393F")
      .setAuthor(bot.user.username, bot.user.displayAvatarURL())
      .setTimestamp()
      .setFooter(`Used by. ${msg.author.username}`)
      .setTimestamp()
      /*------*/
      .setTitle("**Song Queue:**")
      .setDescription(
        `${serverQueue.songs
          .map(song => `**・** ${song.title}`)
          .join("\n")} \n\n**Now Playing:** \n*${serverQueue.songs[0].title}*`
      );

    return msg.channel.send(embed23422);
  } else if (command === "pause") {
    if (serverQueue && serverQueue.playing) {
      serverQueue.playing = false;
      serverQueue.connection.dispatcher.pause();
      return msg.channel.send("⏸  **|**  Music Are Paused!");
    }
    return msg.channel.send(
      `There is Nothing Playing. :x:`
    );
  } else if (command === "resume") {
    if (serverQueue && !serverQueue.playing) {
      serverQueue.playing = true;
      serverQueue.connection.dispatcher.resume();
      return msg.channel.send("▶  **|**  Music Are Resumed!");
    }
    return msg.channel.send(
      `There is Nothing Playing. :x:`
    );
  } /*else if (command === "loop" || command === "lp") {
    if (serverQueue) {
      serverQueue.loop = !serverQueue.loop;
      return msg.channel.send(
        `<a:disc:727487012109811712> **・** Music Loop Command ${
          serverQueue.loop === true ? "Enabled!" : "Disabled!"
        }`
      );
    }
    return msg.channel.send(
      `There is Nothing Playing. <:Hayir:727487020947079209>`
    );
  } */
});

async function handleVideo(video, msg, voiceChannel, playlist = false) {
  const serverQueue = queue.get(msg.guild.id);
  const song = {
    id: video.id,
    title: Util.escapeMarkdown(video.title),
    url: `https://www.youtube.com/watch?v=${video.id}`,
    channel: video.channel.title,
    durationm: video.duration.minutes,
    durations: video.duration.seconds,
    durationh: video.duration.hours,
    publishedAt: video.publishedAt
  };
  if (!serverQueue) {
    const queueConstruct = {
      textChannel: msg.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 100,
      playing: true,
      loop: false
    };
    queue.set(msg.guild.id, queueConstruct);

    queueConstruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueConstruct.connection = connection;
      play(msg.guild, queueConstruct.songs[0]);
    } catch (error) {
      console.error(`I could not join the voice channel: ${error}`);
      queue.delete(msg.guild.id);
      return msg.channel.send(
        `**Im Not Have a Join This Channel :x:**`
      );
    }
  } else {
    serverQueue.songs.push(song);
    if (playlist) return;
    else
      return msg.channel.send(
        `:white_check_mark: **・** **${song.title}** Has Been Added To The Queue!`
      );
  }
  return;
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);

  if (!song) {
    serverQueue.voiceChannel.leave();
    return queue.delete(guild.id);
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      const shiffed = serverQueue.songs.shift();
      if (serverQueue.loop === true) {
        serverQueue.songs.push(shiffed);
      }
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolume(serverQueue.volume / 100);

  serverQueue.textChannel.send({
    embed: {
      color: "#36393F",
      footer: {
        icon_url: "https://cdn.discordapp.com/emojis/727487028958199870.gif",
        text: " ・ Astra Music For All Servers"
      },
      thumbnail: {
        url: `https://i.ytimg.com/vi/${song.id}/sddefault.jpg`
      },
      fields: [
        {
          name: "Uploader:",
          value: `${song.channel}`
        },
        {
          name: "Song Name:",
          value: `<a:disc:727487012109811712> ・ ${song.title}\n\n   `
        },
        {
          name: "Song URL:",
          value: `- [Click Me](${song.url}) \n\n `,
          inline: true
        },
        {
          name: "Song Duration:",
          value: `**${song.durationh}** Hours, **${song.durationm}** Minutes, **${song.durations}** Seconds`
        }
        /* {
          name: "Uploaded At:",
          value: `- ${song.publishedAt} \n\n `,
          inline: true
        },*/
      ],
      author: {
        name: "Astra Music",
        icon_url:
          "https://cdn.discordapp.com/avatars/733716314962526219/b766534a551bcc46d51a6813641fc9ae.png?size=2048"
      }
    }
  });
}

/*--------------------------------------------------------------------------------------------------*/
/*
bot.on("ready", () => {
  setInterval(() => {
    let channell = bot.channels.cache.find(c => c.id === "727902407865925712");
    const embed = new Discord.MessageEmbed()
      .setColor("36393F")
      .setTitle("Ready Bots Status")
      .addField(
        "**Ram Usage:**",
        (process.memoryUsage().heapUsed / 512 / 512).toFixed(2) + " MB",
        true
      )
      .addField("**Music Channels:**;", bot.voice.connections.size)
      .addField("**Server:**", bot.guilds.cache.size.toLocaleString(), true)
      .setTimestamp()
      .setFooter(
        "Time:",
        "https://cdn.discordapp.com/emojis/726722827298013214.png?v=1"
      );
    channell.send(embed);
  }, 3600000);
});
*/
/*--------------------------------------------------------------------------------------------------*/

bot.on("message", async message => {
  if (message.channel.id !== "727990769947902093") return;
  message.react(`:white_check_mark:`);
  await message.react(`:x:`);
});

/*--------------------------------------------------------------------------------------------------*/
