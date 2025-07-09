from django.core.mail import send_mail
from django.conf import settings as cfg

def send_reset_email(token, email):
    link = f"{cfg.FRONTEND_URL}/password-reset/confirm/?token={token}&email={email}"
    send_mail(
        "Password Reset Request",
        f"Click the link to reset your password: {link}",
        "noreply@tournament-platform.com",
        [email],
    )
