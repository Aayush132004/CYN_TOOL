# import logging
# import os
# from telethon import TelegramClient, events
# from collections import defaultdict
# from dotenv import load_dotenv

# # =========================
# # LOAD ENV VARS
# # =========================
# load_dotenv()
# API_ID = int(os.getenv("TELEGRAM_API_ID"))
# API_HASH = os.getenv("TELEGRAM_API_HASH")
# BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

# # =========================
# # LOGGING SETUP
# # =========================
# logging.basicConfig(
#     filename="alerts.log",
#     level=logging.INFO,
#     format="%(asctime)s - %(levelname)s - %(message)s"
# )

# # =========================
# # LOAD SLANG + EMOJI LISTS
# # =========================
# def load_list(filename):
#     try:
#         with open(filename, "r", encoding="utf-8") as f:
#             return [line.strip() for line in f if line.strip()]
#     except FileNotFoundError:
#         print(f"⚠️ File {filename} not found. Continuing with empty list.")
#         return []

# slang_words = load_list("slang.txt")
# emoji_list = load_list("emoji.txt")

# # =========================
# # TELEGRAM CLIENT
# # =========================
# client = TelegramClient("monitor_session", API_ID, API_HASH).start(bot_token=BOT_TOKEN)

# # =========================
# # FLAGGED COUNTS
# # =========================
# flagged_counts = defaultdict(int)

# # =========================
# # HANDLER
# # =========================
# @client.on(events.NewMessage())
# async def handler(event):
#     text = event.raw_text

#     if any(slang in text for slang in slang_words) or any(e in text for e in emoji_list):
#         flagged_counts[event.chat_id] += 1
#         logging.info(
#             f"[FLAG] Chat: {event.chat_id} | Count: {flagged_counts[event.chat_id]} | Message: {text}"
#         )

# # =========================
# # MAIN
# # =========================
# if __name__ == "__main__":
#     print("🚀 Bot is running. Add it to a group/channel to monitor messages.")
#     client.run_until_disconnected()
   
   
 # tries to self join group but was getting banned  
   
# import os
# import asyncio
# import logging
# from telethon import TelegramClient, events, errors
# from telethon.tl.functions.channels import JoinChannelRequest
# from dotenv import load_dotenv

# # Load environment variables
# load_dotenv()

# API_ID = int(os.getenv("TELEGRAM_API_ID"))
# API_HASH = os.getenv("TELEGRAM_API_HASH")

# # Session file for user login
# SESSION_NAME = "user_monitor"

# # Files
# GROUP_FILE = "group.txt"
# SLANG_FILE = "slang.txt"
# EMOJI_FILE = "emoji.txt"
# ALERT_LOG = "alert_log.txt"

# # Configure logging
# logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# # Initialize client (user mode)
# client = TelegramClient(SESSION_NAME, API_ID, API_HASH)

# # Load slang and emojis
# with open(SLANG_FILE, "r", encoding="utf-8") as f:
#     SLANGS = [line.strip() for line in f if line.strip()]

# with open(EMOJI_FILE, "r", encoding="utf-8") as f:
#     EMOJIS = [line.strip() for line in f if line.strip()]

# # Track alerts per group/channel
# alert_counts = {}

# async def join_groups_from_file():
#     """Read group.txt and join each invite link."""
#     if not os.path.exists(GROUP_FILE):
#         logging.error(f"{GROUP_FILE} not found!")
#         return

#     with open(GROUP_FILE, "r", encoding="utf-8") as f:
#         links = [line.strip() for line in f if line.strip()]

#     for link in links:
#         try:
#             entity = await client.get_entity(link)
#             await client(JoinChannelRequest(entity))
#             chat_type = "Group" if getattr(entity, "megagroup", False) else "Channel"
#             logging.info(f"✅ Joined {chat_type}: {entity.title} ({link})")
#         except errors.UserAlreadyParticipantError:
#             logging.info(f"🔹 Already a member of: {link}")
#         except Exception as e:
#             logging.error(f"❌ Failed to join {link}: {e}")

# @client.on(events.NewMessage())
# async def handler(event):
#     """Monitor incoming messages for slang/emoji."""
#     try:
#         chat = await event.get_chat()
#         chat_name = getattr(chat, "title", "Unknown")
#         chat_id = event.chat_id
#         text = event.raw_text

#         if not text:
#             return

#         flagged = []

#         for slang in SLANGS:
#             if slang in text:
#                 flagged.append(slang)

#         for emoji in EMOJIS:
#             if emoji in text:
#                 flagged.append(emoji)

#         if flagged:
#             alert_counts[chat_id] = alert_counts.get(chat_id, 0) + 1
#             msg = (f"[ALERT] Suspicious message in {chat_name} ({chat_id})\n"
#                    f"Message: {text}\n"
#                    f"Matched: {', '.join(flagged)}\n"
#                    f"Total Flags in this chat: {alert_counts[chat_id]}\n"
#                    f"{'-'*40}\n")
#             with open(ALERT_LOG, "a", encoding="utf-8") as log_file:
#                 log_file.write(msg)
#             logging.warning(msg.strip())

#     except Exception as e:
#         logging.error(f"Handler error: {e}")

# async def main():
#     logging.info("🚀 Starting Telegram client...")
#     await client.start()  # asks for phone + code first time
#     await join_groups_from_file()
#     logging.info("📡 Monitoring groups/channels...")
#     await client.run_until_disconnected()

# if __name__ == "__main__":
#     asyncio.run(main())

# this script was getting bann

# import asyncio
# import logging
# from telethon import TelegramClient, events
# from dotenv import load_dotenv
# import os

# # Load environment variables
# load_dotenv()
# API_ID = int(os.getenv("TELEGRAM_API_ID"))
# API_HASH = os.getenv("TELEGRAM_API_HASH")

# # Configure logging
# logging.basicConfig(
#     level=logging.INFO,
#     format="%(asctime)s - %(levelname)s - %(message)s"
# )
# logger = logging.getLogger("MonitorBot")

# # Create client (as USER, not bot)
# client = TelegramClient("user_monitor_session", API_ID, API_HASH)

# # Load slang and emoji lists
# def load_list(file_path):
#     try:
#         with open(file_path, "r", encoding="utf-8") as f:
#             return [line.strip() for line in f if line.strip()]
#     except FileNotFoundError:
#         logger.warning(f"{file_path} not found, skipping.")
#         return []

# SLANG_WORDS = load_list("slang.txt")
# EMOJIS = load_list("emoji.txt")

# # Alert log file
# ALERT_LOG = "alerts.log"
# alert_counts = {}  # keeps per-group detection count

# def log_alert(chat_title, message, trigger):
#     """Save alert to log file and update count."""
#     count = alert_counts.get(chat_title, 0) + 1
#     alert_counts[chat_title] = count

#     log_entry = (
#         f"[ALERT] Group: {chat_title} | "
#         f"Trigger: {trigger} | "
#         f"Message: {message} | "
#         f"Total Flags in this Group: {count}\n"
#     )

#     with open(ALERT_LOG, "a", encoding="utf-8") as f:
#         f.write(log_entry)

#     logger.warning(log_entry.strip())

# # Monitor messages
# @client.on(events.NewMessage())
# async def handler(event):
#     if not (event.is_group or event.is_channel):
#         return  # Ignore private chats

#     chat = await event.get_chat()
#     chat_title = getattr(chat, "title", "Unknown Chat")
#     text = event.message.message or ""

#     # Check slang words
#     for slang in SLANG_WORDS:
#         if slang in text:
#             log_alert(chat_title, text, slang)
#             return  # one trigger is enough

#     # Check emojis
#     for emoji in EMOJIS:
#         if emoji in text:
#             log_alert(chat_title, text, emoji)
#             return

# async def main():
#     logger.info("🚀 Starting Telegram user client...")
#     await client.start()  # asks for phone + code first time only
#     dialogs = await client.get_dialogs()

#     logger.info("✅ Monitoring the following groups/channels:")
#     for d in dialogs:
#         if d.is_group or d.is_channel:
#             logger.info(f"   - {d.title}")

#     logger.info("⚡ Ready! Waiting for suspicious messages...")
#     await client.run_until_disconnected()

# if __name__ == "__main__":
#     try:
#         asyncio.run(main())
#     except KeyboardInterrupt:
#         logger.info("🛑 Monitoring stopped by user.")




# import asyncio
# import logging
# import os
# from telethon import TelegramClient, events
# from dotenv import load_dotenv

# # =========================
# # Load environment variables
# # =========================
# load_dotenv()
# API_ID = int(os.getenv("TELEGRAM_API_ID"))
# API_HASH = os.getenv("TELEGRAM_API_HASH")

# # =========================
# # Logging setup
# # =========================
# logging.basicConfig(
#     level=logging.INFO,
#     format="%(asctime)s - %(levelname)s - %(message)s"
# )
# logger = logging.getLogger("UserMonitor")

# # =========================
# # Initialize client (USER)
# # =========================
# client = TelegramClient("user_monitor_session", API_ID, API_HASH)

# # =========================
# # Load slang/emoji lists
# # =========================
# def load_list(file_path):
#     try:
#         with open(file_path, "r", encoding="utf-8") as f:
#             return [line.strip() for line in f if line.strip()]
#     except FileNotFoundError:
#         logger.warning(f"{file_path} not found, skipping.")
#         return []

# SLANG_WORDS = load_list("slang.txt")
# EMOJIS = load_list("emoji.txt")

# # =========================
# # Alerts
# # =========================
# ALERT_LOG = "alerts.log"
# alert_counts = {}

# def log_alert(chat_title, message, trigger):
#     count = alert_counts.get(chat_title, 0) + 1
#     alert_counts[chat_title] = count

#     log_entry = (
#         f"[ALERT] Group: {chat_title} | "
#         f"Trigger: {trigger} | "
#         f"Message: {message} | "
#         f"Total Flags in this Group: {count}\n"
#     )

#     with open(ALERT_LOG, "a", encoding="utf-8") as f:
#         f.write(log_entry)

#     logger.warning(log_entry.strip())

# # =========================
# # Monitor messages
# # =========================
# @client.on(events.NewMessage())
# async def handler(event):
#     if not (event.is_group or event.is_channel):
#         return  # Ignore private chats

#     chat = await event.get_chat()
#     chat_title = getattr(chat, "title", "Unknown Chat")
#     text = event.message.message or ""

#     # Check slang words
#     for slang in SLANG_WORDS:
#         if slang in text:
#             log_alert(chat_title, text, slang)
#             return

#     # Check emojis
#     for emoji in EMOJIS:
#         if emoji in text:
#             log_alert(chat_title, text, emoji)
#             return

# # =========================
# # Main
# # =========================
# async def main():
#     logger.info("🚀 Starting USER client (manual login required first time)...")
#     await client.start()  # will ask phone + code first run only

#     dialogs = await client.get_dialogs()
#     logger.info("✅ Monitoring groups/channels you already joined:")
#     for d in dialogs:
#         if d.is_group or d.is_channel:
#             logger.info(f"   - {d.title}")

#     logger.info("⚡ Ready! Waiting for suspicious messages...")
#     await client.run_until_disconnected()

# if __name__ == "__main__":
#     try:
#         asyncio.run(main())
#     except KeyboardInterrupt:
#         logger.info("🛑 Monitoring stopped by user.")


import asyncio
import logging
import os
from telegram.client import Telegram

# -------------------- Logging --------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),  # console
        logging.FileHandler("alert.log", encoding="utf-8")  # alerts log
    ]
)

# -------------------- Environment Variables --------------------
API_ID = int(os.getenv("API_ID", "123456"))     # fallback value if not set
API_HASH = os.getenv("API_HASH", "your_api_hash_here")
PHONE = os.getenv("PHONE", "+911234567890")

# -------------------- Load Slang + Emoji --------------------
def load_list(filename):
    """Load words/symbols from a file, one per line"""
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            return [line.strip() for line in f if line.strip()]
    return []

slangs = load_list("slang.txt")
emojis = load_list("emoji.txt")

logging.info(f"Loaded {len(slangs)} slang words and {len(emojis)} emojis")

# -------------------- TDLib Client --------------------
tg = Telegram(
    api_id=API_ID,
    api_hash=API_HASH,
    phone=PHONE,
    database_encryption_key="super_secret_key",
    files_directory="./tdlib_files",
)

# -------------------- Handlers --------------------
async def handle_update(update):
    if update["@type"] == "updateNewMessage":
        message = update["message"]
        chat_id = message["chat_id"]
        sender_id = message["sender_id"]

        if "content" in message and message["content"]["@type"] == "messageText":
            text = message["content"]["text"]["text"]

            # Log the message normally
            logging.info(f"[Chat: {chat_id}] [Sender: {sender_id}] -> {text}")

            # --- Check for slangs ---
            triggered_slangs = [s for s in slangs if s.lower() in text.lower()]

            # --- Check for emojis ---
            triggered_emojis = [e for e in emojis if e in text]

            # If anything suspicious -> write to alert.log
            if triggered_slangs or triggered_emojis:
                alert_msg = (
                    f"🚨 ALERT in Chat {chat_id} by Sender {sender_id}:\n"
                    f"Message: {text}\n"
                )
                if triggered_slangs:
                    alert_msg += f"⚠️ Slangs detected: {', '.join(triggered_slangs)}\n"
                if triggered_emojis:
                    alert_msg += f"😈 Emojis detected: {', '.join(triggered_emojis)}\n"

                logging.warning(alert_msg)

# -------------------- Main --------------------
async def main():
    await tg.login()
    logging.info("✅ Logged in and monitoring groups...")

    async for update in tg.updates:
        await handle_update(update)

if __name__ == "__main__":
    asyncio.run(main())