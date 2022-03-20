import { MainGlobals } from '../../../../Globals/mainGlobals';
import { LinuxLauncherUnpacker } from './unpacker/linux';
import { WindowsLauncherUnpacker } from './unpacker/windows';

const os = MainGlobals.getOS()
export const  LauncherUnpacker = os === "Windows_NT" ? WindowsLauncherUnpacker : LinuxLauncherUnpacker