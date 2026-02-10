import { readFile, writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
const LOG_FILE = './.debug.log';
export async function readLogs() {
    try {
        if (!existsSync(LOG_FILE))
            return '';
        return await readFile(LOG_FILE, 'utf-8');
    }
    catch {
        return '';
    }
}
export async function clearLogs() {
    await writeFile(LOG_FILE, '');
}
export async function deleteLogFile() {
    if (existsSync(LOG_FILE)) {
        await unlink(LOG_FILE);
    }
}
