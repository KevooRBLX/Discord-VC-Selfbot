
const { Client } = require("discord.js-selfbot-v13");
const dotenv = require("dotenv");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, entersState, VoiceConnectionStatus } = require('@discordjs/voice');

require('dotenv').config();

const client = new Client({
checkUpdate: false,
});

let voiceConnection = null;
const audioPlayer = createAudioPlayer();

client.on('ready', async () => {
console.log('Bot is online');
});

client.on('messageCreate', async (message) => {
if (message.author.id === client.user.id) {
const args = message.content.split(' ');
const command = args.shift().toLowerCase();


    if (command === '!vcjoin') {
        const channelID = args[0];
        const channel = client.channels.cache.get(channelID);

        if (!channel || channel.type !== 'GUILD_VOICE') {
            message.channel.send('Invalid voice channel ID!');
            return;
        }

        try {
            voiceConnection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });

            voiceConnection.subscribe(audioPlayer);
            console.log(`Joined voice channel: ${channel.name}`);
        } catch (error) {
            console.error('Error occurred while joining voice channel:', error);
        }
    }



    if (command === '!gcconnect') {
        const channelId = args[0];
      
        if (!channelId) {
          message.channel.send('Invalid Group DM channel ID!');
          return;
        }
      
        const channel = client.channels.cache.get(channelId);
      
        if (!channel || channel.type !== 'GROUP_DM') {
          message.channel.send('Invalid Group DM channel!');
          return;
        }
      
        try {
          voiceConnection = {
            channelId: channel.id,
          };
      
          console.log(`Joined Group DM channel: ${channel.name}`);
        } catch (error) {
          console.error('Error occurred while joining Group DM channel:', error);
        }
      }
      
      
      
      

      if (command === '!play') {
        const url = args[0];
        const dbLevel = args[1];
  
        if (!voiceConnection) {
          message.channel.send('Not currently in a voice channel!');
          return;
        }
  
        try {
          const volume = parseFloat(dbLevel);
          if (isNaN(volume) || volume <= 0) {
            message.channel.send('Invalid dB level!');
            return;
          }
  
          // Boost audio logic goes here
          // Example: Increase volume by multiplying with the dB level
          const boostedVolume = volume; // Adjust this logic based on your requirements
  
          const resource = createAudioResource(url, {
            inputType: StreamType.Arbitrary,
          });
  
          audioPlayer.play(resource);
          resource.volume.setVolume(boostedVolume); // Set volume after calling play()
  
          await entersState(audioPlayer, VoiceConnectionStatus.Playing, 5000);
          console.log(`Playing audio from URL: ${url} at ${dbLevel} dB`);
        } catch (error) {
          console.error('Error occurred while playing audio:', error);
        }
      }
      

    if (command === '!vcleave') {
        if (!voiceConnection) {
            message.channel.send('Not currently in a voice channel!');
            return;
        }

        try {
            await entersState(voiceConnection, VoiceConnectionStatus.Ready, 5000);
            voiceConnection.destroy();
            voiceConnection = null;
            console.log('Left voice channel');
        } catch (error) {
            console.error('Error occurred while leaving voice channel:', error);
        }
    }

    if (command === '!reconnect') {
        if (!voiceConnection) {
            message.channel.send('Not currently in a voice channel!');
            return;
        }

        try {
            const { channelId, guildId } = voiceConnection.joinConfig;
            const adapterCreator = voiceConnection.joinConfig.adapterCreator;

            voiceConnection.destroy();

            voiceConnection = joinVoiceChannel({
                channelId,
                guildId,
                adapterCreator,
            });

            voiceConnection.subscribe(audioPlayer);

            console.log('Reconnected to voice channel');
        } catch (error) {
            console.error('Error occurred while reconnecting to voice channel:', error);
        }
    }
}
});

client.login(process.env.TOKEN);