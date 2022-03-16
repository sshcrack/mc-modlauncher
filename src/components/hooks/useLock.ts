import { useEffect, useState } from 'react';

export function useLock() {
    const { lock: lockApi } = window.api
    const { lock, unlock, isLocked: lockedCheck } = lockApi
    const [ isLocked, setLocked] = useState(() => lockedCheck())

    useEffect(() => {
        lockApi.addLockListener((lock, prog) => {
            console.log("Setting locked")
            setLocked({
                locked: lock,
                progress: prog
            })
        })
    }, [])


    return { unlock, lock, progress: isLocked.progress, isLocked: isLocked.locked }
}