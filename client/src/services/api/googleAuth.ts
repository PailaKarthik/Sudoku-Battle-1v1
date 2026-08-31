import { GoogleSignin } from "@react-native-google-signin/google-signin";

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

let configured = false;

export function configureGoogleSignIn() {
  if (configured) {
    return;
  }

  if (!webClientId) {
    throw new Error("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is missing");
  }

  GoogleSignin.configure({
    webClientId,
  });

  configured = true;
}

export async function signInWithGoogle() {
  configureGoogleSignIn();

  await GoogleSignin.hasPlayServices({
    showPlayServicesUpdateDialog: true,
  });

  const result = await GoogleSignin.signIn();

  const idToken = result.data?.idToken;

  if (!idToken) {
    throw new Error("Google ID token was not returned");
  }

  return idToken;
}
