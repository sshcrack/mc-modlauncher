import path from "path";
import { getLibrariesDir } from '../../../General/mcBase';

export function stringToArtifact(descriptor: string): ArtifactData {
    const split = descriptor.split(":")

    const lastIndex = split.length -1
    const lastElement = split[lastIndex]

    let ext = "jar"
    if(lastElement.includes("@")) {
        const temp = lastElement.split("@")
        ext = temp.pop()

        split[lastIndex] = temp.join("@")
    }

    const [ domain, name, version ] = split
    const classifier = split.length > 3 ? split[3] : null;

    const addition = classifier ? `-${classifier}` : ""
    const file = `${name}-${version}${addition}.${ext}`

    const relativePath = `${domain.split(".").join("/")}/${name}/${version}/${file}`
    const launcherDir = getLibrariesDir();

    const absolutePath = path.resolve(path.join(launcherDir, relativePath))

    return {
        descriptor,
        name,
        domain,
        version,
        classifier,
        ext,
        file,
        path: absolutePath
    }
}

export interface ArtifactData {
    descriptor: string,
    name: string,
    domain: string,
    version: string,

    classifier?: string,
    ext: string,
    file: string
    path: string
}