export async function getExeca() {
    return (await import("execa")).execa
}