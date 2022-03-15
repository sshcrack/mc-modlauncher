import getFolderSize from "fast-folder-size";
import { copy } from 'fs-extra';
import prettyBytes from 'pretty-bytes';
import { MainLogger } from '../../interfaces/mainLogger';
import { Progress } from '../InstallManager/event/interface';
const logger = MainLogger.get("Backend", "Main")

export function dirSize(directory: string): Promise<number> {
    return new Promise((resolve, reject) => {
        logger.log("Getting folder size of", directory, "...")
        getFolderSize(directory, (err, bytes) => {
            if(err)
                return reject(err)

            logger.log("Folder size of", directory, "is", prettyBytes(bytes))
            resolve(bytes)
        })
    });
}

export async function moveDirectory({ src, dest, onUpdate, interval = 1000 }: MoveDirectoryProps) {
    const srcSize = await dirSize(src);
    let done = false
    intervalProgress(() => done, async () => {
        const destSize = await dirSize(dest);
        const progress = destSize / srcSize;

        onUpdate({
            percent: progress,
            status: "Moving files..."
        })
    }, interval)

    await copy(src, dest)
    done = true
}

function intervalProgress(isDone: () => boolean, func: () => unknown, delay: number) {
    setTimeout(async () =>{
        if(isDone())
            return

        await func()
        intervalProgress(isDone, func, delay)
    }, delay)
}


export interface MoveDirectoryProps {
    src: string,
    dest: string,
    onUpdate: (progress: Progress) => void,
    interval?: number
}