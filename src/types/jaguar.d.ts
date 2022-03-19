
declare module 'jaguar' {
    import TypedEventEmitter from "typed-emitter"

    /**
     * Packs a directory into a tar.gz file.
     * @param src Directory which contains files to be packed
     * @param dest String/Stream of archive
     * @param files Files that should be packed
     */
    export function pack(src: string, dest: string | WritableStream, files?: string[]): TypedEventEmitter<JaguarEvents>
    /**
     * Extracts a tar.gz file to a directory.
     * @param archive Path to archive
     * @param dest Desination of directory where files should be unpacked to
     */
    export function extract(archive: string, dest: string): TypedEventEmitter<JaguarEvents>

    export interface JaguarEvents {
        /** Emitted when a new file is finished with processing */
        file: (file: string) => void,
        /** Emitted on start of operation */
        start: () => void,
        /** When the operation failed */
        error: (err: Error) => void,
        /** Emitted when operation is done */
        end: () => void,
        /** Progress from 0 to 100 */
        progress: (prog: number) => void
    }
}