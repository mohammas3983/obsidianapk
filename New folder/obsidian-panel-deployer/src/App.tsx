import React, { useState, useEffect, useRef } from "react";
import { 
  Cloud, 
  Database, 
  Layers, 
  Terminal, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Trash2, 
  Smartphone, 
  FileCode, 
  Clock, 
  User, 
  Key, 
  ShieldAlert,
  Server,
  Languages,
  Sun,
  Moon,
  Github,
  Send,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { fletPythonCode } from "./fletSource";

interface DeploymentAsset {
  date: string;
  email: string;
  name: string;
  admin_pass: string;
  status: string;
  url: string;
  kv: string;
  db: string;
  global_key?: string;
  account_id?: string;
  errorMsg?: string;
}

const TRANSLATIONS = {
  fa: {
    title: "راه‌انداز ابری پنل اوبسیدین",
    subtitle: "اتوماسیون تخصصی ورکرها، دیتابیس D1 و کش KV کلودفلر",
    themeToggle: "تغییر پوسته",
    langToggle: "English / انگلیسی",
    demoBtn: "جایگذاری اطلاعات دمو",
    cfConsole: "کنسول کلودفلر",
    mobilePipe: "پایپ‌لاین معماری موبایل",
    deployTab: "استقرار پنل جدید",
    historyTab: "تاریخچه استقرار",
    emailLbl: "ایمیل حساب کلودفلر",
    emailPlh: "مثال: name@domain.ir",
    apiKeyLbl: "کلید عمومی (Global API Key)",
    apiKeyPlh: "مثال: e527b1ee6610...",
    apiModeLbl: "حالت نمایش کلید فعال است",
    accountIdLbl: "شناسه حساب (Account ID)",
    accountIdPlh: "مثال: 6c8f8510ad6...",
    workerLbl: "نام ورکر سرویس جدید",
    adminLbl: "رمز عبور ادمین پنل اوبسیدین",
    adminPlh: "مثال: 12345678",
    progressTitle: "لاگ پیشرفت عملیات و ساخت دیتابیس",
    readyMsg: "آماده برای شروع عملیات",
    deployingMsg: "در حال پیکربندی و ساخت منابع کلودفلر...",
    deployBtn: "استقرار و کانفیگ اوبسیدین",
    successTitle: "🎉 استقرار با موفقیت انجام شد!",
    successDesc: "پنل اوبسیدین شما آماده استفاده است. مشخصات فنی:",
    reportUrl: "🌐 آدرس پنل:",
    reportEmail: "📧 ایمیل کلودفلر:",
    reportPass: "🔑 رمز ادمین:",
    reportApiKey: "🛡️ کلید عمومی کلودفلر:",
    reportAccount: "🆔 شناسه حساب:",
    reportKv: "📦 نام کش KV:",
    reportD1: "📂 دیتابیس D1:",
    reportDate: "⏱️ زمان استقرار:",
    copyReport: "کپی کل مشخصات فنی",
    copiedMsg: "کل متن گزارش با موفقیت کپی شد!",
    shareTelegram: "ارسال به تلگرام",
    shareWhatsapp: "ارسال به واتساپ",
    devTitle: "مشخصات سازنده و توسعه‌دهنده رسمی:",
    devName: "محمدصادق قاسمی",
    devTelegramId: "@obsidian347",
    noHistory: "هیچ تاریخچه‌ای ثبت نشده است",
    noHistoryDesc: "تاریخچه سرویس‌های ساخته شده روی مرورگر شما ذخیره خواهند شد.",
    clearHistory: "پاکسازی تاریخچه",
    clearHistoryConfirm: "آیا مطمئن هستید که می‌خواهید تمام تاریخچه محلی را حذف کنید؟",
    historyCleared: "تاریخچه محلی با موفقیت پاکسازی شد.",
    stepTitle: "چگونه به فایل APK اندروید خروجی بگیریم؟",
    step1Title: "مرحله ۱: نصب خودکار پیش‌نیازها",
    step1Desc: "سورس پایتون مجهز به لودر هوشمند خودکار است! بدون نیاز به زدن دستور مجزا، در اولین اجرا پیش‌نیازهای Flet و HTTPX نصب می‌شوند.",
    step2Title: "مرحله ۲: برنامه پایتون را ذخیره کنید",
    step2Desc: "کد پایتون Flet سمت راست را کپی کرده و در فایلی به نام main.py ذخیره کنید.",
    step3Title: "مرحله ۳: اجرای آزمایشی",
    step3Desc: "برنامه را روی سیستم خود به صورت محلی دسکتاپ اجرا و بررسی کنید:",
    step4Title: "مرحله ۴: خروجی APK گوشی اندروید",
    step4Desc: "با استفاده از مرورگر ترمینال flet خروجی APK نهایی را کامپایل کنید:",
    importantNote: "نکات امنیتی و بایندینگ‌های کلودفلر (محفوظ):",
    bindingMsg1: "نام بایندینگ‌ها را تغییر ندهید:",
    bindingMsg1Body: "بایندینگ‌ها در سورس کد وب‌سایت اوبسیدین دقیقاً روی نام‌های 'KV'، 'DB' و 'ADMIN' ست شده‌اند.",
    bindingMsg2: "تاخیر ۱۰ ثانیه‌ای edge:",
    bindingMsg2Body: "این تاخیر الزامی است تا کلودفلر متادیتا و نیم‌اسپیس‌ها را به طور کامل همگام بکند.",
    fletTitle: "کدنویسی آسنکرون Flet برای خروجی موبایل اوبسیدین",
    fletDesc: "کلاینت بهینه‌سازی شده با پروتکل مدیریت خطای چندمنظوره"
  },
  en: {
    title: "Obsidian Cloud Deployer",
    subtitle: "Cloudflare Workers, D1 Database, and KV Automation Suite",
    themeToggle: "Theme Toggle",
    langToggle: "Farsi / فارسی",
    demoBtn: "Populate Demo Keys",
    cfConsole: "Cloudflare Console",
    mobilePipe: "Mobile Architecture Pipeline",
    deployTab: "Deploy Panel",
    historyTab: "Deploy History",
    emailLbl: "Cloudflare Account Email",
    emailPlh: "e.g. name@domain.com",
    apiKeyLbl: "Global API Key",
    apiKeyPlh: "e.g. e527b1ee6610...",
    apiModeLbl: "Key verification mode active",
    accountIdLbl: "Cloudflare Account ID",
    accountIdPlh: "e.g. 6c8f8510ad6...",
    workerLbl: "Worker Service Name",
    adminLbl: "Obsidian Panel Admin Password",
    adminPlh: "e.g. 12345678",
    progressTitle: "Live Progress & Build Logger",
    readyMsg: "Ready to Deploy",
    deployingMsg: "Building database & storage assets...",
    deployBtn: "Deploy Obsidian Panel",
    successTitle: "🎉 Deployment Successful!",
    successDesc: "Your Obsidian Panel has been provisioned. Technical specs:",
    reportUrl: "🌐 Panel Address:",
    reportEmail: "📧 CF Account Email:",
    reportPass: "🔑 Admin Key:",
    reportApiKey: "🛡️ Account Global API Key:",
    reportAccount: "🆔 Account ID:",
    reportKv: "📦 KV Workspace Name:",
    reportD1: "📂 D1 DB binding UUID:",
    reportDate: "⏱️ Creation Date:",
    copyReport: "Copy Deployment Info",
    copiedMsg: "Deployment report copied to clipboard successfully!",
    shareTelegram: "Share on Telegram",
    shareWhatsapp: "Share on WhatsApp",
    devTitle: "Official Creator Specifications:",
    devName: "MohammadSadegh Ghasemi",
    devTelegramId: "@obsidian347",
    noHistory: "No active assets registered",
    noHistoryDesc: "Your Cloudflare deployed Obsidian Panel addresses will be logged here autonomously.",
    clearHistory: "Clear records",
    clearHistoryConfirm: "Are you sure you want to clear all deploy logs from local storage?",
    historyCleared: "History cleared successfully.",
    stepTitle: "How to compile into Android Mobile (APK):",
    step1Title: "Step 1: Auto-Install Prerequisites",
    step1Desc: "The exported Python program is equipped with an intelligent self-installer! All dependencies (Flet, HTTPX) are resolved automatically on first run.",
    step2Title: "Step 2: Write your main.py",
    step2Desc: "Copy the full python Flet source code from this panel and write it into a local main.py file.",
    step3Title: "Step 3: Boot locally",
    step3Desc: "Run the desktop window version locally to test features:",
    step4Title: "Step 4: Compile to Android APK",
    step4Desc: "Convert the python script to a standalone mobile package using normal Flet CLI compiler tools:",
    importantNote: "Crucial Cloudflare Binding Requirements (Preserved):",
    bindingMsg1: "Never alter binding names:",
    bindingMsg1Body: "Cloudflare bindings are hardcoded to 'KV', 'DB', and 'ADMIN'.",
    bindingMsg2: "Mandatory Edge cooling block:",
    bindingMsg2Body: "10 second delay allows Edge routers to propagate database metadata globally.",
    fletTitle: "Flet main.py (Asynchronous Event-Driven Code)",
    fletDesc: "Asynchronous HTTPX Client optimized with multi-mode logging"
  }
};

export default function App() {
  // Localization & Themes
  const [lang, setLang] = useState<"fa" | "en">("fa");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Navigation State
  const [activeTab, setActiveTab] = useState<"deploy" | "assets">("deploy");

  // Form Inputs
  const [email, setEmail] = useState("");
  const [globalKey, setGlobalKey] = useState("");
  const [accountId, setAccountId] = useState("");
  const [workerName, setWorkerName] = useState("obsidian-panel");
  const [adminPass, setAdminPass] = useState("");
  const [showAdminPass, setShowAdminPass] = useState(false);

  // Logs and Deploy Status
  const [logs, setLogs] = useState<{ message: string; status: "info" | "success" | "error" | "warn" }[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [liveStatus, setLiveStatus] = useState("Ready to Deploy");
  const [progressPercent, setProgressPercent] = useState(0);

  // Local Deployed History
  const [deployedAssets, setDeployedAssets] = useState<DeploymentAsset[]>([]);
  const [activeToast, setActiveToast] = useState<{ message: string; type: "success" | "error" | "info" | "warn" } | null>(null);
  
  // Successful Report Modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState<DeploymentAsset | null>(null);

  // Python Exporter state
  const [copiedFlet, setCopiedFlet] = useState(false);
  const [copiedApkCmd, setCopiedApkCmd] = useState(false);

  // Auto Scroll ref for logs
  const logTerminalEndRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang];
  const isRtl = lang === "fa";

  // Initializing history storage
  useEffect(() => {
    const saved = localStorage.getItem("obsidian_assets");
    if (saved) {
      try {
        setDeployedAssets(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse obsidian_assets", e);
      }
    }
  }, []);

  // Update logs scroll to bottom
  useEffect(() => {
    if (logTerminalEndRef.current) {
      logTerminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const triggerToast = (message: string, type: "success" | "error" | "info" | "warn" = "success") => {
    setActiveToast({ message, type });
    setTimeout(() => setActiveToast(null), 4000);
  };

  const handleCopyFletCode = () => {
    navigator.clipboard.writeText(fletPythonCode);
    setCopiedFlet(true);
    triggerToast(lang === "fa" ? "سورس کد پایتون با موفقیت کپی شد!" : "Flet source code copied to clipboard!", "success");
    setTimeout(() => setCopiedFlet(false), 2000);
  };

  const handleCopyApkCmd = () => {
    navigator.clipboard.writeText("flet build apk");
    setCopiedApkCmd(true);
    triggerToast("flet build apk 📋", "success");
    setTimeout(() => setCopiedApkCmd(false), 2000);
  };

  const clearHistory = () => {
    if (window.confirm(t.clearHistoryConfirm)) {
      localStorage.removeItem("obsidian_assets");
      setDeployedAssets([]);
      triggerToast(t.historyCleared, "info");
    }
  };

  const buildReportString = (data: DeploymentAsset) => {
    return (
      `${t.successTitle}\n\n` +
      `${t.reportUrl} ${data.url}\n` +
      `${t.reportEmail} ${data.email}\n` +
      `${t.reportPass} ${data.admin_pass}\n` +
      `${t.reportApiKey} ${data.global_key || globalKey || '-'}\n` +
      `${t.reportAccount} ${data.account_id || accountId || '-'}\n` +
      `${t.reportKv} ${data.kv}\n` +
      `${t.reportD1} ${data.db}\n` +
      `${t.reportDate} ${data.date}\n\n` +
      `💻 ${t.footer_signature || 'Developed by mohammas3983'}\n` +
      `✈️ Telegram: @obsidian347\n` +
      `🔗 GitHub: https://github.com/mohammas3983`
    );
  };

  const copyDetailedReport = (data: DeploymentAsset) => {
    const text = buildReportString(data);
    navigator.clipboard.writeText(text);
    triggerToast(t.copiedMsg, "success");
  };

  const shareToTelegram = (data: DeploymentAsset) => {
    const text = buildReportString(data);
    const link = `https://t.me/share/url?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(text)}`;
    window.open(link, "_blank");
  };

  const shareToWhatsapp = (data: DeploymentAsset) => {
    const text = buildReportString(data);
    const link = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(link, "_blank");
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !globalKey || !accountId || !workerName || !adminPass) {
      triggerToast(t.toast_fill_all, "error");
      return;
    }

    setIsDeploying(true);
    setProgressPercent(5);
    setLogs([]);
    setLiveStatus(lang === "fa" ? "در حال دریافت کد اصلی پنل..." : "Fetching code from GitHub...");

    const addLog = (message: string, status: "info" | "success" | "error" | "warn") => {
      setLogs((prev) => [...prev, { message, status }]);
    };

    try {
      // 1. Fetch worker code OTA from GitHub asynchronously
      addLog(lang === "fa" ? "مرحله ۱: دریافت امن فایل جاوااسکریپت از گیت‌هاب اوبسیدین..." : "Fetching OTA: worker.js raw content from GitHub proxy...", "info");
      const codeResp = await fetch("/api/fetch-github-code");
      if (!codeResp.ok) {
        throw new Error(lang === "fa" ? "دریافت فایل معتبر متوقف شد. اینترنت سرور را بررسی کنید." : `Failed to download worker.js source from GitHub repository.`);
      }
      const codeData = await codeResp.json();
      if (!codeData.success) {
        throw new Error(codeData.error || "GitHub code fetch error response.");
      }
      setProgressPercent(15);
      addLog(lang === "fa" ? "فایل خام ورکر با موفقیت دریافت و آماده‌سازی شد!" : "Latest source code loaded securely!", "success");

      // 2. Begin server-side structured streaming pipeline setup
      addLog(lang === "fa" ? "مرحله ۲: شروع تعامل با ورکر ارکستریشن و ساخت منابع کلودفلر..." : "Contacting deployment orchestration engine...", "info");
      setLiveStatus(lang === "fa" ? "در حال استارت اتصالات و ساخت پایگاه داده..." : "Starting Cloudflare database/storage build...");
      setProgressPercent(25);

      const deployResp = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          globalKey,
          accountId,
          workerName,
          adminPass,
          workerCode: codeData.code,
        }),
      });

      if (!deployResp.body) {
        throw new Error("Failure creating API request readable stream channel.");
      }

      const reader = deployResp.body.getReader();
      const decoder = new TextDecoder();
      let streamResult = "";

      // Step percentages dictionary for updates
      const stepProgMap: Record<string, number> = {
        "Step 1": 35,
        "Step 2": 50,
        "Step 3": 65,
        "Step 4": 80,
        "Step 5": 88,
        "Step 6": 92,
        "Step 7": 96,
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        streamResult += chunk;

        const lines = streamResult.split("\n");
        // Keep the last partial line in cache
        streamResult = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const payload = JSON.parse(line.substring(6));
              const { message, status, data } = payload;
              addLog(message, status);
              setLiveStatus(message);

              // Update progress bar
              Object.keys(stepProgMap).forEach((key) => {
                if (message.includes(key)) {
                  setProgressPercent(stepProgMap[key]);
                }
              });

              // Complete event status update
              if (data) {
                const newAsset: DeploymentAsset = {
                  date: data.Date || new Date().toLocaleString(),
                  email: data.Email,
                  name: data.WorkerName,
                  admin_pass: data.AdminPass,
                  status: data.Status,
                  url: data.WorkerURL,
                  kv: data.KvName || `${data.WorkerName}-kv`,
                  db: data.D1Name || `${data.WorkerName}-db`,
                  global_key: globalKey,
                  account_id: accountId,
                  errorMsg: data.ErrorMsg,
                };

                // Append and save to localStorage
                setDeployedAssets((prev) => {
                  const updated = [newAsset, ...prev];
                  localStorage.setItem("obsidian_assets", JSON.stringify(updated));
                  return updated;
                });

                if (data.Status === "Success") {
                  setProgressPercent(100);
                  setReportData(newAsset);
                  setShowReportModal(true);
                  triggerToast(lang === "fa" ? "با موفقیت انجام شد!" : "Obsidian Panel Deployed Successfully!", "success");
                } else {
                  triggerToast(lang === "fa" ? "ورکر آپلود شد مانیتور ناقص ماند" : "Worker deployed but warning on health check.", "warn");
                }
              }
            } catch (err) {
              // Failed to parse line, skip
            }
          }
        }
      }

    } catch (error: any) {
      addLog(`Error Occurred: ${error.message}`, "error");
      setLiveStatus("Deployment aborted.");
      triggerToast(error.message || "Failed to complete deployment.", "error");
    } finally {
      setIsDeploying(false);
    }
  };

  // Populate sample config with user email
  const populateQuickDemo = () => {
    setEmail("iran.solid2019@gmail.com");
    setGlobalKey("e527b1ee66107386d4e112cb9ca7c50a1b942");
    setAccountId("66f8510ad6da0857321e1d092d603673");
    setWorkerName("obsidian-panel");
    setAdminPass("789456123");
    triggerToast(lang === "fa" ? "مشخصات تستی دمو با موفقیت لود شدند" : "Demo parameters populated successfully!", "info");
  };

  return (
    <div 
      id="obsidian_dashboard_app" 
      dir={isRtl ? "rtl" : "ltr"}
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        isDarkMode ? "bg-[#070b13] text-slate-100" : "bg-slate-50 text-slate-800"
      }`}
    >
      
      {/* Dynamic Toast Alerts */}
      {activeToast && (
        <div 
          id="system_info_toast"
          className={`fixed top-6 left-6 right-auto sm:left-auto sm:right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border text-sm max-w-sm animate-bounce ${
            activeToast.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" 
              : activeToast.type === "error" 
              ? "bg-rose-500/10 border-rose-500/20 text-rose-300"
              : activeToast.type === "warn"
              ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
              : "bg-indigo-500/10 border-indigo-500/20 text-indigo-300"
          }`}
        >
          {activeToast.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
          {activeToast.type === "error" && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          {activeToast.type === "warn" && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />}
          {activeToast.type === "info" && <Layers className="w-5 h-5 text-indigo-400 shrink-0" />}
          <p className="font-semibold">{activeToast.message}</p>
        </div>
      )}

      {/* Successful Deployment Report Modal Overlay */}
      {showReportModal && reportData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl rounded-3xl p-6 md:p-8 border shadow-2xl ${
            isDarkMode ? "bg-[#0f172a] border-[#1e293b]" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                  <Sparkles className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{t.successTitle}</h3>
                  <p className="text-xs text-slate-400 mt-1">{t.successDesc}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowReportModal(false)}
                className="p-1 px-3 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 text-sm font-bold cursor-pointer transition-all"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-3 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">{lang === "fa" ? "آدرس نهایی ورکر فعال" : "Live Worker URL"}</span>
                  <a href={reportData.url} target="_blank" rel="noreferrer" className="text-sm text-indigo-400 font-bold hover:underline breakdown-all flex items-center gap-1.5 mt-1">
                    {reportData.url}
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>

                <div className="p-3 bg-red-500/5 rounded-2xl border border-red-500/10">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">{lang === "fa" ? "کلمه عبور وب‌پنل ادمین" : "Panel Admin Secret"}</span>
                  <span className="text-sm text-red-400 font-mono font-bold block mt-1">{reportData.admin_pass}</span>
                </div>

                <div className="p-3 bg-slate-500/5 rounded-2xl border border-slate-500/10">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">{t.emailLbl}</span>
                  <span className="text-xs font-mono font-medium block mt-1">{reportData.email}</span>
                </div>

                <div className="p-3 bg-slate-500/5 rounded-2xl border border-slate-500/10">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">{lang === "fa" ? "کلید عمومی کلودفلر" : "Global API Key"}</span>
                  <span className="text-xs font-mono font-medium block mt-1">{reportData.global_key || globalKey || '-'}</span>
                </div>

                <div className="p-3 bg-slate-500/5 rounded-2xl border border-slate-500/10">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">{lang === "fa" ? "نام کش بایندینگ KV" : "Cloudflare KV Namespace"}</span>
                  <span className="text-xs font-mono font-medium block mt-1">{reportData.kv}</span>
                </div>

                <div className="p-3 bg-slate-500/5 rounded-2xl border border-slate-500/10">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">{lang === "fa" ? "نام پایگاه داده D1" : "D1 Relational Database Name"}</span>
                  <span className="text-xs font-mono font-medium block mt-1">{reportData.db}</span>
                </div>

              </div>

              {/* Developer Details inside success report as requested */}
              <div className="p-4 bg-slate-500/5 rounded-2xl border border-dashed border-slate-500/20 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                  <span className="font-bold">{t.devTitle}</span>
                  <span className="text-indigo-400 font-extrabold">{t.devName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <a href="https://t.me/obsidian347" target="_blank" rel="noreferrer" className="text-cyan-400 font-semibold hover:underline flex items-center gap-1">
                    <Send className="w-3.5 h-3.5" />
                    {t.devTelegramId}
                  </a>
                  <a href="https://github.com/mohammas3983" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white flex items-center gap-1 font-semibold">
                    <Github className="w-3.5 h-3.5" />
                    GitHub
                  </a>
                </div>
              </div>

              {/* Report Actions block: copy, share on telegram, share on whatsapp */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => copyDetailedReport(reportData)}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-lg cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  {t.copyReport}
                </button>
                <button 
                  onClick={() => shareToTelegram(reportData)}
                  className="py-3 px-5 bg-[#229ED9] hover:bg-[#229ED9]/85 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {t.shareTelegram}
                </button>
                <button 
                  onClick={() => shareToWhatsapp(reportData)}
                  className="py-3 px-5 bg-[#25D366] hover:bg-[#25D366]/85 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  {t.shareWhatsapp}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern High-End Top Navigation Panel */}
      <header id="main_app_header" className={`border-b px-6 py-4 sticky top-0 z-40 ${
        isDarkMode ? "bg-[#0b1324] border-slate-800" : "bg-white border-slate-200"
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${isDarkMode ? "bg-indigo-950/40 border-indigo-900/60" : "bg-indigo-50/40 border-indigo-200"}`}>
              <Cloud className="w-6 h-6 text-indigo-500 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight select-none">
                  Obsidian <span className="text-indigo-500 font-extrabold pb-0.5 border-b-2 border-indigo-500">Deploy Panel</span>
                </h1>
                <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase tracking-widest">
                  v2.5 PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">{t.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Lang Toggle */}
            <button 
              onClick={() => setLang(lang === "fa" ? "en" : "fa")}
              className="p-2 bg-slate-500/10 hover:bg-slate-500/20 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs flex items-center gap-1.5 font-bold cursor-pointer transition-all"
            >
              <Languages className="w-4 h-4" />
              <span>{t.langToggle}</span>
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={t.themeToggle}
              className="p-2 bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 hover:text-white border border-slate-500/10 rounded-xl cursor-pointer transition-all"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Quick configuration populate */}
            <button
              id="demo_config_button"
              onClick={populateQuickDemo}
              className="px-4 py-2 text-xs font-semibold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl border border-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Populate test inputs safely"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t.demoBtn}
            </button>
            <a 
              href="https://dash.cloudflare.com/" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs bg-slate-900 border border-slate-800 text-white font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 hover:bg-slate-800 transition shadow-md"
            >
              {t.cfConsole}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>
      </header>

      {/* Main Container Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Premium Smartphone Frame Container (LGI 5 cols) */}
        <div className="lg:col-span-5 flex justify-center">
          
          {/* Phone Mockup Frame */}
          <div className={`relative w-full max-w-[390px] min-h-[730px] rounded-[44px] shadow-2xl border-[11px] overflow-hidden flex flex-col transition-all ${
            isDarkMode ? "bg-[#0b1323] border-[#1e293b] shadow-indigo-950/20" : "bg-white border-slate-900 shadow-slate-300"
          }`}>
            
            {/* Camera Speaker Notch Spacer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-36 bg-[#121c2e] dark:bg-slate-950 rounded-b-2xl z-30 flex items-center justify-around px-4">
              <div className="w-12 h-1.5 bg-slate-800 rounded-full"></div>
              <div className="w-2.5 h-2.5 bg-slate-800 rounded-full border border-slate-750/50"></div>
            </div>

            {/* Simulated Phone Status Bar */}
            <div className="h-8 w-full flex justify-between items-center px-6 pt-1.5 text-[10px] font-bold text-slate-500 select-none z-20">
              <span>9:41</span>
              <div className="flex gap-1.5 items-center">
                <span className="text-[9px]">5G</span>
                <div className="w-3 h-3 border border-slate-700 rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></div>
                </div>
                <div className="w-5 h-2.5 bg-slate-700/50 rounded-xs"></div>
              </div>
            </div>

            {/* App Internal Header inside the Phone Viewport */}
            <div className="px-5 pt-3 pb-2 flex items-center justify-between border-b border-slate-500/10">
              <div>
                <h2 className="text-lg font-black">{lang === "fa" ? "موبایل پنل اوبسیدین" : "Obsidian Mobile"}</h2>
                <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">{t.mobilePipe}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-300 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
                AUTO ROUTE
              </div>
            </div>

            {/* Smart Phone Navigation Tabs */}
            <div className="px-5 flex gap-4 border-b border-slate-500/10 mt-2">
              <button 
                id="phone_tab_deploy"
                onClick={() => setActiveTab("deploy")}
                className={`pb-2 text-xs font-bold tracking-wide transition-all border-b-2 cursor-pointer ${
                  activeTab === "deploy" 
                    ? "border-indigo-500 text-indigo-400" 
                    : "border-transparent text-slate-400 hover:text-slate-250"
                }`}
              >
                {t.deployTab}
              </button>
              <button 
                id="phone_tab_assets"
                onClick={() => setActiveTab("assets")}
                className={`pb-2 text-xs font-bold tracking-wide transition-all border-b-2 cursor-pointer relative ${
                  activeTab === "assets" 
                    ? "border-indigo-500 text-indigo-400" 
                    : "border-transparent text-slate-400 hover:text-slate-250"
                }`}
              >
                {t.historyTab}
                {deployedAssets.length > 0 && (
                  <span className={`absolute -top-1 -right-4 bg-indigo-600 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold ${isRtl ? 'right-auto -left-4':''}`}>
                    {deployedAssets.length}
                  </span>
                )}
              </button>
            </div>

            {/* Phone Scrollable Canvas Frame (Flex-1) */}
            <div className={`flex-1 p-5 overflow-y-auto space-y-4 ${
              isDarkMode ? "bg-[#080d19]/40" : "bg-slate-50"
            }`}>
              
              {activeTab === "deploy" ? (
                /* Form deployment inside phone Frame */
                <form id="phone_deploy_form" onSubmit={handleDeploy} className="space-y-4">
                  
                  {/* Email block */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {t.emailLbl}
                    </label>
                    <input 
                      type="email"
                      value={email}
                      required
                      placeholder={t.emailPlh}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full h-11 border rounded-xl px-3 text-xs focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium ${
                        isDarkMode ? "bg-[#11192e] border-slate-800 text-white placeholder-slate-500" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                      }`}
                    />
                  </div>

                  {/* API Key block with clear visible toggle to guarantee correct inputs */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-slate-400" />
                        {t.apiKeyLbl}
                      </span>
                      <span className="text-[9px] text-indigo-400 font-semibold lowercase">{t.apiModeLbl}</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={globalKey}
                        required
                        placeholder={t.apiKeyPlh}
                        onChange={(e) => setGlobalKey(e.target.value)}
                        className={`w-full h-11 border rounded-xl pl-3 pr-10 text-xs focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all font-mono ${
                          isDarkMode ? "bg-[#11192e] border-slate-800 text-white placeholder-slate-500" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Key className="w-4 h-4 text-slate-500" />
                      </div>
                    </div>
                  </div>

                  {/* Account ID block */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Database className="w-3.5 h-3.5 text-slate-400" />
                      {t.accountIdLbl}
                    </label>
                    <input 
                      type="text"
                      value={accountId}
                      required
                      placeholder={t.accountIdPlh}
                      onChange={(e) => setAccountId(e.target.value)}
                      className={`w-full h-11 border rounded-xl px-3 text-xs focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all font-mono ${
                        isDarkMode ? "bg-[#11192e] border-slate-800 text-white placeholder-slate-500" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                      }`}
                    />
                  </div>

                  {/* Double Parameter Grid */}
                  <div className="grid grid-cols-12 gap-3">
                    
                    {/* Worker Name */}
                    <div className="col-span-12 sm:col-span-7 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        {t.workerLbl}
                      </label>
                      <input 
                        type="text"
                        value={workerName}
                        required
                        onChange={(e) => setWorkerName(e.target.value)}
                        className={`w-full h-11 border rounded-xl px-3 text-xs focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium ${
                          isDarkMode ? "bg-[#11192e] border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                        }`}
                      />
                    </div>

                    {/* Admin Key */}
                    <div className="col-span-12 sm:col-span-5 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          {t.adminLbl}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAdminPass(!showAdminPass)}
                          className="text-slate-450 hover:text-indigo-400 cursor-pointer"
                        >
                          {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </label>
                      <input 
                        type={showAdminPass ? "text" : "password"}
                        value={adminPass}
                        required
                        placeholder={t.adminPlh}
                        onChange={(e) => setAdminPass(e.target.value)}
                        className={`w-full h-11 border rounded-xl px-3 text-xs focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium ${
                          isDarkMode ? "bg-[#11192e] border-slate-800 text-white placeholder-slate-500" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                        }`}
                      />
                    </div>

                  </div>

                  {/* Realtime Feedback Logging Output */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Terminal className="w-3.5 h-3.5 text-indigo-455" />
                        {t.progressTitle}
                      </label>
                      {isDeploying && (
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
                          <span className="text-[9px] font-bold text-indigo-400 uppercase">{progressPercent}%</span>
                        </div>
                      )}
                    </div>

                    {/* Terminal Window Box */}
                    <div className="h-40 bg-slate-950 border border-slate-900 rounded-2xl p-3.5 flex flex-col justify-between overflow-hidden shadow-inner relative">
                      
                      <div className="space-y-1.5 overflow-y-auto flex-1 font-mono text-[9.5px] leading-relaxed pr-1 text-slate-300">
                        {logs.length === 0 ? (
                          <div className="text-slate-500 italic h-full flex flex-col justify-center items-center text-center p-3 gap-1">
                            <Smartphone className="w-6 h-6 text-slate-700 mb-1" />
                            <span>{t.readyMsg}</span>
                          </div>
                        ) : (
                          logs.map((lg, i) => (
                            <div key={i} className="flex gap-1.5 items-start">
                              {lg.status === "success" && <span className="text-emerald-400 font-bold">✓</span>}
                              {lg.status === "error" && <span className="text-rose-400 font-bold">✘</span>}
                              {lg.status === "warn" && <span className="text-amber-400 font-bold">⚠</span>}
                              {lg.status === "info" && <span className="text-indigo-400 animate-pulse">●</span>}
                              <span className={
                                lg.status === "success" ? "text-emerald-300" :
                                lg.status === "error" ? "text-rose-300 font-semibold" :
                                lg.status === "warn" ? "text-amber-300" : "text-indigo-200"
                              }>
                                {lg.message}
                              </span>
                            </div>
                          ))
                        )}
                        <div ref={logTerminalEndRef} />
                      </div>

                      {/* Floating progress marker */}
                      {isDeploying && (
                        <div className="absolute right-3.5 bottom-3 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg flex items-center gap-1.5">
                          <div className="w-3 h-3 border-2 border-indigo-550 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-[9px] font-bold text-indigo-400">{progressPercent}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Deploy Action Action Trigger Button */}
                  <button 
                    type="submit"
                    disabled={isDeploying}
                    className={`w-full h-13 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3.5 select-none cursor-pointer ${
                      isDeploying ? "opacity-75 cursor-not-allowed animate-pulse" : ""
                    }`}
                  >
                    {isDeploying ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span className="tracking-wide">{t.deployingMsg}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current shrink-0" />
                        <span className="tracking-wide">{t.deployBtn}</span>
                      </>
                    )}
                  </button>

                  <div className="pt-2">
                    <div className="p-3 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 text-[10px] space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-400">
                        <span>{lang === "fa" ? "مشخصات توسعه‌دهنده:" : "Developer:"}</span>
                        <span className="text-indigo-400">{t.devName}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Telegram:</span>
                        <a href="https://t.me/obsidian347" target="_blank" rel="noreferrer" className="text-cyan-400 font-bold hover:underline">
                          @obsidian347
                        </a>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>GitHub:</span>
                        <a href="https://github.com/mohammas3983" target="_blank" rel="noreferrer" className="text-xs hover:underline text-slate-350 font-bold">
                          mohammas3983
                        </a>
                      </div>
                    </div>
                  </div>

                </form>
              ) : (
                /* Assets tab inside smartphone frame */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{lang === "fa" ? "رکوردهای لود شده محلی" : "Stored database records"}</span>
                    {deployedAssets.length > 0 && (
                      <button 
                        onClick={clearHistory}
                        className="text-[10px] text-rose-500 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t.clearHistory}
                      </button>
                    )}
                  </div>

                  {deployedAssets.length === 0 ? (
                    <div className={`border rounded-[25px] text-center py-10 px-5 space-y-3 shadow-xs ${
                      isDarkMode ? "bg-[#111a2f]/80 border-slate-800" : "bg-white border-slate-200"
                    }`}>
                      <div className="mx-auto w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center border border-indigo-500/20">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">{t.noHistory}</p>
                        <p className="text-[10px] text-slate-400 mt-1 max-w-[210px] mx-auto">{t.noHistoryDesc}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {deployedAssets.map((ast, idx) => (
                        <div 
                          key={idx}
                          className={`rounded-2xl p-3.5 border transition-all relative group overflow-hidden ${
                            isDarkMode ? "bg-[#111a2f] border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold truncate block max-w-[120px]">{ast.name}</span>
                                <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-sm uppercase ${
                                  ast.status === "Success" 
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                }`}>
                                  {ast.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">{ast.date}</p>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {/* Open detail report */}
                              <button 
                                onClick={() => {
                                  setReportData(ast);
                                  setShowReportModal(true);
                                }}
                                title="Show details"
                                className="p-1 px-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded-lg border border-indigo-550/20 cursor-pointer"
                              >
                                {lang === "fa" ? "مشخصات" : "Specs"}
                              </button>
                              <a 
                                href={ast.url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 px-2 bg-slate-500/10 hover:bg-slate-500/20 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-500/20 flex items-center gap-1 transition"
                              >
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            </div>
                          </div>

                          <div className="mt-2.5 pt-2.5 border-t border-slate-800/10 dark:border-slate-800 space-y-1 text-[9px] text-slate-400">
                            <div className="flex justify-between">
                              <span>{lang === "fa" ? "ایمیل:" : "Email:"}</span>
                              <span className="font-medium text-slate-300 truncate max-w-[140px]">{ast.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{lang === "fa" ? "رمز ادمین:" : "Pass:"}</span>
                              <span className="text-red-400 font-bold">{ast.admin_pass}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>KV Binding:</span>
                              <span className="font-mono text-[8px]">{ast.kv}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>D1 Binding:</span>
                              <span className="font-mono text-[8px]">{ast.db}</span>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Simulated Phone Navigation Bar Area */}
            <div className={`border-t flex flex-col items-center py-2 relative z-20 ${
              isDarkMode ? "bg-[#090e1c] border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              
              {/* Dynamic lower tab items to represent real app design */}
              <div className="w-full h-11 flex justify-around items-center px-6">
                
                <button 
                  onClick={() => setActiveTab("deploy")}
                  className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    activeTab === "deploy" ? "text-indigo-400 opacity-100" : "text-slate-400 opacity-60"
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${activeTab === "deploy" ? "bg-indigo-400" : "bg-transparent"}`}></div>
                  <Smartphone className="w-4 h-4" />
                  <span className="text-[8px] font-bold">{t.tab_deploy || 'Deploy'}</span>
                </button>

                <button 
                  onClick={() => setActiveTab("assets")}
                  className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    activeTab === "assets" ? "text-indigo-400 opacity-100" : "text-slate-400 opacity-60"
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${activeTab === "assets" ? "bg-indigo-400" : "bg-transparent"}`}></div>
                  <Database className="w-4 h-4" />
                  <span className="text-[8px] font-bold">{t.tab_assets || 'Assets'}</span>
                </button>

                <div className="flex flex-col items-center opacity-30 text-slate-400 cursor-not-allowed">
                  <div className="w-1.5 h-1.5 bg-transparent rounded-full"></div>
                  <Server className="w-4 h-4" />
                  <span className="text-[8px] font-bold">Options</span>
                </div>

              </div>

              {/* Developer Signature - Extremely Important as requested by user */}
              <div className="pt-2 pb-2">
                <p className="text-[8.5px] font-extrabold text-slate-400 tracking-wider">
                  BY <span className="text-indigo-400 font-black">{t.devName}</span>
                </p>
              </div>

              {/* simulated phone home indicator swipe bar */}
              <div className="h-1.5 w-28 bg-slate-800 dark:bg-slate-700 rounded-full mt-1"></div>

            </div>

          </div>

        </div>

        {/* Right Side: Professional Python Flet Exporter Area (LGI 7 cols) */}
        <div className={`rounded-3xl p-6 border shadow-xs space-y-6 ${
          isDarkMode ? "bg-[#0b1324] border-slate-800" : "bg-white border-slate-200"
        }`}>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 border-slate-800/10 dark:border-slate-800 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                <FileCode className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold">{t.fletTitle}</h3>
                <p className="text-xs text-slate-400 font-medium">{t.fletDesc}</p>
              </div>
            </div>

            <button 
              id="copy_python_flet_top"
              onClick={handleCopyFletCode}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              {copiedFlet ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy main.py Source</span>
                </>
              )}
            </button>
          </div>

          {/* Quick instructions steps on how to execute of build */}
          <div className={`border p-4 rounded-2xl space-y-3 ${
            isDarkMode ? "bg-slate-900/40 border-slate-800" : "bg-slate-50 border-slate-200"
          }`}>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              {t.stepTitle}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs leading-normal">
              
              <div className={`p-3 rounded-xl border ${isDarkMode ? "bg-[#11192e] border-slate-800":"bg-white border-slate-200"}`}>
                <span className="inline-block text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">{t.step1Title}</span>
                <p className="text-[11px] text-slate-400 mt-2">{t.step1Desc}</p>
                <code className="block bg-slate-950 text-emerald-450 font-mono text-[10px] p-2 rounded-lg mt-2 border border-slate-850">
                  {lang === "fa" ? "مجهز به مکانیزم نصب خودکار پایپلاین (No pip command needed!)" : "Bundled with self-installation pipeline (No pip copy needed!)"}
                </code>
              </div>

              <div className={`p-3 rounded-xl border ${isDarkMode ? "bg-[#11192e] border-slate-800":"bg-white border-slate-200"}`}>
                <span className="inline-block text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">{t.step2Title}</span>
                <p className="text-[11px] text-slate-400 mt-2">{t.step2Desc}</p>
              </div>

              <div className={`p-3 rounded-xl border ${isDarkMode ? "bg-[#11192e] border-slate-800":"bg-white border-slate-200"}`}>
                <span className="inline-block text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">{t.step3Title}</span>
                <p className="text-[11px] text-slate-400 mt-2">{t.step3Desc}</p>
                <code className="block bg-slate-950 text-slate-300 font-mono text-[10px] p-2 rounded-lg mt-2 border border-slate-850">
                  flet run main.py
                </code>
              </div>

              <div className={`p-3 rounded-xl border ${isDarkMode ? "bg-[#11192e] border-slate-800":"bg-white border-slate-200"}`}>
                <span className="inline-block text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">{t.step4Title}</span>
                <p className="text-[11px] text-slate-400 mt-2">{t.step4Desc}</p>
                <div className="flex gap-1.5 mt-2">
                  <div className="bg-slate-950 text-slate-300 font-mono text-[10px] p-2 rounded-lg flex-1 border border-slate-850 flex items-center justify-between">
                    <span>flet build apk</span>
                    <button 
                      onClick={handleCopyApkCmd}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      {copiedApkCmd ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Code Viewer Tab Block */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-emerald-400" />
                flet_app.py
              </span>
              <span className="text-[11px] text-slate-400 bg-slate-800/40 px-2.5 py-0.5 rounded-full font-medium">Asynchronous HTTPX API Handler</span>
            </div>

            {/* Python code view screen with scrolling */}
            <div className="relative">
              <pre className="h-72 bg-slate-950 border border-slate-900 rounded-2xl p-4 overflow-auto text-slate-300 text-[11px] font-mono leading-relaxed shadow-inner">
                {fletPythonCode}
              </pre>

              {/* Floating Copy Button over Code Area */}
              <button
                id="floating_copy_python_button"
                onClick={handleCopyFletCode}
                className="absolute bottom-4 right-4 bg-slate-900 hover:bg-slate-850 text-white border border-slate-800 shadow-xl px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
              >
                {copiedFlet ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-indigo-400" />
                    <span>Copy Flet main.py Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Deep architectural constraints and specifications warning */}
          <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl flex gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1.5 font-sans leading-relaxed text-slate-300">
              <p className="font-bold text-amber-400">{t.importantNote}</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                <li><strong>{t.bindingMsg1}</strong> {t.bindingMsg1Body}</li>
                <li><strong>{t.bindingMsg2}</strong> {t.bindingMsg2Body}</li>
              </ul>
            </div>
          </div>

        </div>

      </main>

      {/* Global External Footer */}
      <footer id="master_app_footer" className={`border-t py-6 px-6 mt-12 text-center text-xs ${
        isDarkMode ? "bg-[#0b1324] border-slate-800 text-slate-400":"bg-white border-slate-200 text-slate-600"
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-semibold text-slate-400">© 2026 Obsidian Panel Cloudflare Deployer suite. All rights reserved.</p>
          
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <span>{t.devTitle}</span>
            <span className="text-indigo-400 font-extrabold">{t.devName}</span>
            <a href="https://t.me/obsidian347" target="_blank" rel="noreferrer" className="text-cyan-400 font-bold hover:underline flex items-center gap-1">
              <Send className="w-3.5 h-3.5" />
              {t.devTelegramId}
            </a>
            <a href="https://github.com/mohammas3983" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white flex items-center gap-1 font-bold">
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
