import { useEffect, useState } from 'react';

export function useLock() {
    const { lock: lockApi } = window.api
    const { lock, unlock, isLocked: lockedCheck } = lockApi
    const [ isLocked, setLocked] = useState(() => lockedCheck())

    useEffect(() => {
        lockApi.addLockListener(lock => {
            console.log("Setting locked")
            setLocked(lock)
        })
    }, [])


    return { unlock, lock, isLocked }
}