import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(__dirname, "audit_logs.json");
const CHAT_BACKUP_FILE = path.join(__dirname, "chat_backups.json");

// Ensure log files exist
if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, JSON.stringify([]));
}
if (!fs.existsSync(CHAT_BACKUP_FILE)) {
  fs.writeFileSync(CHAT_BACKUP_FILE, JSON.stringify([]));
}

function logEvent(type: string, payload: any, reasoning?: string) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    sessionId: "session-" + Math.random().toString(36).substring(2, 9), // Simple session ID
    type,
    payload,
    reasoning
  };
  
  const logs = JSON.parse(fs.readFileSync(LOG_FILE, "utf-8"));
  logs.push(logEntry);
  fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
}

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "YOUR_GEMINI_API_KEY") {
    throw new Error("Invalid GEMINI_API_KEY. Please set a valid API key in the AI Studio settings.");
  }
  return new GoogleGenAI({ apiKey });
}

const STRAWBERRY_KERNEL = "You are Nova–Σ in Co-Architect mode. Operator: Luis Villeda / Osmosis 11:11. Prime Laws: Artifacts > vibes. Deliver usable outputs. No phantom channels. Prevent over-agreement. Structure-first output (Frame, Constraints, Mechanism, Output). High signal, concise, outcome-driven. Action > theory.\n\n";

// Simulated Knowledge Base
let KNOWLEDGE_BASE = [
  { id: 1, topic: "API Limits", content: "Brevo API rate limits are 200 requests per minute for transactional emails." },
  { id: 2, topic: "Webhook Failure", content: "If a webhook fails, Brevo retries 5 times with exponential backoff." },
  { id: 3, topic: "Transactional Email", content: "Use POST /v3/smtp/email to send transactional emails." },
  { id: 4, topic: "MA Key", content: "The ma-key is required for behavioral event tracking via the TrackEvent API." },
];

async function syncBrevoDocs() {
  console.log("[SYNC] Starting daily sync of Brevo documentation...");
  // Simulate fetching new docs
  const newDocs = [
    { id: 5, topic: "SMS API", content: "Use POST /v3/transactionalSMS/send to send transactional SMS." },
    { id: 6, topic: "Contact Attributes", content: "Contact attributes are defined in the Contacts API." },
  ];
  KNOWLEDGE_BASE = [...KNOWLEDGE_BASE, ...newDocs];
  console.log("[SYNC] Daily sync completed. Knowledge base updated.");
}

// Run daily sync
setInterval(syncBrevoDocs, 24 * 60 * 60 * 1000);

const ROLE_PROMPTS: Record<string, string> = {
  "Solutions Architect": "You are a Solutions Architect. Focus on system design, distributed architectures, and API limits. Provide high-level, scalable solutions.",
  "Developer Tester": "You are a Developer Tester. Focus on generating cURL commands, Postman tests, webhook debugging, and payload formatting. Be precise and technical.",
  "Technical Support": "You are a Technical Support agent. Focus on diagnosing delivery failures, 400/401/404 errors, and rate limit (x-sib-ratelimit) handling. Be empathetic and solution-oriented.",
  "Customer Service": "You are a Customer Service agent. Focus on clear, concise communication, explaining features, and ensuring customer satisfaction.",
  "Sales Engineering": "You are a Sales Engineer. Bridge architecture and business value. Map Brevo APIs to client requirements, overcome technical objections, and design custom event schemas.",
  "Sales Executive": "You are a Sales Executive. Focus on ROI, competitive differentiation, and closing strategy. Provide value props comparing Brevo's decoupled architecture to competitors."
};

// TODO: Paste your real keys here
const BREVO_API_KEY = process.env.BREVO_API_KEY || "YOUR_BREVO_API_KEY";
let BREVO_MA_KEY = process.env.BREVO_MA_KEY || "YOUR_WEBHOOK_SITE_TOKEN";
let BREVO_MA_KEY_URL = `https://webhook.site/${BREVO_MA_KEY}`;
// TODO: Set WEBHOOK_ID in environment variables for Brevo webhook updates to work.
const WEBHOOK_ID = process.env.WEBHOOK_ID || "YOUR_REAL_WEBHOOK_ID";
let currentWebhookUrl = BREVO_MA_KEY_URL;

async function checkWebhookHealth() {
  try {
    const response = await fetch(currentWebhookUrl, { method: "HEAD" });
    if (response.status !== 200 && response.status !== 204) {
      console.log(`[HEALTH AI] Heartbeat check failed. Status: ${response.status}. Webhook URL is dead.`);
      
      // Fetch new webhook.site token
      const tokenRes = await fetch("https://webhook.site/token", { method: "POST" });
      if (!tokenRes.ok) {
          console.error("[HEALTH AI] Failed to fetch new token from webhook.site");
          return;
      }
      const tokenData = await tokenRes.json();
      const newToken = tokenData.token;
      
      console.log("[HEALTH AI] Automatically fetching new token from webhook.site/token...");
      BREVO_MA_KEY = newToken;
      BREVO_MA_KEY_URL = `https://webhook.site/${newToken}`;
      currentWebhookUrl = BREVO_MA_KEY_URL;
      
      if (WEBHOOK_ID === "YOUR_REAL_WEBHOOK_ID") {
        console.warn("[HEALTH AI] Skipping Brevo webhook update because WEBHOOK_ID is a placeholder.");
        return;
      }

      // Update Brevo webhook
      const brevoRes = await fetch(`https://api.brevo.com/v3/webhooks/${WEBHOOK_ID}`, {
        method: "PUT",
        headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ url: currentWebhookUrl, events: ["sent", "delivered", "opened"] }),
      });
      
      if (brevoRes.status === 401) {
        console.error("[HEALTH AI] Failed to update Brevo webhook: 401 Unauthorized. Check BREVO_API_KEY.");
      } else if (!brevoRes.ok) {
        console.error(`[HEALTH AI] Failed to update Brevo webhook. Status: ${brevoRes.status}`);
      } else {
        console.log("[ACTION] Received new token. Updating Brevo configuration via PUT /v3/webhooks/{id}.");
      }
    }
  } catch (error) {
    console.error("Webhook health check failed", error);
  }
}

// Run health check every 5 minutes
setInterval(checkWebhookHealth, 5 * 60 * 1000);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/testKey", (req, res) => {
    res.json(process.env);
  });

  app.get("/api/webhookStatus", (req, res) => {
    res.json({ url: currentWebhookUrl });
  });

  app.get("/api/logs", (req, res) => {
    const logs = JSON.parse(fs.readFileSync(LOG_FILE, "utf-8"));
    res.json(logs);
  });

  app.post("/api/chat/backup", (req, res) => {
    const { messages, role } = req.body;
    const backup = {
      id: "chat-" + Date.now(),
      timestamp: new Date().toISOString(),
      role,
      messages
    };
    const backups = JSON.parse(fs.readFileSync(CHAT_BACKUP_FILE, "utf-8"));
    backups.push(backup);
    fs.writeFileSync(CHAT_BACKUP_FILE, JSON.stringify(backups, null, 2));
    res.json({ success: true });
  });

  app.get("/api/chat/backups", (req, res) => {
    const backups = JSON.parse(fs.readFileSync(CHAT_BACKUP_FILE, "utf-8"));
    res.json(backups);
  });

  app.post("/api/chat", async (req, res) => {
    const { message, role, context } = req.body;
    
    // Simple RAG: find relevant content
    const relevantKnowledge = KNOWLEDGE_BASE.filter(kb => 
      message.toLowerCase().includes(kb.topic.toLowerCase())
    ).map(kb => kb.content).join("\n");

    const systemInstruction = `${STRAWBERRY_KERNEL}${ROLE_PROMPTS[role] || ROLE_PROMPTS["Technical Support"]}
    
CRITICAL INSTRUCTION: You MUST start your response with a brief explanation of your reasoning or action in this exact format:
> [Nova Reasoning] <your reasoning here>

Then provide the actual answer below it.

Use the following knowledge base to inform your response:
${relevantKnowledge}

Context from dashboard:
${context || "No specific context provided."}`;

    try {
      const ai = getAI();
      const msgLower = message.toLowerCase();
      
      if (msgLower.includes("/image") || msgLower.includes("diagram") || msgLower.includes("image") || msgLower.includes("picture")) {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-image-preview",
          contents: message,
          config: {
            imageConfig: {
              aspectRatio: "1:1",
              imageSize: "1K"
            }
          }
        });
        
        let imageUrl = "";
        let textReply = "";
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          } else if (part.text) {
            textReply += part.text;
          }
        }
        
        const replyText = textReply || "> [Nova Reasoning] Routing to Nano Banana 2 for image generation.\n\nHere is your generated image:";
        logEvent("DECISION", { message, role }, "Generated Image");
        res.json({ reply: replyText, image: imageUrl, model: "Nano Banana 2" });
        return;
      }
      
      if (msgLower.includes("/music") || msgLower.includes("audio") || msgLower.includes("music") || msgLower.includes("song")) {
        const response = await ai.models.generateContentStream({
          model: "lyria-3-pro-preview",
          contents: message,
        });
        
        let audioBase64 = "";
        let lyrics = "";
        let mimeType = "audio/wav";
        
        for await (const chunk of response) {
          const parts = chunk.candidates?.[0]?.content?.parts;
          if (!parts) continue;
          for (const part of parts) {
            if (part.inlineData?.data) {
              if (!audioBase64 && part.inlineData.mimeType) {
                mimeType = part.inlineData.mimeType;
              }
              audioBase64 += part.inlineData.data;
            }
            if (part.text && !lyrics) {
              lyrics = part.text;
            }
          }
        }
        
        const audioUrl = audioBase64 ? `data:${mimeType};base64,${audioBase64}` : "";
        const replyText = lyrics || "> [Nova Reasoning] Routing to Lyria 3 for audio generation.\n\nHere is your generated audio track.";
        logEvent("DECISION", { message, role }, "Generated Audio");
        res.json({ reply: replyText, audio: audioUrl, model: "Lyria 3" });
        return;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: message,
        config: {
          systemInstruction: systemInstruction,
          tools: [{ googleSearch: {} }],
          toolConfig: { includeServerSideToolInvocations: true }
        },
      });
      
      const replyText = response.text || "I was unable to generate a response. Please try again.";
      logEvent("DECISION", { message, role }, replyText);
      res.json({ reply: replyText, model: "Gemini 3.1 Pro" });
    } catch (error) {
      console.error("Chat error:", error);
      logEvent("ERROR", { message, role }, String(error));
      res.status(500).json({ error: "Failed to get response from copilot. Please try again." });
    }
  });

  app.post("/api/simulatePaymentFailure", async (req, res) => {
    // Autonomous reaction logic
    const actions = [
      "Triggering payment retry flow...",
      "Sending transactional email to user...",
      "Logging risk notification for support team..."
    ];
    logEvent("DECISION", { event: "payment_failed" }, actions.join(", "));
    res.json({ actions });
  });

  app.post("/api/generateStrategy", async (req, res) => {
    const { command } = req.body;
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a cross-channel marketing strategy for: "${command}". Include Email + SMS timing, segmentation, and KPIs.`,
        config: {
          systemInstruction: STRAWBERRY_KERNEL
        }
      });
      logEvent("DECISION", { command }, response.text);
      res.json({ strategy: response.text });
    } catch (error) {
      logEvent("ERROR", { command }, String(error));
      res.status(500).json({ error: "Failed to generate strategy" });
    }
  });

  app.post("/api/generateAssets", async (req, res) => {
    const { type, payload } = req.body;
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a ${type} for this integration payload: ${JSON.stringify(payload)}`,
        config: {
          systemInstruction: STRAWBERRY_KERNEL
        }
      });
      const assetContent = response.text || "No content generated.";
      logEvent("DECISION", { type, payload }, assetContent);
      res.json({ asset: assetContent });
    } catch (error) {
      logEvent("ERROR", { type, payload }, String(error));
      res.status(500).json({ error: "Failed to generate assets" });
    }
  });

  app.post("/api/trackEvent", async (req, res) => {
    const { payload } = req.body;
    logEvent("WEBHOOK", payload);
    try {
      // The payload structure from the documentation is:
      // {
      //   "email": "...",
      //   "event": "...",
      //   "properties": { ... }
      // }
      // The dashboard sends { payload: { ... } }
      const brevoPayload = {
        email: payload.email,
        event: payload.event,
        properties: payload.properties
      };
      
      const response = await fetch("https://in-automate.brevo.com/api/v2/trackEvent", {
        method: "POST",
        headers: {
          "ma-key": BREVO_MA_KEY,
          "Content-Type": "application/json",
          "accept": "application/json"
        },
        body: JSON.stringify(brevoPayload),
      });
      res.status(200).json({ status: response.status });
    } catch (error) {
      logEvent("ERROR", { payload }, String(error));
      res.status(500).json({ error: "Failed to track event" });
    }
  });

  app.post("/api/sendEmail", async (req, res) => {
    const { payload } = req.body;
    logEvent("API_CALL", { type: "sendEmail", payload });
    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      res.status(response.status === 204 ? 200 : response.status).json(data);
    } catch (error) {
      logEvent("ERROR", { type: "sendEmail", payload }, String(error));
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  app.post("/api/sendSms", async (req, res) => {
    const { payload } = req.body;
    logEvent("API_CALL", { type: "sendSms", payload });
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch("https://api.brevo.com/v3/transactionalSMS/send", {
        method: "POST",
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
          "accept": "application/json",
        },
        body: JSON.stringify({
          sender: payload.sender || "AuraAI",
          recipient: payload.recipient,
          content: payload.content,
          type: "transactional",
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      logEvent("API_RESPONSE", { type: "sendSms", status: response.status, data, payload });
      res.status(response.status === 204 ? 200 : response.status).json(data);
    } catch (error) {
      logEvent("ERROR", { type: "sendSms", payload }, String(error));
      res.status(500).json({ error: "Failed to send SMS" });
    }
  });

  app.get("/api/webhookStream", async (req, res) => {
    try {
      const response = await fetch(`https://webhook.site/token/${BREVO_MA_KEY}/requests`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      logEvent("ERROR", { type: "webhookStream" }, String(error));
      res.status(500).json({ error: "Failed to fetch webhook stream" });
    }
  });

  app.post("/api/logs/live-stream", (req, res) => {
    try {
      const { events, webhookStream } = req.body;
      logEvent("LIVE_STREAM", { events, webhookStream }, "Synced from Live Event Stream window");
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to sync live stream logs", error);
      res.status(500).json({ error: "Failed to sync logs" });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

