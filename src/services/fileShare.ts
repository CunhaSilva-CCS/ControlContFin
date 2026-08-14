import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function writeAndShareFile(filename: string, content: string, mimeType: string) {
  const file = new File(Paths.cache, filename);
  if (file.exists) {
    file.delete();
  }
  file.create();
  file.write(content);

  try {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, { mimeType });
    }
  } finally {
    // Best-effort: on iOS this only resolves once the share sheet is
    // dismissed, so deleting here is safe. On Android, shareAsync can
    // resolve as soon as the share intent is launched (before the target
    // app has actually read the file), so this cleanup is not fully
    // guaranteed there — the file is still overwritten/removed the next
    // time this filename is exported, at worst.
    if (file.exists) {
      file.delete();
    }
  }
}
