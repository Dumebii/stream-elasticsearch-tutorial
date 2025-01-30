

# **Stream Chat + Elasticsearch Integration**

This repository demonstrates how to set up **Stream Chat** with **Elasticsearch** for advanced full-text search and indexing. It includes:

1. A **Node.js** server (`server.js`) that listens for **Stream** webhooks and indexes new messages into Elasticsearch.  
2. A **test script** (`sendTestMessage.mjs`) that uses **Stream’s server-side** authentication to create channels and send messages (triggering the webhook).

## **Project Structure**

```
.
├─ .env
├─ package.json
├─ server.js                # Node.js (Express) server handling webhooks
├─ sendTestMessage.mjs      # Script to send test messages via server-side auth
└─ README.md
```

## **Prerequisites**

1. **Node.js** (v14 or later).  
2. A **Stream Chat** account:
   - [Sign up here](https://getstream.io/accounts/signup/) if you don’t have one.
   - Create a Chat app in the Stream dashboard and note your **API Key** and **API Secret**.
3. **Elasticsearch**:
   - Either run locally (e.g., Docker) or use a hosted Elasticsearch service.
4. (Optional) **Kibana** to visualize indexed data.

## **Installation & Setup**

1. **Clone** this repository:

   ```bash
   git clone https://github.com/<YOUR_USERNAME>/stream-chat-elasticsearch.git
   cd stream-chat-elasticsearch
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Create a `.env` file** at the project root:

   ```bash
   touch .env
   ```

   With content similar to:
   ```ini
   STREAM_API_KEY=<YOUR_STREAM_API_KEY>
   STREAM_API_SECRET=<YOUR_STREAM_API_SECRET>

   # Elasticsearch node
   ELASTICSEARCH_NODE=http://localhost:9200
   # If your ES requires auth:
   ELASTICSEARCH_USERNAME=elastic
   ELASTICSEARCH_PASSWORD=<YOUR_ELASTIC_PASSWORD>

   # Local server port
   PORT=3000
   ```

4. **Run Elasticsearch** (Example Docker command):

   ```bash
   docker run -d -p 9200:9200 -p 9300:9300 \
     -e "discovery.type=single-node" \
     -e "xpack.security.enabled=false" \
     -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
     --name es-dev \
     docker.elastic.co/elasticsearch/elasticsearch:8.10.2
   ```

5. **(Optional) Run Kibana**:

   ```bash
   docker run -d -p 5601:5601 \
     --name kibana-dev \
     --link es-dev:elasticsearch \
     docker.elastic.co/kibana/kibana:8.10.2
   ```

## **Usage**

### **1. Run the Node.js Server**

The **`server.js`** file:

- Listens on `PORT` (default `3000`).
- Has a `POST /stream-webhook` route that receives **Stream Chat** events.
- Indexes `message.new` events into the `stream-chat` index in Elasticsearch.

```bash
npm start
```

You should see logs like:
```
Elasticsearch connected
Stream server client initialized.
Server listening on port 3000
```

### **2. Expose Your Webhook (Local Development)**

Stream needs a public URL to call your `/stream-webhook`. For local development, use **ngrok**:

```bash
ngrok http 3000
```

Copy the **Forwarding** URL (e.g., `https://abc123.ngrok.io`) and configure it in your **Stream dashboard** under **Events & Webhooks**, appending `/stream-webhook`.

### **3. Send a Test Message**

Use **`sendTestMessage.mjs`** to create a channel and send a message in **server mode**:

```bash
node sendTestMessage.mjs
```

Expected output:
```
✅ Message sent successfully! { ... }
```

- This triggers Stream’s `message.new` event, calling your **webhook** (`/stream-webhook`).
- The server logs: “Webhook event type: message.new” and “Indexed message <id> to Elasticsearch”.

### **4. Verify Data in Elasticsearch**
- **Using cURL** (PowerShell on Windows, use `curl.exe`):
  ```bash
  curl.exe -X GET "http://localhost:9200/stream-chat/_search?pretty"
  ```
  You’ll get JSON hits for indexed messages.

## **Folder Contents**

| File                 | Description                                                                                       |
|----------------------|---------------------------------------------------------------------------------------------------|
| `.env`               | Environment variables (not committed to repo).                                                   |
| `server.js`          | Express server that handles `/stream-webhook` calls and indexes `message.new` events into ES.    |
| `sendTestMessage.mjs`| Script to create/send messages in Stream Chat (server side). Triggers the webhook upon success.  |
| `package.json`       | Project metadata and dependencies.                                                               |
| `README.md`          | This documentation.                                                                               |

## **Troubleshooting**

1. **Nothing logs in `server.js`**:
   - Make sure your webhook URL is public (using ngrok or a deployed server).
   - Confirm the path exactly matches `/stream-webhook` in your Stream dashboard.

2. **“Either client.connectUser wasn’t called…”**  
   - Ensure `STREAM_API_SECRET` is loaded (not `undefined`). The library uses server mode only if it finds a valid secret.

3. **“Either data.created_by or data.created_by_id must be provided…”**  
   - If you call `channel.create()` in server mode, include `created_by_id: 'tester'` (or similar) in the channel data object.

4. **PowerShell “parameter cannot be found ‘-X’”**  
   - Use `curl.exe` or run commands in Git Bash / WSL to properly handle cURL flags.

## **License & Contributing**

Feel free to clone and extend. For feature requests or bug reports, open an [issue](https://github.com/<YOUR_USERNAME>/stream-chat-elasticsearch/issues).

---

**Enjoy building your real-time, searchable chat!** If you found this helpful, consider starring the repo and sharing your feedback.
