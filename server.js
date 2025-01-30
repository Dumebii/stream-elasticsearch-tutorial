import 'dotenv/config';            // Loads environment variables from .env
import express from 'express';
import bodyParser from 'body-parser';
import { Client as ElasticsearchClient } from '@elastic/elasticsearch';
import { StreamChat } from 'stream-chat';

// 1) Initialize Express
const app = express();
app.use(bodyParser.json());

// 2) Connect to Elasticsearch
const esClient = new ElasticsearchClient({
  node: process.env.ELASTICSEARCH_NODE, // e.g. http://localhost:9200
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || '',
    password: process.env.ELASTICSEARCH_PASSWORD || '',
  },
});

// For Node < 20, you can't do top-level await easily without an async wrapper.
// If Node >= 20 and "type":"module", top-level await should be allowed:
try {
  const info = await esClient.info();
  console.log('Elasticsearch connected:', info);
} catch (err) {
  console.error('Elasticsearch connection error:', err);
}

// 3) Initialize Stream server client with SECRET (server-side auth)
const serverClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);
console.log('Stream server client initialized.');

// 4) Webhook endpoint
app.post('/stream-webhook', async (req, res) => {
  try {
    // Example: { type: 'message.new', message: { ... } }
    const { type, message } = req.body;
    console.log('Webhook event type:', type);

    // If it's a new message event, index it in Elasticsearch
    if (type === 'message.new') {
      await esClient.index({
        index: 'stream-chat',
        id: message.id, // Use Stream's message ID as ES doc ID
        body: {
          text: message.text,
          user_id: message.user.id,
          channel_id: message.channel_id,
          created_at: message.created_at,
        },
      });
      console.log(`Indexed message ${message.id} to Elasticsearch`);
    }
    // You could also handle "message.updated", "message.deleted" similarly

    res.status(200).send('Webhook processed');
  } catch (error) {
    console.error('Error in webhook route:', error);
    res.status(500).send('Server error');
  }
});

// 5) Basic health check
app.get('/', (req, res) => {
  res.send('Server is up and running');
});

// 6) Start listening
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
