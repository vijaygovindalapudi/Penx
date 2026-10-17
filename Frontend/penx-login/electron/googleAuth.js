import http from "http";
import crypto from "crypto";
import { shell } from "electron";

// ==========================================
// GOOGLE OAUTH CONFIGURATION
// ==========================================

// Google OAuth Client ID
const GOOGLE_CLIENT_ID =
  "322520585560-i2u1kime2pjes4k3rr5vap90intghprh.apps.googleusercontent.com";

// IMPORTANT:
// Put your actual Google OAuth client secret here locally.
// DO NOT SHARE THIS SECRET.
const GOOGLE_CLIENT_SECRET =
  process.env.PENX_GOOGLE_CLIENT_SECRET || "";
// ==========================================
// GOOGLE ENDPOINTS
// ==========================================

const GOOGLE_AUTH_URL =
  "https://accounts.google.com/o/oauth2/v2/auth";

const GOOGLE_TOKEN_URL =
  "https://oauth2.googleapis.com/token";

// ==========================================
// BASE64 URL ENCODING
// ==========================================

function base64Url(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// ==========================================
// PKCE CODE VERIFIER
// ==========================================

function createVerifier() {
  return base64Url(
    crypto.randomBytes(32)
  );
}

// ==========================================
// PKCE CODE CHALLENGE
// ==========================================

function createChallenge(verifier) {
  return base64Url(
    crypto
      .createHash("sha256")
      .update(verifier)
      .digest()
  );
}

// ==========================================
// OAUTH STATE
// ==========================================

function createState() {
  return base64Url(
    crypto.randomBytes(24)
  );
}

// ==========================================
// START GOOGLE LOGIN
// ==========================================

export async function startGoogleLogin() {
  // ========================================
  // VALIDATE CLIENT ID
  // ========================================

  if (!GOOGLE_CLIENT_ID) {
    throw new Error(
      "Google Client ID is not configured."
    );
  }

  // ========================================
  // VALIDATE CLIENT SECRET
  // ========================================

  if (
    !GOOGLE_CLIENT_SECRET ||
    GOOGLE_CLIENT_SECRET ===
      "PASTE_YOUR_GOOGLE_CLIENT_SECRET_HERE"
  ) {
    throw new Error(
      "Google Client Secret is not configured."
    );
  }

  console.log(
    "🔥 Google Client ID loaded successfully."
  );

  // ========================================
  // CREATE PKCE VALUES
  // ========================================

  const verifier =
    createVerifier();

  const challenge =
    createChallenge(verifier);

  const state =
    createState();

  // ========================================
  // CREATE LOCAL CALLBACK SERVER
  // ========================================

  const server =
    http.createServer();

  await new Promise(
    (resolve, reject) => {
      server.once(
        "error",
        reject
      );

      server.listen(
        0,
        "127.0.0.1",
        () => {
          server.removeListener(
            "error",
            reject
          );

          resolve();
        }
      );
    }
  );

  // ========================================
  // GET LOCAL SERVER ADDRESS
  // ========================================

  const address =
    server.address();

  if (
    !address ||
    typeof address === "string"
  ) {
    server.close();

    throw new Error(
      "Could not create OAuth callback."
    );
  }

  const redirectUri =
    `http://127.0.0.1:${address.port}/oauth2/callback`;

  console.log(
    "🔗 OAuth Redirect URI:",
    redirectUri
  );

  // ========================================
  // BUILD GOOGLE AUTHORIZATION URL
  // ========================================

  const params =
    new URLSearchParams({
      client_id:
        GOOGLE_CLIENT_ID,

      redirect_uri:
        redirectUri,

      response_type:
        "code",

      scope:
        "openid email profile",

      code_challenge:
        challenge,

      code_challenge_method:
        "S256",

      state,
    });

  const authUrl =
    `${GOOGLE_AUTH_URL}?${params.toString()}`;

  console.log(
    "🌐 Opening Google OAuth..."
  );

  // ========================================
  // OPEN SYSTEM BROWSER
  // ========================================

  await shell.openExternal(
    authUrl
  );

  // ========================================
  // WAIT FOR GOOGLE CALLBACK
  // ========================================

  const authorizationCode =
    await new Promise(
      (resolve, reject) => {
        const timeout =
          setTimeout(() => {
            server.close();

            reject(
              new Error(
                "Google login timed out."
              )
            );
          }, 5 * 60 * 1000);

        server.on(
          "request",
          (req, res) => {
            try {
              const url =
                new URL(
                  req.url,
                  "http://127.0.0.1"
                );

              // ==================================
              // IGNORE OTHER REQUESTS
              // ==================================

              if (
                url.pathname !==
                "/oauth2/callback"
              ) {
                res.writeHead(404);
                res.end();
                return;
              }

              // ==================================
              // GET GOOGLE RESPONSE
              // ==================================

              const error =
                url.searchParams.get(
                  "error"
                );

              const code =
                url.searchParams.get(
                  "code"
                );

              const returnedState =
                url.searchParams.get(
                  "state"
                );

              // ==================================
              // BROWSER RESPONSE
              // ==================================

              res.writeHead(200, {
                "Content-Type":
                  "text/html; charset=utf-8",
              });

              res.end(`
                <!doctype html>

                <html>
                  <head>
                    <title>
                      PenX Google Login
                    </title>
                  </head>

                  <body style="
                    margin: 0;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #07111f;
                    color: white;
                    font-family: Arial, sans-serif;
                  ">

                    <div style="
                      text-align: center;
                      padding: 40px;
                    ">

                      <h1 style="
                        margin-bottom: 12px;
                      ">
                        PenX
                      </h1>

                      <p>
                        ${
                          error
                            ? "Google authentication failed."
                            : "Google authentication successful."
                        }
                      </p>

                      <p style="
                        color: #8ea0b8;
                        font-size: 14px;
                      ">
                        You can close this window.
                      </p>

                    </div>

                  </body>
                </html>
              `);

              clearTimeout(
                timeout
              );

              server.close();

              // ==================================
              // GOOGLE ERROR
              // ==================================

              if (error) {
                reject(
                  new Error(
                    `Google authentication failed: ${error}`
                  )
                );

                return;
              }

              // ==================================
              // VERIFY STATE
              // ==================================

              if (
                returnedState !==
                state
              ) {
                reject(
                  new Error(
                    "Invalid Google OAuth state."
                  )
                );

                return;
              }

              // ==================================
              // VERIFY AUTHORIZATION CODE
              // ==================================

              if (!code) {
                reject(
                  new Error(
                    "Google did not return an authorization code."
                  )
                );

                return;
              }

              resolve(code);

            } catch (error) {
              clearTimeout(
                timeout
              );

              server.close();

              reject(error);
            }
          }
        );
      }
    );

  // ========================================
  // EXCHANGE AUTHORIZATION CODE FOR TOKENS
  // ========================================

  console.log(
    "🔄 Exchanging Google authorization code..."
  );

  const tokenBody =
    new URLSearchParams({
      client_id:
        GOOGLE_CLIENT_ID,

      // IMPORTANT FIX
      client_secret:
        GOOGLE_CLIENT_SECRET,

      code:
        authorizationCode,

      code_verifier:
        verifier,

      redirect_uri:
        redirectUri,

      grant_type:
        "authorization_code",
    });

  // ========================================
  // REQUEST GOOGLE TOKENS
  // ========================================

  const response =
    await fetch(
      GOOGLE_TOKEN_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },

        body: tokenBody,
      }
    );

  // ========================================
  // READ RESPONSE
  // ========================================

  const data =
    await response.json();

  // ========================================
  // HANDLE TOKEN ERROR
  // ========================================

  if (!response.ok) {
    console.error(
      "❌ Google token error:",
      data
    );

    throw new Error(
      data?.error_description ||
        data?.error ||
        "Google token exchange failed."
    );
  }

  // ========================================
  // CHECK ID TOKEN
  // ========================================

  if (!data.id_token) {
    throw new Error(
      "Google did not return an ID token."
    );
  }

  console.log(
    "✅ Google ID token received."
  );

  // ========================================
  // RETURN GOOGLE RESULT
  // ========================================

  return {
    success: true,

    idToken:
      data.id_token,

    accessToken:
      data.access_token || null,
  };
}