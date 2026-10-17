"""
Email service for PenX.
"""

from fastapi_mail import (
    FastMail,
    MessageSchema,
    ConnectionConfig,
    MessageType,
)

from app.core.config import settings


# ======================================================
# Email Configuration
# ======================================================

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=True,
)


class EmailService:
    """
    Email service for PenX.

    Handles:
    - OTP emails
    - Welcome emails
    """

    # ==================================================
    # OTP Email
    # ==================================================

    @staticmethod
    async def send_otp_email(
        email: str,
        otp: str,
    ) -> None:
        """
        Send OTP verification email.
        """

        message = MessageSchema(
            subject="PenX Verification Code",
            recipients=[email],
            body=f"""
Hello,

Your PenX verification code is:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{otp}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This verification code is valid for 5 minutes.

If you did not request this verification code,
please ignore this email.

Regards,

PenX Security Team
""",
            subtype=MessageType.plain,
        )

        try:

            fm = FastMail(conf)

            await fm.send_message(
                message
            )

        except Exception as exc:

            raise ValueError(
                "Unable to send OTP email."
            ) from exc

    # ==================================================
    # Welcome Email
    # ==================================================

    @staticmethod
    async def send_welcome_email(
        email: str,
        full_name: str,
        username: str,
        penx_id: str,
    ) -> None:
        """
        Send personalized welcome email
        after successful registration.
        """

        # ------------------------------------------------
        # HTML Welcome Email
        # ------------------------------------------------

        html_body = f"""
<!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Welcome to PenX</title>

</head>

<body
    style="
        margin:0;
        padding:0;
        background:#07111f;
        font-family:Arial, Helvetica, sans-serif;
        color:#e5f3ff;
    "
>

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        background:#07111f;
        padding:40px 15px;
    "
>

<tr>

<td align="center">

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        max-width:620px;
        background:#0b1728;
        border:1px solid #19314d;
        border-radius:18px;
        overflow:hidden;
    "
>

<!-- ==================================================
     Header
     ================================================== -->

<tr>

<td
    style="
        padding:38px 35px 28px;
        text-align:center;
        background:#0a1525;
    "
>

<div
    style="
        display:inline-block;
        padding:10px 18px;
        border:1px solid #1f4b70;
        border-radius:30px;
        color:#55d9ff;
        font-size:13px;
        letter-spacing:2px;
        font-weight:bold;
    "
>
    PENX
</div>

<h1
    style="
        margin:25px 0 10px;
        font-size:30px;
        line-height:1.25;
        color:#ffffff;
    "
>
    Welcome to PenX, {username}.
</h1>

<p
    style="
        margin:0;
        color:#8fa8bd;
        font-size:15px;
        line-height:1.7;
    "
>
    Your private digital space is ready.
</p>

</td>

</tr>


<!-- ==================================================
     Main Message
     ================================================== -->

<tr>

<td
    style="
        padding:38px 35px;
    "
>

<p
    style="
        margin:0 0 20px;
        font-size:16px;
        line-height:1.8;
        color:#dcecff;
    "
>
    Hello <strong>{full_name}</strong>,
</p>

<p
    style="
        margin:0 0 20px;
        font-size:15px;
        line-height:1.9;
        color:#a9bed1;
    "
>
    Thank you for choosing PenX.
</p>

<p
    style="
        margin:0 0 20px;
        font-size:15px;
        line-height:1.9;
        color:#a9bed1;
    "
>
    There are many places where you could keep
    your digital world. The fact that you chose
    PenX means something to us.
</p>

<p
    style="
        margin:0 0 20px;
        font-size:15px;
        line-height:1.9;
        color:#a9bed1;
    "
>
    The files you keep are not simply files.
    They can be memories, ideas, work, projects,
    documents, and pieces of your life that
    deserve to be protected.
</p>

<p
    style="
        margin:0 0 28px;
        font-size:15px;
        line-height:1.9;
        color:#a9bed1;
    "
>
    We understand that trust.
    And we do not take it lightly.
</p>


<!-- ==================================================
     Identity Card
     ================================================== -->

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        background:#071321;
        border:1px solid #1a3852;
        border-radius:14px;
        margin:25px 0 30px;
    "
>

<tr>

<td
    style="
        padding:24px;
    "
>

<p
    style="
        margin:0 0 18px;
        color:#55d9ff;
        font-size:13px;
        font-weight:bold;
        letter-spacing:1.5px;
    "
>
    YOUR PENX IDENTITY
</p>

<p
    style="
        margin:0 0 12px;
        color:#8199ad;
        font-size:13px;
    "
>
    Username
</p>

<p
    style="
        margin:0 0 20px;
        color:#ffffff;
        font-size:17px;
        font-weight:bold;
    "
>
    {username}
</p>

<p
    style="
        margin:0 0 12px;
        color:#8199ad;
        font-size:13px;
    "
>
    PenX ID
</p>

<p
    style="
        margin:0;
        color:#55d9ff;
        font-size:16px;
        font-weight:bold;
        letter-spacing:1px;
        word-break:break-all;
    "
>
    {penx_id}
</p>

</td>

</tr>

</table>


<!-- ==================================================
     Promise
     ================================================== -->

<p
    style="
        margin:0 0 20px;
        font-size:18px;
        line-height:1.6;
        color:#ffffff;
        font-weight:bold;
    "
>
    PenX is more than a place to store your files.
</p>

<p
    style="
        margin:0 0 28px;
        font-size:15px;
        line-height:1.9;
        color:#a9bed1;
    "
>
    It is a promise to protect what you choose
    to keep.
</p>


<!-- ==================================================
     Next Steps
     ================================================== -->

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        margin-bottom:30px;
    "
>

<tr>

<td
    style="
        padding:20px 0;
        border-top:1px solid #183047;
        border-bottom:1px solid #183047;
    "
>

<p
    style="
        margin:0 0 16px;
        color:#ffffff;
        font-size:15px;
        font-weight:bold;
    "
>
    Your PenX journey starts here.
</p>

<p
    style="
        margin:0;
        color:#91a8bb;
        font-size:14px;
        line-height:1.9;
    "
>
    • Secure your PenX device<br>
    • Create your encrypted vault<br>
    • Protect your important files<br>
    • Keep your digital world under your control
</p>

</td>

</tr>

</table>


<!-- ==================================================
     Dashboard Button
     ================================================== -->

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
>

<tr>

<td align="center">

<a
    href="http://localhost:5173/dashboard"
    style="
        display:inline-block;
        padding:14px 28px;
        background:#55d9ff;
        color:#03101b;
        text-decoration:none;
        border-radius:9px;
        font-size:14px;
        font-weight:bold;
    "
>
    Open My PenX Dashboard →
</a>

</td>

</tr>

</table>


<!-- ==================================================
     Closing
     ================================================== -->

<p
    style="
        margin:35px 0 0;
        font-size:15px;
        line-height:1.9;
        color:#a9bed1;
    "
>
    Wherever your journey takes you,
    we're glad PenX gets to be a small part of it.
</p>

<p
    style="
        margin:20px 0 0;
        font-size:15px;
        line-height:1.9;
        color:#a9bed1;
    "
>
    Thank you for being part of PenX.
</p>

<p
    style="
        margin:8px 0 0;
        font-size:16px;
        color:#ffffff;
        font-weight:bold;
    "
>
    Welcome to your private space. 💙
</p>

</td>

</tr>


<!-- ==================================================
     Footer
     ================================================== -->

<tr>

<td
    style="
        padding:24px 35px;
        background:#081421;
        border-top:1px solid #183047;
        text-align:center;
    "
>

<p
    style="
        margin:0 0 8px;
        color:#6f879a;
        font-size:12px;
        line-height:1.6;
    "
>
    This email was sent because you created
    a PenX account.
</p>

<p
    style="
        margin:0;
        color:#506779;
        font-size:11px;
    "
>
    PenX Security Team
</p>

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
"""

        # ------------------------------------------------
        # Email Message
        # ------------------------------------------------

        message = MessageSchema(
            subject=(
                f"Welcome to PenX, {username} 💙"
            ),
            recipients=[email],
            body=html_body,
            subtype=MessageType.html,
        )

        # ------------------------------------------------
        # Send Email
        # ------------------------------------------------

        try:

            fm = FastMail(conf)

            await fm.send_message(
                message
            )

        except Exception as exc:

            raise ValueError(
                "Unable to send welcome email."
            ) from exc

            # ==================================================
    # Google Login Security Email
    # ==================================================

    @staticmethod
    async def send_google_login_alert(
        email: str,
        full_name: str,
    ) -> None:
        """
        Send a security notification after
        successful Google authentication.
        """

        html_body = f"""
<!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>PenX Security Alert</title>

</head>

<body
    style="
        margin:0;
        padding:0;
        background:#07111f;
        font-family:Arial, Helvetica, sans-serif;
        color:#e5f3ff;
    "
>

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        background:#07111f;
        padding:40px 15px;
    "
>

<tr>

<td align="center">

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        max-width:620px;
        background:#0b1728;
        border:1px solid #19314d;
        border-radius:18px;
        overflow:hidden;
    "
>

<!-- HEADER -->

<tr>

<td
    style="
        padding:38px 35px 28px;
        text-align:center;
        background:#0a1525;
    "
>

<div
    style="
        display:inline-block;
        padding:10px 18px;
        border:1px solid #1f4b70;
        border-radius:30px;
        color:#55d9ff;
        font-size:13px;
        letter-spacing:2px;
        font-weight:bold;
    "
>
    PENX
</div>

<h1
    style="
        margin:25px 0 10px;
        font-size:28px;
        line-height:1.3;
        color:#ffffff;
    "
>
    New sign-in detected
</h1>

<p
    style="
        margin:0;
        color:#8fa8bd;
        font-size:15px;
        line-height:1.7;
    "
>
    A Google sign-in was completed on your PenX account.
</p>

</td>

</tr>


<!-- CONTENT -->

<tr>

<td
    style="
        padding:38px 35px;
    "
>

<p
    style="
        margin:0 0 20px;
        font-size:16px;
        line-height:1.8;
        color:#dcecff;
    "
>
    Hello <strong>{full_name}</strong>,
</p>

<p
    style="
        margin:0 0 24px;
        font-size:15px;
        line-height:1.9;
        color:#a9bed1;
    "
>
    Your PenX account was successfully accessed
    using Google authentication.
</p>


<!-- SECURITY CARD -->

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        background:#071321;
        border:1px solid #1a3852;
        border-radius:14px;
        margin:25px 0 30px;
    "
>

<tr>

<td
    style="
        padding:24px;
    "
>

<p
    style="
        margin:0 0 18px;
        color:#55d9ff;
        font-size:13px;
        font-weight:bold;
        letter-spacing:1.5px;
    "
>
    SIGN-IN DETAILS
</p>

<p
    style="
        margin:0 0 8px;
        color:#8199ad;
        font-size:13px;
    "
>
    Authentication method
</p>

<p
    style="
        margin:0 0 20px;
        color:#ffffff;
        font-size:16px;
        font-weight:bold;
    "
>
    Google
</p>

<p
    style="
        margin:0 0 8px;
        color:#8199ad;
        font-size:13px;
    "
>
    Account
</p>

<p
    style="
        margin:0;
        color:#55d9ff;
        font-size:15px;
        font-weight:bold;
        word-break:break-all;
    "
>
    {email}
</p>

</td>

</tr>

</table>


<p
    style="
        margin:0 0 18px;
        font-size:15px;
        line-height:1.9;
        color:#a9bed1;
    "
>
    If this was you, no action is required.
</p>

<p
    style="
        margin:0;
        font-size:15px;
        line-height:1.9;
        color:#a9bed1;
    "
>
    If you do not recognize this activity,
    please secure your PenX account immediately.
</p>

</td>

</tr>


<!-- FOOTER -->

<tr>

<td
    style="
        padding:24px 35px;
        background:#081421;
        border-top:1px solid #183047;
        text-align:center;
    "
>

<p
    style="
        margin:0 0 8px;
        color:#6f879a;
        font-size:12px;
        line-height:1.6;
    "
>
    This email was sent because a Google sign-in
    occurred on your PenX account.
</p>

<p
    style="
        margin:0;
        color:#506779;
        font-size:11px;
    "
>
    PenX Security Team
</p>

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
"""

        message = MessageSchema(
            subject="New Google Sign-In — PenX Security",
            recipients=[email],
            body=html_body,
            subtype=MessageType.html,
        )

        try:

            fm = FastMail(conf)

            await fm.send_message(
                message
            )

        except Exception as exc:

            print(
                "❌ Google login email error:",
                exc,
            )

            raise ValueError(
                "Unable to send Google login security email."
            ) from exc
    # ==================================================
    # New Login Security Alert
    # ==================================================

    @staticmethod
    async def send_login_security_alert(
        email: str,
        full_name: str,
        ip_address: str | None = None,
        location: str | None = None,
        device_name: str | None = None,
        browser: str | None = None,
        login_time: str | None = None,
        action_token: str | None = None,
    ) -> None:
        """
        Send a security notification after a new login.
        """

        ip_text = ip_address or "Not available"
        location_text = location or "Location unavailable"
        device_text = device_name or "Unknown device"
        browser_text = browser or "Unknown browser"
        time_text = login_time or "Just now"

        html_body = f"""
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport"
                content="width=device-width, initial-scale=1.0">
            <title>New Login Detected</title>
        </head>

        <body style="
            margin:0;
            padding:0;
            background:#07111f;
            font-family:Arial, Helvetica, sans-serif;
            color:#e5f3ff;
        ">

            <table width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                    background:#07111f;
                    padding:40px 15px;
                ">

                <tr>
                    <td align="center">

                        <table width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            style="
                                max-width:620px;
                                background:#0b1728;
                                border:1px solid #19314d;
                                border-radius:18px;
                                overflow:hidden;
                            ">

                            <!-- HEADER -->

                            <tr>
                                <td style="
                                    padding:38px 35px 28px;
                                    text-align:center;
                                    background:#0a1525;
                                ">

                                    <div style="
                                        display:inline-block;
                                        padding:10px 18px;
                                        border:1px solid #1f4b70;
                                        border-radius:30px;
                                        color:#55d9ff;
                                        font-size:13px;
                                        letter-spacing:2px;
                                        font-weight:bold;
                                    ">
                                        PENX
                                    </div>

                                    <h1 style="
                                        margin:25px 0 10px;
                                        font-size:28px;
                                        color:#ffffff;
                                    ">
                                        New Login Detected
                                    </h1>

                                    <p style="
                                        margin:0;
                                        color:#8fa8bd;
                                        font-size:15px;
                                    ">
                                        A new login to your PenX account
                                        was detected.
                                    </p>

                                </td>
                            </tr>

                            <!-- CONTENT -->

                            <tr>
                                <td style="
                                    padding:38px 35px;
                                ">

                                    <p style="
                                        margin:0 0 20px;
                                        font-size:16px;
                                        color:#dcecff;
                                    ">
                                        Hello <strong>{full_name}</strong>,
                                    </p>

                                    <p style="
                                        margin:0 0 25px;
                                        font-size:15px;
                                        line-height:1.8;
                                        color:#a9bed1;
                                    ">
                                        Someone just signed in to your
                                        PenX account. Review the details
                                        below.
                                    </p>

                                    <!-- SECURITY CARD -->

                                    <table width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                        style="
                                            background:#071321;
                                            border:1px solid #1a3852;
                                            border-radius:14px;
                                            margin:25px 0 30px;
                                        ">

                                        <tr>
                                            <td style="padding:24px;">

                                                <p style="
                                                    margin:0 0 18px;
                                                    color:#55d9ff;
                                                    font-size:13px;
                                                    font-weight:bold;
                                                    letter-spacing:1.5px;
                                                ">
                                                    SIGN-IN DETAILS
                                                </p>

                                                <p style="
                                                    color:#8199ad;
                                                    font-size:13px;
                                                ">
                                                    Device
                                                </p>

                                                <p style="
                                                    color:#ffffff;
                                                    font-size:15px;
                                                    font-weight:bold;
                                                ">
                                                    {device_text}
                                                </p>

                                                <p style="
                                                    color:#8199ad;
                                                    font-size:13px;
                                                ">
                                                    IP Address
                                                </p>

                                                <p style="
                                                    color:#ffffff;
                                                    font-size:15px;
                                                ">
                                                    {ip_text}
                                                </p>

                                                <p style="
                                                    color:#8199ad;
                                                    font-size:13px;
                                                ">
                                                    Location
                                                </p>

                                                <p style="
                                                    color:#ffffff;
                                                    font-size:15px;
                                                ">
                                                    {location_text}
                                                </p>

                                                <p style="
                                                    color:#8199ad;
                                                    font-size:13px;
                                                ">
                                                    Browser
                                                </p>

                                                <p style="
                                                    color:#ffffff;
                                                    font-size:15px;
                                                ">
                                                    {browser_text}
                                                </p>

                                                <p style="
                                                    color:#8199ad;
                                                    font-size:13px;
                                                ">
                                                    Time
                                                </p>

                                                <p style="
                                                    color:#ffffff;
                                                    font-size:15px;
                                                ">
                                                    {time_text}
                                                </p>

                                            </td>
                                        </tr>

                                    </table>

                                    <p style="
                                        margin:0 0 18px;
                                        font-size:15px;
                                        color:#a9bed1;
                                        line-height:1.8;
                                    ">
                                        If this was you, you can safely
                                        confirm the login from your PenX
                                        Security settings.
                                    </p>

                                    <p style="
                                        margin:0;
                                        font-size:15px;
                                        color:#a9bed1;
                                        line-height:1.8;
                                    ">
                                        If you do not recognize this
                                        activity, reject the login and
                                        secure your account immediately.
                                    </p>

                                </td>
                            </tr>

                            <!-- FOOTER -->

                            <tr>
                                <td style="
                                    padding:24px 35px;
                                    background:#081421;
                                    border-top:1px solid #183047;
                                    text-align:center;
                                ">

                                    <p style="
                                        margin:0 0 8px;
                                        color:#6f879a;
                                        font-size:12px;
                                    ">
                                        This email was sent because a
                                        new login occurred on your
                                        PenX account.
                                    </p>

                                    <p style="
                                        margin:0;
                                        color:#506779;
                                        font-size:11px;
                                    ">
                                        PenX Security Team
                                    </p>

                                </td>
                            </tr>

                        </table>

                    </td>
                </tr>

            </table>

        </body>
        </html>
        """

        message = MessageSchema(
            subject="New Login Detected — PenX Security",
            recipients=[email],
            body=html_body,
            subtype=MessageType.html,
        )

        try:

            fm = FastMail(conf)

            await fm.send_message(
                message
            )

            print(
                "📧 Login security alert sent:",
                email,
            )

        except Exception as exc:

            print(
                "❌ Login security alert error:",
                exc,
            )

            raise ValueError(
                "Unable to send login security alert."
            ) from exc
    # ==================================================
    # Password Changed Security Email
    # ==================================================

    @staticmethod
    async def send_password_changed_email(
        email: str,
        full_name: str,
    ) -> None:
        """
        Send a security notification after
        successful password reset.
        """

        html_body = f"""
<!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>PenX Password Changed</title>

</head>

<body
    style="
        margin:0;
        padding:0;
        background:#07111f;
        font-family:Arial, Helvetica, sans-serif;
        color:#e5f3ff;
    "
>

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        background:#07111f;
        padding:40px 15px;
    "
>

<tr>

<td align="center">

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        max-width:620px;
        background:#0b1728;
        border:1px solid #19314d;
        border-radius:18px;
        overflow:hidden;
    "
>

<!-- HEADER -->

<tr>

<td
    style="
        padding:38px 35px 28px;
        text-align:center;
        background:#0a1525;
    "
>

<div
    style="
        display:inline-block;
        padding:10px 18px;
        border:1px solid #1f4b70;
        border-radius:30px;
        color:#55d9ff;
        font-size:13px;
        letter-spacing:2px;
        font-weight:bold;
    "
>
    PENX
</div>

<h1
    style="
        margin:25px 0 10px;
        font-size:28px;
        line-height:1.3;
        color:#ffffff;
    "
>
    Password changed successfully
</h1>

<p
    style="
        margin:0;
        color:#8fa8bd;
        font-size:15px;
        line-height:1.7;
    "
>
    Your PenX account password has been updated.
</p>

</td>

</tr>


<!-- CONTENT -->

<tr>

<td
    style="
        padding:38px 35px;
    "
>

<p
    style="
        margin:0 0 20px;
        font-size:16px;
        line-height:1.8;
        color:#dcecff;
    "
>
    Hello <strong>{full_name}</strong>,
</p>

<p
    style="
        margin:0 0 24px;
        font-size:15px;
        line-height:1.9;
        color:#a9bed1;
    "
>
    Your PenX account password was successfully
    changed through the password recovery process.
</p>


<!-- SECURITY CARD -->

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        background:#071321;
        border:1px solid #1a3852;
        border-radius:14px;
        margin:25px 0 30px;
    "
>

<tr>

<td
    style="
        padding:24px;
    "
>

<p
    style="
        margin:0 0 18px;
        color:#55d9ff;
        font-size:13px;
        font-weight:bold;
        letter-spacing:1.5px;
    "
>
    SECURITY UPDATE
</p>

<p
    style="
        margin:0 0 8px;
        color:#8199ad;
        font-size:13px;
    "
>
    Account
</p>

<p
    style="
        margin:0 0 20px;
        color:#ffffff;
        font-size:16px;
        font-weight:bold;
        word-break:break-all;
    "
>
    {email}
</p>

<p
    style="
        margin:0 0 8px;
        color:#8199ad;
        font-size:13px;
    "
>
    Status
</p>

<p
    style="
        margin:0;
        color:#55d9ff;
        font-size:16px;
        font-weight:bold;
    "
>
    Password Updated
</p>

</td>

</tr>

</table>


<p
    style="
        margin:0 0 18px;
        font-size:15px;
        line-height:1.9;
        color:#a9bed1;
    "
>
    If you made this change, no further action is required.
</p>

<p
    style="
        margin:0;
        font-size:15px;
        line-height:1.9;
        color:#a9bed1;
    "
>
    If you did not make this change, please secure
    your PenX account immediately.
</p>

</td>

</tr>


<!-- FOOTER -->

<tr>

<td
    style="
        padding:24px 35px;
        background:#081421;
        border-top:1px solid #183047;
        text-align:center;
    "
>

<p
    style="
        margin:0 0 8px;
        color:#6f879a;
        font-size:12px;
        line-height:1.6;
    "
>
    This email was sent because your PenX
    account password was changed.
</p>

<p
    style="
        margin:0;
        color:#506779;
        font-size:11px;
    "
>
    PenX Security Team
</p>

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
"""

        message = MessageSchema(
            subject="Password Changed — PenX Security",
            recipients=[email],
            body=html_body,
            subtype=MessageType.html,
        )

        try:

            fm = FastMail(conf)

            await fm.send_message(
                message
            )

        except Exception as exc:

            print(
                "❌ Password changed email error:",
                exc,
            )

            raise ValueError(
                "Unable to send password changed security email."
            ) from exc