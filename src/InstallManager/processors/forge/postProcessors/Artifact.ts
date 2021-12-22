import path from "path";

export function stringToArtifact(descriptor: string): ArtifactData{
    const split = descriptor.split(":")

    const [ name, domain, version ] = split;
    const classifier = split.length > 3 ? split[3] : null;

    const lastIndex = split.length -1
    const lastElement = split[lastIndex]

    const ext = lastElement.includes("@") ? lastElement.split("@").pop() : "jar";

    const addition = classifier ? `-${classifier}` : ""
    const file = `${name}-${version}${addition}${ext}`

    const relativePath = `${domain.split(".").join("/")}/${name}/${version}/${file}`
    const absolutePath = path.resolve(relativePath)

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