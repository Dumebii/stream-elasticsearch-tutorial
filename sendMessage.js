import 'dotenv/config';
import { StreamChat } from 'stream-chat';

const API_KEY = process.env.STREAM_API_KEY;
const API_SECRET = process.env.STREAM_API_SECRET;

console.log('API_KEY:', API_KEY);
console.log('API_SECRET is set?', !!API_SECRET);

// 1) Create a server-side client (no connectUser, because we have the secret)
const serverClient = StreamChat.getInstance(API_KEY, API_SECRET);

// 2) Run an async function to upsert user, create channel, send message
(async () => {
  try {
    // Ensure the "tester" user exists
    await serverClient.upsertUser({
      id: 'tester',
      name: 'Tester',
    });

    // If you want a brand new channel:
    // Provide both an ID (e.g. "test-channel") and "data"
    // data MUST include created_by_id for server-side creation
    const channel = serverClient.channel('messaging', 'test-channel', {
      name: 'Test Channel',
      members: ['tester'],
      created_by_id: 'tester', // crucial in server mode
    });

    // Actually create the channel (if it doesn't exist already)
    await channel.create();

    // Send a test message
    const response = await channel.sendMessage({
      text: 'Hello from server side test script!',
      user_id: 'tester',
    });

    console.log('✅ Message sent successfully!', response.message);
  } catch (error) {
    console.error('Error in sendTestMessage:', error);
  }
})();
