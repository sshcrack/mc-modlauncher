"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dirSize = void 0;
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
function dirSize(directory) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = yield (0, promises_1.readdir)(directory);
        const stats = files.map(file => (0, promises_1.stat)(path_1.default.join(directory, file)));
        return (yield Promise.all(stats)).reduce((accumulator, { size }) => accumulator + size, 0);
    });
}
exports.dirSize = dirSize;
//# sourceMappingURL=folder.js.map