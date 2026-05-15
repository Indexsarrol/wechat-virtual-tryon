export function shouldDeleteImage(image: { expiresAt: Date }, now: Date) {
  const expiresAtTime = image.expiresAt.getTime();

  if (Number.isNaN(expiresAtTime)) {
    return true;
  }

  return expiresAtTime <= now.getTime();
}
