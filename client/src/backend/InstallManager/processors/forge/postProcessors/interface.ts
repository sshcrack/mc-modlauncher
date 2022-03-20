import { SharedMap } from '../../interface';

export interface SharedProcessor extends SharedMap {
    argumentData: Map<string, string>
}
