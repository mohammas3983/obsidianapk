import sys
import os

# Determine if running on mobile device (Android/iOS)
is_mobile = (
    sys.platform == "android" or
    hasattr(sys, "getandroidapilevel") or
    "ANDROID_ENTRYPOINT" in os.environ or
    "ANDROID_ARGUMENT" in os.environ or
    os.environ.get("SEARCH_ENGINE") == "serious_python"
)

# Only verify and run pip if we are not on mobile (avoids importing subprocess/pip on mobile)
if not is_mobile:
    import subprocess
    import importlib.util
    REQUIRED_PACKAGES = ["flet", "httpx"]
    for package in REQUIRED_PACKAGES:
        try:
            if package == "flet":
                import flet
            elif package == "httpx":
                import httpx
        except ImportError:
            print(f"Required package '{package}' is missing. Readying self-installation...")
            try:
                subprocess.check_call([sys.executable, "-m", "pip", "install", package])
                print(f"Successfully installed missing package '{package}'!")
            except Exception as e:
                print(f"Error during automated installation of '{package}': {e}")
                print("Please ensure your Python dynamic pip path has internet access.")

import asyncio
import httpx
import json
import random
import string
import urllib.parse
from datetime import datetime
import flet as ft

# =====================================================================
# Obsidian Panel Android Deployer (Flet GUI v2.5 Async Multi-mode)
# Developed by MohammadSadegh Ghasemi (@obsidian347)
# =====================================================================

GITHUB_WORKER_URL = "https://raw.githubusercontent.com/mohammas3983/obsidian-proxy/main/worker.js"
DEV_NAME = "MohammadSadegh Ghasemi (محمدصادق قاسمی)"
DEV_TELEGRAM = "@obsidian347"
DEV_GITHUB = "https://github.com/mohammas3983"

TRANSLATIONS = {
    "en": {
        "title": "Obsidian Deployer",
        "subtitle": "Cloudflare Workers, D1 Database, and KV Automation",
        "email_lbl": "Cloudflare Account Email",
        "apikey_lbl": "Global API Key",
        "accountid_lbl": "Cloudflare Account ID",
        "worker_lbl": "Worker Service Name",
        "admin_lbl": "Admin Key (Password)",
        "deploy_btn": "Deploy Obsidian Panel",
        "building_btn": "Building Databases & Script...",
        "status_ready": "Ready to Deploy",
        "toast_fill_all": "Please complete all fields first!",
        "lang_toggle": "FA/Farsi",
        "theme_toggle": "Theme",
        "success_title": "🎉 Deployment Successful!",
        "report_msg": "Your Obsidian Panel has been provisioned. Details:",
        "copy_report": "Copy Deployment Text",
        "telegram_share": "Share on Telegram",
        "copied_toast": "Copied to clipboard!",
        "history_title": "Saved Deployments",
        "history_desc": "Local SQLite database history on this device",
        "no_assets": "No assets found. Complete your first deployment!",
        "tab_deploy": "Deploy",
        "tab_assets": "Assets",
        "footer_signature": "Developed by MohammadSadegh Ghasemi",
    },
    "fa": {
        "title": "راه‌انداز ابری پنل اوبسیدین",
        "subtitle": "اتوماسیون ورکرها، دیتابیس D1 و کش KV کلودفلر",
        "email_lbl": "ایمیل حساب کلودفلر",
        "apikey_lbl": "کلید عمومی (Global API Key)",
        "accountid_lbl": "شناسه حساب (Account ID)",
        "worker_lbl": "نام ورکر سرویس جدید",
        "admin_lbl": "رمز عبور ادمین پنل",
        "deploy_btn": "استقرار و استارت پنل اوبسیدین",
        "building_btn": "در حال پیکربندی دیتابیس و کد...",
        "status_ready": "آماده برای شروع عملیات استقرار",
        "toast_fill_all": "لطفاً تمامی فیلدهای فرم را به درستی تکمیل کنید!",
        "lang_toggle": "EN/English",
        "theme_toggle": "پوسته",
        "success_title": "🎉 استقرار با موفقیت انجام شد!",
        "report_msg": "پنل اوبسیدین شما آماده استفاده است. مشخصات فنی:",
        "copy_report": "کپی کل مشخصات فنی",
        "telegram_share": "اشتراک‌گذاری در تلگرام",
        "copied_toast": "متن گزارش کپی شد!",
        "history_title": "تاریخچه استقرارها",
        "history_desc": "لیست سرورهای ثبت شده در حافظه داخلی دستگاه شما",
        "no_assets": "هیچ تاریخچه‌ای یافت نشد. اولین استقرار را استارت بزنید!",
        "tab_deploy": "استقرار پنل",
        "tab_assets": "سرورهای فعال",
        "footer_signature": "طراحی و توسعه توسط محمدصادق قاسمی",
    }
}

def generate_suffix():
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))

class ObsidianDeployerApp:
    def __init__(self, page: ft.Page):
        self.page = page
        self.page.title = "Obsidian Panel Deployer"
        self.page.theme_mode = ft.ThemeMode.DARK
        self.lang = "fa"  # Default to Farsi as requested by user

        # Setup custom modern theme layouts
        self.page.theme = ft.Theme(
            color_scheme_seed=ft.colors.INDIGO,
            visual_density=ft.VisualDensity.COMPACT
        )
        self.page.padding = 16
        self.page.window_width = 410
        self.page.window_height = 800

        # Form Controls
        self.email_input = ft.TextField(
            label="",
            keyboard_type=ft.KeyboardType.EMAIL,
            text_size=13,
            prefix_icon=ft.icons.EMAIL_OUTLINED
        )
        self.api_key_input = ft.TextField(
            label="",
            text_size=13,
            prefix_icon=ft.icons.KEY_ROUNDED
        )
        self.account_id_input = ft.TextField(
            label="",
            text_size=13,
            prefix_icon=ft.icons.SUPERVISED_USER_CIRCLE_OUTLINED
        )
        self.worker_name_input = ft.TextField(
            value="obsidian-panel",
            text_size=13,
            prefix_icon=ft.icons.DNS_OUTLINED
        )
        self.admin_pass_input = ft.TextField(
            label="",
            password=True,
            can_reveal_password=True,
            text_size=13,
            prefix_icon=ft.icons.ADMIN_PANEL_SETTINGS_OUTLINED
        )

        # Progress elements
        self.progress_ring = ft.ProgressRing(visible=False, width=24, height=24, stroke_width=2.5, color=ft.colors.INDIGO)
        self.status_text = ft.Text("", size=12, italic=True)
        self.log_view = ft.ListView(
            expand=True,
            spacing=4,
            height=150,
            padding=8,
            auto_scroll=True
        )
        
        # Toggle buttons
        self.lang_btn = ft.TextButton(text="", on_click=self.toggle_language, icon=ft.icons.LANGUAGE)
        self.theme_btn = ft.IconButton(icon=ft.icons.LIGHT_MODE, on_click=self.toggle_theme_mode, tooltip="Toggle Dark/Light")
        
        # Deploy action button
        self.deploy_button = ft.ElevatedButton(
            text="",
            icon=ft.icons.ROCKET_LAUNCH_ROUNDED,
            style=ft.ButtonStyle(
                color=ft.colors.WHITE,
                bgcolor=ft.colors.INDIGO,
                shape=ft.RoundedRectangleBorder(radius=12)
            ),
            on_click=self.start_deployment_click
        )

        self.assets_list = ft.ListView(expand=True, spacing=10, padding=4)
        self.init_layout()
        self.update_ui_texts()

    def toggle_theme_mode(self, e):
        if self.page.theme_mode == ft.ThemeMode.DARK:
            self.page.theme_mode = ft.ThemeMode.LIGHT
            self.theme_btn.icon = ft.icons.DARK_MODE
        else:
            self.page.theme_mode = ft.ThemeMode.DARK
            self.theme_btn.icon = ft.icons.LIGHT_MODE
        self.page.update()

    def toggle_language(self, e):
        self.lang = "en" if self.lang == "fa" else "fa"
        self.update_ui_texts()

    def update_ui_texts(self):
        t = TRANSLATIONS[self.lang]
        rtl = (self.lang == "fa")

        # Alignment and reading direction
        self.page.rtl = rtl
        self.lang_btn.text = t["lang_toggle"]
        
        self.email_input.label = t["email_lbl"]
        self.api_key_input.label = t["apikey_lbl"]
        self.account_id_input.label = t["accountid_lbl"]
        self.worker_name_input.label = t["worker_lbl"]
        self.admin_pass_input.label = t["admin_lbl"]
        
        self.deploy_button.text = t["deploy_btn"]
        self.status_text.value = t["status_ready"]

        # Navbar label updates
        if hasattr(self, "nav_bar"):
            self.nav_bar.destinations[0].label = t["tab_deploy"]
            self.nav_bar.destinations[1].label = t["tab_assets"]

        self.page.update()

    def show_alert(self, message, is_error=False):
        self.page.snack_bar = ft.SnackBar(
            content=ft.Text(message, color=ft.colors.WHITE, size=13),
            bg_color=ft.colors.RED_700 if is_error else ft.colors.GREEN_800
        )
        self.page.snack_bar.open = True
        self.page.update()

    def add_log(self, text, status="info"):
        color = ft.colors.WHITE if self.page.theme_mode == ft.ThemeMode.DARK else ft.colors.BLACK
        prefix = "ℹ "
        if status == "success":
            color = ft.colors.GREEN_400 if self.page.theme_mode == ft.ThemeMode.DARK else ft.colors.GREEN_700
            prefix = "✔ "
        elif status == "error":
            color = ft.colors.RED_400 if self.page.theme_mode == ft.ThemeMode.DARK else ft.colors.RED_750
            prefix = "✘ "
        elif status == "warn":
            color = ft.colors.AMBER_500
            prefix = "⚠ "

        self.log_view.controls.append(
            ft.Text(f"{prefix}{text}", color=color, size=11, font_family="monospace")
        )
        self.status_text.value = text
        self.page.update()

    async def start_deployment_click(self, e):
        email = self.email_input.value.strip()
        api_key = self.api_key_input.value.strip()
        account_id = self.account_id_input.value.strip()
        worker_name = self.worker_name_input.value.strip()
        admin_pass = self.admin_pass_input.value.strip()

        t = TRANSLATIONS[self.lang]

        if not all([email, api_key, account_id, worker_name, admin_pass]):
            self.show_alert(t["toast_fill_all"], is_error=True)
            return

        self.deploy_button.disabled = True
        self.progress_ring.visible = True
        self.log_view.controls.clear()
        self.add_log("Preparing deployment workflow environment..." if self.lang=="en" else "در حال بررسی و آماده‌سازی کلودفلر...", "info")
        self.page.update()

        try:
            # 1. dynamic script download from GitHub (OTA fetch)
            self.add_log("Downloading Obsidian Worker core from GitHub raw..." if self.lang=="en" else "در حال دریافت کد خام ورکر از گیت‌هاب...", "info")
            async with httpx.AsyncClient() as client:
                resp = await client.get(GITHUB_WORKER_URL)
                if resp.status_code != 200:
                    raise Exception(f"Unable to read worker code: HTTP {resp.status_code}")
                worker_code = resp.text
            self.add_log("Worker source code fetched!" if self.lang=="en" else "کد منبع ورکر با موفقیت دانلود شد!", "success")

            headers = {
                "X-Auth-Email": email,
                "X-Auth-Key": api_key
            }

            base_kv_name = f"{worker_name}-kv"
            base_d1_name = f"{worker_name}-db"

            # 2. Check/create KV Namespace
            self.add_log("Resolving Cloudflare KV namespace title..." if self.lang=="en" else "پیکربندی تداخل نام و ثبت کش KV...", "info")
            kv_url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/storage/kv/namespaces"
            
            async with httpx.AsyncClient() as client:
                get_kv = await client.get(kv_url, headers=headers)
                if get_kv.status_code != 200:
                    raise Exception(f"KV Service Failed: {get_kv.text}")
                kv_json = get_kv.json()
                
                existing_kvs = [kv["title"] for kv in kv_json.get("result", [])] if kv_json.get("success") else []
                actual_kv = base_kv_name
                if actual_kv in existing_kvs:
                    actual_kv = f"{base_kv_name}-{generate_suffix()}"
                    self.add_log(f"Collision resolved. Creating unique KV style: {actual_kv}", "warn")
                
                post_kv = await client.post(kv_url, headers=headers, json={"title": actual_kv})
                kv_res = post_kv.json()
                if not kv_res.get("success"):
                    raise Exception(f"KV Creation failed: {kv_res['errors'][0]['message']}")
                kv_id = kv_res["result"]["id"]
            self.add_log("KV storage provisioned!" if self.lang=="en" else "انبار داده موقت KV با موفقیت ساخته شد!", "success")

            # 3. Check/create D1 Database
            self.add_log("Provisioning Cloudflare D1 Relational Engine..." if self.lang=="en" else "در حال بررسی و ساخت دیتابیس D1 کلودفلر...", "info")
            d1_url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/d1/database"
            async with httpx.AsyncClient() as client:
                get_d1 = await client.get(d1_url, headers=headers)
                if get_d1.status_code != 200:
                    raise Exception(f"D1 Fetch Failed: {get_d1.text}")
                d1_json = get_d1.json()
                
                existing_d1s = [db["name"] for db in d1_json.get("result", [])] if d1_json.get("success") else []
                actual_d1 = base_d1_name
                if actual_d1 in existing_d1s:
                    actual_d1 = f"{base_d1_name}-{generate_suffix()}"
                    self.add_log(f"Database collision handled. Name: {actual_d1}", "warn")

                post_d1 = await client.post(d1_url, headers=headers, json={"name": actual_d1})
                db_res = post_d1.json()
                if not db_res.get("success"):
                    raise Exception(f"D1 DB failed: {db_res['errors'][0]['message']}")
                d1_id = db_res["result"]["uuid"]
            self.add_log("D1 Database built successfully!" if self.lang=="en" else "پایگاه داده رابطه‌ای D1 ایجاد شد!", "success")

            # 4. Propagation Delay - strictly async
            self.add_log("Edge routing propagation cooling delay (10 seconds)..." if self.lang=="en" else "وقفه ۱۰ ثانیه‌ای جهت انتشار اطلاعات در نودهای شبکه کلودفلر...", "info")
            for sec in range(10, 0, -1):
                self.add_log(f"Cooling edge metadata... {sec}s" if self.lang=="en" else f"ثبت اتصالات... {sec} ثانیه مانده", "info")
                await asyncio.sleep(1)

            # 5. Worker upload and precise metadata bindings
            self.add_log("Deploying script modules with exact binding properties..." if self.lang=="en" else "در حال آپلود سورس ورکر با بایندینگ اصلی...", "info")
            deploy_url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/workers/scripts/{worker_name}"
            
            metadata = {
                "main_module": "main.js",
                "bindings": [
                    {"type": "kv_namespace", "name": "KV", "namespace_id": kv_id},
                    {"type": "d1", "name": "DB", "id": d1_id},
                    {"type": "secret_text", "name": "ADMIN", "text": admin_pass}
                ],
                "compatibility_date": "2023-10-30"
            }

            files = {
                "metadata": (None, json.dumps(metadata), "application/json"),
                "main.js": ("main.js", worker_code, "application/javascript+module")
            }

            async with httpx.AsyncClient() as client:
                res_put = await client.put(deploy_url, headers=headers, files=files)
                put_json = res_put.json()
                if not put_json.get("success"):
                    raise Exception(f"Upload failed: {put_json['errors'][0]['message']}")
            self.add_log("Metadata scripts bound and deployed!" if self.lang=="en" else "ورکر با دیتابیس اوبسیدین بایند و دیپلوی شد!", "success")

            # 6. Enable global routing
            self.add_log("Enabling routing subdomain access..." if self.lang=="en" else "فعال‌سازی ساب‌دومین و آدرس عمومی ورکر...", "info")
            route_url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/workers/scripts/{worker_name}/subdomain"
            async with httpx.AsyncClient() as client:
                res_route = await client.post(route_url, headers=headers, json={"enabled": True})
                route_json = res_route.json()
                if not route_json.get("success"):
                    raise Exception(f"Subdomain mapping error: {route_json['errors'][0]['message']}")
            
            # 7. Query subdomains
            sub_url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/workers/subdomain"
            subdomain = "your-subdomain"
            async with httpx.AsyncClient() as client:
                res_sub = await client.get(sub_url, headers=headers)
                sub_res = res_sub.json()
                if sub_res.get("success") and sub_res.get("result"):
                    subdomain = sub_res["result"]["subdomain"]
            
            worker_url = f"https://{worker_name}.{subdomain}.workers.dev"
            self.add_log(f"Live worker mapped to URL: {worker_url}", "success")

            # 8. Probe healts
            self.add_log("Sanity checks health ping (Attempt 1/8)..." if self.lang=="en" else "در حال صحت‌سنجی نهایی وضعیت آپ‌تایم ورکر...", "info")
            is_healthy = False
            for probe in range(8):
                try:
                    await asyncio.sleep(4)
                    async with httpx.AsyncClient() as client:
                        probe_chk = await client.get(worker_url, timeout=5.0)
                        if probe_chk.status_code < 500 and probe_chk.status_code != 404:
                            is_healthy = True
                            self.add_log(f"Health check succeeded level {probe_chk.status_code}!" if self.lang=="en" else f"تایید ارتباط با موفقیت انجام شد (وضعیت {probe_chk.status_code})!", "success")
                            break
                except:
                    pass

            status_text_res = "Success" if is_healthy else "Unresponsive"
            
            # Save results log locally via client persistent storage
            detailed_record = {
                "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "email": email,
                "name": worker_name,
                "admin_pass": admin_pass,
                "status": status_text_res,
                "url": worker_url,
                "kv": actual_kv,
                "db": actual_d1,
                "global_key": api_key,
                "account_id": account_id
            }

            stored_logs_json = self.page.client_storage.get("obsidian_assets")
            stored_logs = []
            if stored_logs_json:
                try:
                    stored_logs = json.loads(stored_logs_json)
                except:
                    stored_logs = []
            
            stored_logs.insert(0, detailed_record)
            self.page.client_storage.set("obsidian_assets", json.dumps(stored_logs))

            # Trigger successful report modal
            self.show_deployment_report_dialog(detailed_record)
            self.load_assets_view()

        except Exception as err:
            self.add_log(str(err), "error")
            self.show_alert(f"Failed: {str(err)}", is_error=True)
        finally:
            self.deploy_button.disabled = False
            self.progress_ring.visible = False
            self.page.update()

    def show_deployment_report_dialog(self, data):
        """Displays a gorgeous multi-lingual report with direct Copy to clip & Send to messengers actions"""
        t = TRANSLATIONS[self.lang]

        report_body = (
            f"🌐 URL: {data['url']}\n"
            f"📧 Email: {data['email']}\n"
            f"🔑 Admin Pass: {data['admin_pass']}\n"
            f"🛡️ Client API Key: {data['global_key']}\n"
            f"🆔 Account ID: {data['account_id']}\n"
            f"📦 KV Name: {data['kv']}\n"
            f"📂 D1 DB: {data['db']}\n"
            f"⏱️ Date: {data['date']}"
        )

        def copy_action(e):
            self.page.set_clipboard(report_body)
            self.show_alert(t["copied_toast"])

        def share_telegram(e):
            encoded_text = urllib.parse.quote(f"{t['success_title']}\n\n{report_body}")
            tg_url = f"https://t.me/share/url?url={data['url']}&text={encoded_text}"
            self.page.launch_url(tg_url)

        report_dialog = ft.AlertDialog(
            title=ft.Row([
                ft.Icon(ft.icons.CHECK_CIRCLE, color=ft.colors.GREEN),
                ft.Text(t["success_title"], weight=ft.FontWeight.BOLD, size=16)
            ], spacing=10),
            content=ft.Column([
                ft.Text(t["report_msg"], size=12, italic=True),
                ft.Container(
                    content=ft.Text(report_body, font_family="monospace", size=10, selection_enabled=True),
                    bgcolor=ft.colors.BLACK38,
                    padding=10,
                    border_radius=8
                )
            ], tight=True, spacing=10),
            actions=[
                ft.ElevatedButton(
                    text=t["copy_report"],
                    icon=ft.icons.COPY,
                    on_click=copy_action,
                    style=ft.ButtonStyle(bgcolor=ft.colors.INDIGO, color=ft.colors.WHITE)
                ),
                ft.ElevatedButton(
                    text=t["telegram_share"],
                    on_click=share_telegram,
                    icon=ft.icons.SEND,
                    style=ft.ButtonStyle(bgcolor=ft.colors.CYAN_700, color=ft.colors.WHITE)
                ),
                ft.TextButton("Close", on_click=lambda e: self.close_dialog(report_dialog))
            ],
            actions_alignment=ft.MainAxisAlignment.END
        )

        self.page.overlay.append(report_dialog)
        report_dialog.open = True
        self.page.update()

    def close_dialog(self, dialog):
        dialog.open = False
        self.page.update()

    def load_assets_view(self):
        logs_json = self.page.client_storage.get("obsidian_assets")
        assets = []
        if logs_json:
            try:
                assets = json.loads(logs_json)
            except:
                assets = []

        self.assets_list.controls.clear()
        t = TRANSLATIONS[self.lang]

        if not assets:
            self.assets_list.controls.append(
                ft.Container(
                    content=ft.Text(t["no_assets"], color=ft.colors.GREY_500, size=12),
                    alignment=ft.alignment.center,
                    padding=40
                )
            )
            self.page.update()
            return

        for ast in assets:
            status_is_ok = ast.get("status") == "Success"
            status_color = ft.colors.GREEN_400 if status_is_ok else ft.colors.AMBER_400
            
            # Dialog review handler for logs
            def make_click_handler(asset_data):
                return lambda e: self.show_deployment_report_dialog(asset_data)

            self.assets_list.controls.append(
                ft.Card(
                    elevation=2,
                    color=ft.colors.SURFACE_VARIANT,
                    content=ft.Container(
                        padding=12,
                        content=ft.Column([
                            ft.Row([
                                ft.Icon(ft.icons.CLOUD_DONE_OUTLINED, color=ft.colors.INDIGO_300),
                                ft.Text(ast.get("name", "obsidian"), weight=ft.FontWeight.BOLD, size=13),
                                ft.Container(
                                    content=ft.Text(ast.get("status", "Success"), size=8, weight=ft.FontWeight.BOLD, color=ft.colors.BLACK),
                                    bgcolor=status_color,
                                    padding=ft.padding.symmetric(horizontal=8, vertical=2),
                                    border_radius=4
                                )
                            ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
                            
                            ft.Divider(height=1, color=ft.colors.WHITE12),
                            ft.Text(f"Email: {ast.get('email', '-')}", size=11),
                            ft.Text(f"Password: {ast.get('admin_pass', '-')}", size=11, color=ft.colors.RED_200),
                            
                            ft.Row([
                                ft.Text(ast.get("date", "-"), size=9, color=ft.colors.GREY_500),
                                ft.Row([
                                    ft.IconButton(
                                        icon=ft.icons.REPORT_GMAILERRORRED_ROUNDED,
                                        icon_size=16,
                                        tooltip="Show full Report Details",
                                        icon_color=ft.colors.INDIGO_300,
                                        on_click=make_click_handler(ast)
                                    ),
                                    ft.IconButton(
                                        icon=ft.icons.LANGUAGE_ROUNDED,
                                        icon_size=16,
                                        tooltip="Browse worker Panel",
                                        icon_color=ft.colors.CYAN_400,
                                        on_click=lambda e: self.page.launch_url(ast.get("url"))
                                    )
                                ], spacing=4)
                            ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN)
                        ], spacing=4)
                    )
                )
            )
        self.page.update()

    def init_layout(self):
        t = TRANSLATIONS[self.lang]

        # Developer Contact Block
        dev_card = ft.Container(
            content=ft.Column([
                ft.Row([
                    ft.Icon(ft.icons.ACCOUNT_CIRCLE_ROUNDED, size=20, color=ft.colors.INDIGO),
                    ft.Text(DEV_NAME, weight=ft.FontWeight.BOLD, size=11)
                ], alignment=ft.MainAxisAlignment.CENTER),
                ft.Row([
                    ft.TextButton(
                        text=DEV_TELEGRAM,
                        icon=ft.icons.SEND_ROUNDED,
                        style=ft.ButtonStyle(color=ft.colors.CYAN_400),
                        on_click=lambda e: self.page.launch_url(f"https://t.me/obsidian347")
                    ),
                    ft.TextButton(
                        text="GitHub Link",
                        icon=ft.icons.CODE,
                        style=ft.ButtonStyle(color=ft.colors.GREY_400),
                        on_click=lambda e: self.page.launch_url(DEV_GITHUB)
                    )
                ], alignment=ft.MainAxisAlignment.CENTER, spacing=10)
            ], spacing=2),
            padding=10,
            border_radius=12,
            border=ft.border.all(1, ft.colors.INDIGO_100)
        )

        # Main Layout Forms Frame
        self.deploy_container = ft.Container(
            content=ft.Column([
                ft.Column([
                    self.email_input,
                    self.api_key_input,
                    self.account_id_input,
                    self.worker_name_input,
                    self.admin_pass_input,
                ], spacing=10),
                ft.Container(height=4),
                ft.Row([
                    self.deploy_button,
                    self.progress_ring
                ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
                ft.Container(height=4),
                
                ft.Row([
                    ft.Icon(ft.icons.TERMINAL, size=14, color=ft.colors.INDIGO),
                    self.status_text
                ], spacing=4),
                
                ft.Container(
                    content=self.log_view,
                    bgcolor=ft.colors.BLACK38,
                    border_radius=8,
                    padding=4,
                    height=130,
                    border=ft.border.all(1, ft.colors.GREY_900)
                ),
                dev_card
            ], scroll=ft.ScrollMode.AUTO, expand=True)
        )

        self.assets_container = ft.Container(
            visible=False,
            expand=True,
            content=ft.Column([
                ft.Row([
                    ft.Text(t["history_title"], size=16, weight=ft.FontWeight.BOLD),
                    ft.IconButton(ft.icons.REFRESH, on_click=lambda e: self.load_assets_view())
                ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
                self.assets_list
            ], expand=True)
        )

        global_footer = ft.Container(
            content=ft.Text(
                t["footer_signature"],
                size=10,
                color=ft.colors.GREY_500,
                text_align=ft.TextAlign.CENTER
            ),
            padding=ft.padding.symmetric(vertical=4),
            alignment=ft.alignment.center
        )

        # Page Main Setup Layout
        self.main_column = ft.Column([
            ft.Row([
                ft.Icon(ft.icons.CLOUDFLARE, color=ft.colors.ORANGE_500, size=24),
                ft.Text(t["title"], size=18, weight=ft.FontWeight.BOLD),
                ft.Row([self.lang_btn, self.theme_btn], spacing=2)
            ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
            ft.Divider(color=ft.colors.INDIGO_900),
            ft.Container(content=self.deploy_container, expand=True),
            ft.Container(content=self.assets_container, expand=True, visible=False),
            global_footer
        ], expand=True)

        self.nav_bar = ft.NavigationBar(
            destinations=[
                ft.NavigationDestination(icon=ft.icons.ROCKET_LAUNCH, label=t["tab_deploy"]),
                ft.NavigationDestination(icon=ft.icons.DNS_ROUNDED, label=t["tab_assets"])
            ],
            on_change=self.on_navigation_change,
            selected_index=0,
            active_color=ft.colors.INDIGO
        )

        self.page.navigation_bar = self.nav_bar
        self.page.add(self.main_column)

    def on_navigation_change(self, e):
        idx = e.control.selected_index
        if idx == 0:
            self.deploy_container.visible = True
            self.assets_container.visible = False
            self.main_column.controls[2].visible = True
            self.main_column.controls[3].visible = False
        else:
            self.deploy_container.visible = False
            self.assets_container.visible = True
            self.main_column.controls[2].visible = False
            self.main_column.controls[3].visible = True
            self.load_assets_view()
        self.page.update()

def main(page: ft.Page):
    ObsidianDeployerApp(page)

if __name__ == "__main__":
    ft.app(target=main)
