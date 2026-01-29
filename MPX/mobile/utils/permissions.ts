import { Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

/**
 * Request storage permissions for accessing audio files on Android.
 * Returns true if permission is granted, false otherwise.
 */
export async function requestStoragePermission(): Promise<boolean> {
  // Only Android requires runtime permissions
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting storage permission:', error);
    return false;
  }
}

/**
 * Check if storage permission is already granted.
 */
export async function checkStoragePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const { status } = await MediaLibrary.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking storage permission:', error);
    return false;
  }
}
