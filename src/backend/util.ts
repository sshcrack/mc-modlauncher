export async function getExeca() {
    return (await import("execa")).execa
}

export async function getExecaCommand() {
    return (await import("execa")).execaCommand
}