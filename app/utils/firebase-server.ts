import admin from "firebase-admin";


// Ensure Firebase Admin SDK is initialized only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

/**
 * Verifies a Firebase user authentication token (server-side only).
 * 
 * @param token The Firebase ID token (JWT) sent from the frontend.
 * @returns The user's UID if valid, otherwise `null`.
 */
export async function verifyFirebaseToken(token: string): Promise<string | null> {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid; // Firebase unique user ID
  } catch (error) {
    console.error("Firebase token verification error:", error);
    return null;
  }
}

export { admin };
