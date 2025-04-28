declare global {
  interface Window {
    handleGoogleAuth: (response: any) => void;
    google: any;
  }
}

export {};
