import { MainGlobals } from "../../../Globals/mainGlobals";
import { Downloader } from "../../InstallManager/processors/base/Downloader";
import { getJavaDownloaded } from "./file";

export class JavaDownloader extends Downloader {
  constructor() {
    super("", {} as any, {} as any, {
      destination: getJavaDownloaded(),
      overwrite: true,
      url: MainGlobals.javaDownloadUrl,
      messages: {
        downloading: "Downloading launcher..."
      }
    })
  }
}