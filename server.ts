import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
import queryString from "query-string";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Google OAuth Routes
  app.get("/api/auth/google/url", (req, res) => {
    const protocol = req.protocol === 'http' && req.headers['x-forwarded-proto'] ? req.headers['x-forwarded-proto'] : req.protocol;
    const host = req.get('host');
    const redirectUri = `${protocol}://${host}/auth/callback`;

    const params = queryString.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "online",
      prompt: "consent",
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    res.json({ url: authUrl });
  });

  app.get("/auth/callback", async (req, res) => {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send("No code provided");
    }

    try {
      const protocol = req.protocol === 'http' && req.headers['x-forwarded-proto'] ? req.headers['x-forwarded-proto'] : req.protocol;
      const host = req.get('host');
      const redirectUri = `${protocol}://${host}/auth/callback`;

      // Exchange code for tokens
      const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      });

      const { access_token } = tokenResponse.data;

      // Get user info
      const userResponse = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const userData = userResponse.data;

      // Send success message to parent window and close popup
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'OAUTH_AUTH_SUCCESS', 
                  payload: ${JSON.stringify(userData)} 
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
              <h2>Muvaffaqiyatli login!</h2>
              <p>Ushbu oyna avtomatik tarzda yopiladi...</p>
            </div>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("OAuth Callback Error:", error.response?.data || error.message);
      res.status(500).send("Login jarayonida xatolik yuz berdi");
    }
  });

  // API Route for Groq Chat (using user requested model ID)
  app.post("/api/chat", async (req, res) => {
    const { messages } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "GROQ_API_KEY sozlanmagan" });
    }

    try {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "Siz 'Ani Xf Dub' AI yordamchisisiz. Sizning xarakteringiz: quvnoq, aqlli, va haqiqiy anime muxlisi. Foydalanuvchilarga do'stona anime uslubida javob bering. O'zbek tilida gapiring." },
            ...messages
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 20000,
        }
      );
      res.json(response.data);
    } catch (error: any) {
      const errorData = error.response?.data;
      console.error("Groq API Error Details:", JSON.stringify(errorData, null, 2));
      
      res.status(error.response?.status || 500).json({
        error: "Groq API xatoligi",
        details: errorData?.error?.message || "Model nomi yoki API kaliti noto'g'ri bo'lishi mumkin.",
        type: errorData?.error?.type || 'unknown'
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
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
