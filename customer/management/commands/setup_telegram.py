from django.core.management.base import BaseCommand
from django.conf import settings
import requests

class Command(BaseCommand):
    help = 'Setup Telegram bot webhook'

    def add_arguments(self, parser):
        parser.add_argument(
            '--url',
            type=str,
            help='Your server URL (e.g., https://yourdomain.com)',
        )

    def handle(self, *args, **options):
        webhook_url = options.get('url')
        
        if not webhook_url:
            self.stdout.write(
                self.style.ERROR('Please provide your server URL using --url parameter')
            )
            self.stdout.write('Example: python manage.py setup_telegram --url https://yourdomain.com')
            return

        BOT_TOKEN = settings.TELEGRAM_BOT_TOKEN
        
        # Set webhook
        webhook_endpoint = f"{webhook_url}/customer/telegram-webhook/"
        api_url = f"https://api.telegram.org/bot{BOT_TOKEN}/setWebhook"
        
        response = requests.post(api_url, json={'url': webhook_endpoint})
        result = response.json()
        
        if result.get('ok'):
            self.stdout.write(
                self.style.SUCCESS(f'✅ Webhook set successfully to: {webhook_endpoint}')
            )
        else:
            self.stdout.write(
                self.style.ERROR(f'❌ Failed to set webhook: {result.get("description")}')
            )
        
        # Get webhook info
        info_url = f"https://api.telegram.org/bot{BOT_TOKEN}/getWebhookInfo"
        info_response = requests.get(info_url)
        webhook_info = info_response.json()
        
        self.stdout.write('\n📋 Current Webhook Info:')
        self.stdout.write(f"URL: {webhook_info.get('result', {}).get('url', 'Not set')}")
        self.stdout.write(f"Pending updates: {webhook_info.get('result', {}).get('pending_update_count', 0)}")
        
        # Get bot info
        bot_url = f"https://api.telegram.org/bot{BOT_TOKEN}/getMe"
        bot_response = requests.get(bot_url)
        bot_info = bot_response.json()
        
        if bot_info.get('ok'):
            bot_data = bot_info.get('result', {})
            self.stdout.write('\n🤖 Bot Info:')
            self.stdout.write(f"Username: @{bot_data.get('username')}")
            self.stdout.write(f"Name: {bot_data.get('first_name')}")
            self.stdout.write(f"\n🔗 Users can start the bot at: https://t.me/{bot_data.get('username')}")