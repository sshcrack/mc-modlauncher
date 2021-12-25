import fs from "fs";
import { VersionManifest } from '../../../General/versionManifest';
import { getVersionManifest } from '../../../General/mcBase';

export function getMinecraftClientUrl(mcVersion: string) {
    const manifestPath = getVersionManifest(mcVersion);
    const manifest: VersionManifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"))

    return manifest.downloads.client.url;
}