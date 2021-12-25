import { readdir, stat } from  "fs/promises"
import path from "path"

export async function dirSize(directory: string) {
    const files = await readdir(directory);
    const stats = files.map(file => stat(path.join(directory, file)));

    return (await Promise.all(stats)).reduce((accumulator, { size }) => accumulator + size, 0);
}