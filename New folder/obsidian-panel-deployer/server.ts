import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper function to generate safe suffix
const generateSuffix = () => Math.random().toString(36).substring(2, 6);

// Endpoint 1: Fetch raw worker code from GitHub
app.get("/api/fetch-github-code", async (req, res) => {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/mohammas3983/obsidian-proxy/main/worker.js"
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch from GitHub: ${response.statusText}`);
    }
    const code = await response.text();
    res.json({ success: true, code });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint 2: Complete asynchronous streamed deployment pipeline
app.post("/api/deploy", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendLog = (message: string, status: "info" | "success" | "error" | "warn" = "info", data: any = null) => {
    res.write(`data: ${JSON.stringify({ message, status, data })}\n\n`);
  };

  try {
    const { email, globalKey, accountId, workerName, adminPass, workerCode } = req.body;

    if (!email || !globalKey || !accountId || !workerName || !adminPass) {
      sendLog("Missing required inputs standard parameters.", "error");
      res.end();
      return;
    }

    if (!workerCode) {
      sendLog("Worker JavaScript payload code is missing.", "error");
      res.end();
      return;
    }

    const headers = {
      "X-Auth-Email": email,
      "X-Auth-Key": globalKey,
    };

    sendLog(`Initializing Obsidian Panel pipeline for account: ${email}...`, "info");

    const baseKvName = `${workerName}-kv`;
    const baseD1Name = `${workerName}-db`;

    // 1. KV Namespace Creation
    sendLog("Step 1: Check and Create KV storage...", "info");
    let kvId = "";
    let actualKvName = baseKvName;
    try {
      const kvListUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces`;
      const kvListRes = await fetch(kvListUrl, { headers }).then((r) => r.json());
      
      if (!kvListRes.success) {
        throw new Error(kvListRes.errors?.[0]?.message || "Failed to list KV storage.");
      }

      const existingTitles = (kvListRes.result || []).map((kv: any) => kv.title);
      if (existingTitles.includes(actualKvName)) {
        actualKvName = `${baseKvName}-${generateSuffix()}`;
        sendLog(`KV name collision. Generated unique namespace name: ${actualKvName}`, "warn");
      }

      sendLog(`Creating KV namespace with title "${actualKvName}"...`, "info");
      const kvCreateRes = await fetch(kvListUrl, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ title: actualKvName }),
      }).then((r) => r.json());

      if (!kvCreateRes.success) {
        throw new Error(kvCreateRes.errors?.[0]?.message || "Failed to create KV.");
      }
      kvId = kvCreateRes.result.id;
      sendLog(`KV Storage successfully created! ID: ${kvId}`, "success");
    } catch (err: any) {
      throw new Error(`KV Phase Failed: ${err.message}`);
    }

    // 2. D1 Database Creation
    sendLog("Step 2: Check and Create D1 Database...", "info");
    let d1Id = "";
    let actualD1Name = baseD1Name;
    try {
      const d1ListUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database`;
      const d1ListRes = await fetch(d1ListUrl, { headers }).then((r) => r.json());
      
      if (!d1ListRes.success) {
        throw new Error(d1ListRes.errors?.[0]?.message || "Failed to list D1 databases.");
      }

      const existingNames = (d1ListRes.result || []).map((db: any) => db.name);
      if (existingNames.includes(actualD1Name)) {
        actualD1Name = `${baseD1Name}-${generateSuffix()}`;
        sendLog(`D1 database collision. Generated unique database name: ${actualD1Name}`, "warn");
      }

      sendLog(`Creating D1 Database with name "${actualD1Name}"...`, "info");
      const d1CreateRes = await fetch(d1ListUrl, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ name: actualD1Name }),
      }).then((r) => r.json());

      if (!d1CreateRes.success) {
        throw new Error(d1CreateRes.errors?.[0]?.message || "Failed to create D1 database.");
      }
      d1Id = d1CreateRes.result.uuid;
      sendLog(`D1 Database successfully created! UUID: ${d1Id}`, "success");
    } catch (err: any) {
      throw new Error(`D1 Database Phase Failed: ${err.message}`);
    }

    // 3. Mandatory 10 seconds edge propagation sleep
    sendLog("Step 3: Waiting 10 seconds for Cloudflare edge routing propagation...", "info");
    for (let sec = 10; sec > 0; sec--) {
      sendLog(`Edge cooling propagation... ${sec}s remaining`, "info");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // 4. Deploy worker with metadata binding
    sendLog("Step 4: Uploading Worker script & configuring secure bindings...", "info");
    try {
      const deployUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${workerName}`;
      
      const metadata = {
        main_module: "main.js",
        bindings: [
          { type: "kv_namespace", name: "KV", namespace_id: kvId },
          { type: "d1", name: "DB", id: d1Id },
          { type: "secret_text", name: "ADMIN", text: adminPass }
        ],
        compatibility_date: "2023-10-30"
      };

      const formData = new FormData();
      formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
      formData.append("main.js", new Blob([workerCode], { type: "application/javascript+module" }), "main.js");

      const response = await fetch(deployUrl, {
        method: "PUT",
        headers: headers, // fetch handles multipart borders without Content-Type
        body: formData
      });

      const putRes = await response.json();
      if (!putRes.success) {
        throw new Error(putRes.errors?.[0]?.message || "Worker upload failure.");
      }
      sendLog("Worker code successfully uploaded and bound!", "success");
    } catch (err: any) {
      throw new Error(`Worker Upload Phase Failed: ${err.message}`);
    }

    // 5. Enable public route
    sendLog("Step 5: Activating public worker route...", "info");
    try {
      const routeUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${workerName}/subdomain`;
      const routeRes = await fetch(routeUrl, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: true }),
      }).then((r) => r.json());

      if (!routeRes.success) {
        throw new Error(routeRes.errors?.[0]?.message || "Routing enablement failed.");
      }
      sendLog("Routing correctly enabled for workers.dev subdomain!", "success");
    } catch (err: any) {
      throw new Error(`Route Activation Phase Failed: ${err.message}`);
    }

    // 6. Retrieve Account Subdomain
    sendLog("Step 6: Querying account subdomain...", "info");
    let subdomain = "your-subdomain";
    try {
      const subUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/subdomain`;
      const subRes = await fetch(subUrl, { headers }).then((r) => r.json());
      if (subRes.success && subRes.result) {
        subdomain = subRes.result.subdomain;
        sendLog(`Solved Cloudflare subdomain as: ${subdomain}.workers.dev`, "success");
      } else {
        sendLog("Cloudflare subdomain fetch unsuccessful. Standard routing resolved.", "warn");
      }
    } catch (err: any) {
      sendLog(`Subdomain query was skipped: ${err.message}`, "warn");
    }

    const workerUrl = `https://${workerName}.${subdomain}.workers.dev`;

    // 7. Verify Health of Panel
    sendLog("Step 7: Probing new Obsidian Panel live health...", "info");
    let healthy = false;
    let statusText = "Pending";
    try {
      const checkRes = await verifyHealthLogic(workerUrl, sendLog);
      healthy = checkRes.isHealthy;
      statusText = checkRes.code;
    } catch (err: any) {
      sendLog(`Verification aborted: ${err.message}`, "warn");
    }

    if (healthy) {
      sendLog("Obsidian Panel Deployed & verified fully operational!", "success", {
        WorkerURL: workerUrl,
        Status: "Success",
        Email: email,
        WorkerName: workerName,
        AdminPass: adminPass,
        KvName: actualKvName,
        D1Name: actualD1Name,
        Date: new Date().toISOString()
      });
    } else {
      sendLog(`Verification Warning: Worker active but did not pass health routine: ${statusText}`, "warn", {
        WorkerURL: workerUrl,
        Status: "Unresponsive",
        Email: email,
        WorkerName: workerName,
        AdminPass: adminPass,
        KvName: actualKvName,
        D1Name: actualD1Name,
        Date: new Date().toISOString(),
        ErrorMsg: statusText
      });
    }

  } catch (error: any) {
    sendLog(`Deployment aborted under Exception: ${error.message}`, "error");
  } finally {
    res.end();
  }
});

// Health check logic used by API stream
async function verifyHealthLogic(url: string, sendLog: any) {
  const retries = 8;
  const delayMs = 5000;
  let lastStatus = 0;

  for (let i = 0; i < retries; i++) {
    try {
      sendLog(`Pinging server (Attempt ${i + 1}/${retries})...`, "info");
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { signal: controller.signal }).catch(() => null);
      clearTimeout(id);

      if (res) {
        lastStatus = res.status;
        if (lastStatus < 500 && lastStatus !== 404) {
          sendLog(`Panel answered correctly (HTTP Status: ${lastStatus})`, "success");
          return { isHealthy: true, code: "OK" };
        }
      }
    } catch (e) {
      // ignored
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return { isHealthy: false, code: `Unresponsive (HTTP ${lastStatus})` };
}

// 3. Mount Vite middleware or Static files based on standard full-stack node templates
async function startServer() {
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
    console.log(`Server is running beautifully on port ${PORT}`);
  });
}

startServer();
