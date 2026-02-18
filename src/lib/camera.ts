import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export async function ensureCameraPermission(): Promise<boolean> {
  if (!(Capacitor.isNativePlatform && Capacitor.isNativePlatform())) return true;

  const { camera } = await Camera.requestPermissions({ permissions: ['camera'] });
  return camera === 'granted' || camera === 'limited';
}

export async function takePhotoFile(): Promise<File> {
  const allowed = await ensureCameraPermission();
  if (!allowed) {
    throw new Error('Izin kamera ditolak. Aktifkan izin kamera di pengaturan aplikasi.');
  }

  const photo = await Camera.getPhoto({
    source: CameraSource.Camera,
    resultType: CameraResultType.Uri,
    quality: 85,
    saveToGallery: false,
  });

  if (!photo.webPath) {
    throw new Error('Gagal mengambil foto.');
  }

  const res = await fetch(photo.webPath);
  const blob = await res.blob();
  const ext = blob.type.includes('png') ? 'png' : 'jpg';
  const fileName = `photo-${Date.now()}.${ext}`;
  return new File([blob], fileName, { type: blob.type || 'image/jpeg' });
}

