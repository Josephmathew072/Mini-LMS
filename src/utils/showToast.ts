import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';

export function showToast(title: string, message?: string) {
    console.log('Showing toast:', title, message);
  if (Platform.OS === 'web') {
    // fallback for web
    if (typeof window !== 'undefined') {
      // non-blocking fallback
      const div = document.createElement('div');
      div.innerText = `${title}${message ? `: ${message}` : ''}`;
      div.style.position = 'fixed';
      div.style.bottom = '20px';
      div.style.left = '20px';
      div.style.background = '#111';
      div.style.color = '#fff';
      div.style.padding = '10px 14px';
      div.style.borderRadius = '8px';
      div.style.zIndex = '9999';

      document.body.appendChild(div);
      setTimeout(() => div.remove(), 3000);
    }
    return;
  }

  // native (Android/iOS)
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
    position: 'bottom',
    visibilityTime: 3000,
  });
}