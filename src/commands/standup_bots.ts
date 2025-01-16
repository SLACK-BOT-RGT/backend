import { App } from "@slack/bolt";
import * as dotenv from "dotenv";
dotenv.config();


const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const standupQuestions = [
  "What did you work on yesterday?",
  "What are you working on today?",
  "Any blockers or challenges?",
];

// Store user responses and track non-respondents
let responses: { [key: string]: string[] } = {};
let participants: string[] = [];

// Schedule standup prompts
const scheduleStandupPrompt = () => {
  const channelId = process.env.STANDUP_CHANNEL_ID!;
  const now = new Date();

  // Calculate next prompt time (e.g., 9:00 AM local time)
  const millisTillPrompt =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      9, 0, 0, 0
    ).getTime() - now.getTime();
 
  setTimeout(async () => {
    await sendStandupPrompt(channelId);
    setInterval(() => sendStandupPrompt(channelId), 24 * 60 * 60 * 1000);
  }, millisTillPrompt > 0 ? millisTillPrompt : 24 * 60 * 60 * 1000);
};

// Send standup prompt
const sendStandupPrompt = async (channelId: string) => {
  responses = {}; // Clear previous responses
  participants = []; // Reset participant tracking

  try {
    const result = await app.client.chat.postMessage({
      channel: channelId,
      text: "👋 Good morning team! It's standup time! Please reply in this thread:\n\n" +
        standupQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n"),
    });

    const threadTs = result.ts; 

    // Set reminder after 30 minutes for non-respondents
    setTimeout(() => sendReminder(channelId, threadTs), 30 * 60 * 1000);
  } catch (error) {
    console.error("Error sending standup prompt:", error);
  }
};

// Handle user responses in thread
app.message(async ({ message, say }) => {
  if (message.channel_type) {
    const userId = message.channel_type;

    if (!responses[userId]) {
      responses[userId] = [];
      participants.push(userId);
    }

    responses[userId].push(message.channel);
    await say(`<@${userId}> thanks for your response!`);
  }
});

// Send reminders to non-respondents
const sendReminder = async (channelId: string, threadTs: any) => {
  const userList = await getAllChannelMembers(channelId);
  const nonRespondents = userList.filter(user => !participants.includes(user));

  if (nonRespondents.length > 0) {
    const reminderText = nonRespondents.map(user => `<@${user}>`).join(", ");
    await app.client.chat.postMessage({
      channel: channelId,
      text: `⏰ Reminder: Please respond to the standup prompt if you haven't already!`,
      thread_ts: threadTs,
    });
  }
};

// Fetch all channel members
const getAllChannelMembers = async (channelId: string) => {
  try {
    const result = await app.client.conversations.members({ channel: channelId });
    return result.members || [];
  } catch (error) {
    console.error("Error fetching channel members:", error);
    return [];
  }
};

// Start the Slack bot
(async () => {
  await app.start(process.env.PORT || 300);
  console.log("⚡️ Slack Standup Bot is running!");
  scheduleStandupPrompt();
})();
