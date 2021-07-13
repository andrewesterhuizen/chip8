var Arg = /** @class */ (function () {
    function Arg(arg) {
        this.arg = "";
        if (arg) {
            this.arg = arg;
        }
    }
    Arg.prototype.isEmpty = function () {
        return this.arg === "";
    };
    Arg.prototype.isRegister = function () {
        return this.arg.startsWith("V");
    };
    Arg.prototype.getRegister = function () {
        return parseInt(this.arg.split("V")[1], 16);
    };
    Arg.prototype.isNumber = function () {
        return this.arg.startsWith("0x");
    };
    Arg.prototype.getNumber = function () {
        return parseInt(this.arg.split("0x")[1], 16);
    };
    Arg.prototype.getNibbles = function () {
        var n = this.getNumber();
        return [(n & 0xf00) >> 8, (n & 0xf0) >> 4, n & 0xf];
    };
    Arg.prototype.is = function (arg) {
        return this.arg === arg;
    };
    // isIRegister() {
    //   return this.arg === "I";
    // }
    // isDT() {
    //   return this.arg === "DT";
    // }
    // isK() {
    //   return this.arg === "K";
    // }
    // isST() {
    //   return this.arg === "ST";
    // }
    // isF() {
    //   return this.arg === "F";
    // }
    // isB() {
    //   return this.arg === "B";
    // }
    // isLocationI() {
    //   return this.arg === "[I]";
    // }
    Arg.prototype.rawArg = function () {
        return this.arg;
    };
    return Arg;
}());

var n4 = function (a, b, c, d) {
    return (a << 12) | (b << 8) | (c << 4) | d;
};
var Assembler = /** @class */ (function () {
    function Assembler(program) {
        this.program = "";
        this.labels = {};
        this.program = program;
    }
    Assembler.prototype.getOpAndArgs = function (line) {
        var split = line.split(" ");
        var op = split.shift();
        var _a = split
            .join("")
            .split(",")
            .map(function (a) { return new Arg(a); }), argA = _a[0], argB = _a[1], argC = _a[2];
        if (!argA)
            argA = new Arg("");
        if (!argB)
            argB = new Arg("");
        if (!argC)
            argC = new Arg("");
        return { op: op, argA: argA, argB: argB, argC: argC };
    };
    Assembler.prototype.parseLine = function (line) {
        var _a = this.getOpAndArgs(line), op = _a.op, argA = _a.argA, argB = _a.argB, argC = _a.argC;
        switch (op) {
            case "CLS": {
                return 0x00e0;
            }
            case "RET": {
                return 0x00ee;
            }
            case "JP": {
                if (argA.isNumber()) {
                    var _b = argA.getNibbles(), c = _b[0], b = _b[1], a = _b[2];
                    return n4(0x1, c, b, a);
                }
                else if (argA.isRegister()) {
                    var _c = argB.getNibbles(), c = _c[0], b = _c[1], a = _c[2];
                    return n4(0xb, c, b, a);
                }
                else {
                    var address = this.labels[argA.rawArg()];
                    if (typeof address === "undefined") {
                        throw new Error("label " + argA.rawArg() + " could not be found");
                    }
                    var addressHex = address.toString(16).padStart(3, "0");
                    return n4(0x1, parseInt(addressHex[0], 16), parseInt(addressHex[1], 16), parseInt(addressHex[2], 16));
                }
            }
            case "CALL": {
                if (argA.isNumber()) {
                    var _d = argA.getNibbles(), c = _d[0], b = _d[1], a = _d[2];
                    return n4(0x2, c, b, a);
                }
                else {
                    var address = this.labels[argA.rawArg()];
                    if (typeof address === "undefined") {
                        throw new Error("label " + argA.rawArg() + " could not be found");
                    }
                    var addressHex = address.toString(16).padStart(3, "0");
                    return n4(0x2, parseInt(addressHex[0], 16), parseInt(addressHex[1], 16), parseInt(addressHex[2], 16));
                }
            }
            case "SE": {
                if (!argA.isRegister()) {
                    throw new Error("SE: expected first arg to be register but got " + argA.rawArg());
                }
                if (argB.isRegister()) {
                    return n4(0x5, argA.getRegister(), argB.getRegister(), 0);
                }
                else {
                    var _e = argB.getNibbles(), b = _e[1], a = _e[2];
                    return n4(0x3, argA.getRegister(), b, a);
                }
            }
            case "SNE": {
                if (argB.isRegister()) {
                    return n4(0x9, argA.getRegister(), argB.getRegister(), 0x0);
                }
                else if (argB.isNumber()) {
                    var _f = argB.getNibbles(), b = _f[1], a = _f[2];
                    return n4(0x4, argA.getRegister(), b, a);
                }
                else {
                    throw new Error("SNE: unknown argument type " + argB.rawArg() + " found in position b");
                }
            }
            case "LD": {
                if (argA.isRegister()) {
                    if (argB.isNumber()) {
                        var _g = argB.getNibbles(), b = _g[1], a = _g[2];
                        return n4(0x6, argA.getRegister(), b, a);
                    }
                    else if (argB.isRegister()) {
                        return n4(0x8, argA.getRegister(), argB.getRegister(), 0);
                    }
                    else if (argB.is("DT")) {
                        return n4(0xf, argA.getRegister(), 0, 7);
                    }
                    else if (argB.is("K")) {
                        return n4(0xf, argA.getRegister(), 0, 0xa);
                    }
                    else if (argB.is("[I]")) {
                        return n4(0xf, argA.getRegister(), 6, 5);
                    }
                    else {
                        throw new Error("LD: unknown argument type " + argB.rawArg() + " found in position b");
                    }
                }
                else if (argA.is("I")) {
                    var _h = argB.getNibbles(), c = _h[0], b = _h[1], a = _h[2];
                    return n4(0xa, c, b, a);
                }
                else if (argA.is("DT")) {
                    return n4(0xf, argB.getRegister(), 1, 5);
                }
                else if (argA.is("ST")) {
                    return n4(0xf, argB.getRegister(), 1, 8);
                }
                else if (argA.is("F")) {
                    return n4(0xf, argB.getRegister(), 2, 9);
                }
                else if (argA.is("B")) {
                    return n4(0xf, argB.getRegister(), 3, 3);
                }
                else if (argA.is("[I]")) {
                    return n4(0xf, argB.getRegister(), 5, 5);
                }
            }
            case "ADD": {
                if (argA.is("I")) {
                    return n4(0xf, argB.getRegister(), 1, 0xe);
                }
                else if (argB.isRegister()) {
                    return n4(0x8, argA.getRegister(), argB.getRegister(), 0x4);
                }
                else if (argB.isNumber()) {
                    var _j = argB.getNibbles(), b = _j[1], a = _j[2];
                    return n4(0x7, argA.getRegister(), b, a);
                }
                else {
                    throw new Error("ADD: unknown argument type " + argB.rawArg() + " found in position b");
                }
            }
            case "OR": {
                return n4(0x8, argA.getRegister(), argB.getRegister(), 0x1);
            }
            case "AND": {
                return n4(0x8, argA.getRegister(), argB.getRegister(), 0x2);
            }
            case "XOR": {
                return n4(0x8, argA.getRegister(), argB.getRegister(), 0x3);
            }
            case "SUB": {
                return n4(0x8, argA.getRegister(), argB.getRegister(), 0x5);
            }
            case "SHR": {
                if (argB.isEmpty()) {
                    return n4(0x8, argA.getRegister(), 0, 0x6);
                }
                else {
                    return n4(0x8, argA.getRegister(), argB.getRegister(), 0x6);
                }
            }
            case "SUBN": {
                return n4(0x8, argA.getRegister(), argB.getRegister(), 0x7);
            }
            case "SHL": {
                return n4(0x8, argA.getRegister(), argB.getRegister(), 0xe);
            }
            case "RND": {
                var _k = argB.getNibbles(), b = _k[1], a = _k[2];
                return n4(0xc, argA.getRegister(), b, a);
            }
            case "DRW": {
                var _l = argC.getNibbles(), a = _l[2];
                return n4(0xd, argA.getRegister(), argB.getRegister(), a);
            }
            case "SKP": {
                return n4(0xe, argA.getRegister(), 0x9, 0xe);
            }
            case "SKNP": {
                return n4(0xe, argA.getRegister(), 0xa, 0x1);
            }
            case "HALT": {
                return 0x00ff;
            }
            case "DB": {
                return argA.getNumber() & 0xff;
            }
            default:
                throw new Error("Unknown opcode " + op + " found");
        }
    };
    Assembler.prototype.getLabels = function () {
        var _this = this;
        var lines = this.program.split("\n");
        var instructionNumber = 0x200;
        lines.forEach(function (line) {
            line = line.split(";")[0];
            line = line.trim();
            if (line == "")
                return;
            if (line.endsWith(":")) {
                var label = line.split(":")[0];
                _this.labels[label] = instructionNumber;
            }
            else {
                instructionNumber += 2;
            }
        });
    };
    Assembler.prototype.getInstructions = function () {
        var _this = this;
        this.getLabels();
        // console.log("* assembler starting");
        var instructions = [];
        var lines = this.program.split("\n");
        lines.forEach(function (line) {
            line = line.split(";")[0];
            line = line.trim();
            if (line == "")
                return;
            // skip labels
            if (!line.endsWith(":")) {
                var ins = _this.parseLine(line);
                // @ts-ignore
                // console.log(line.padEnd(12), " => ", `0x${ins.toString(16)}`);
                // HACK, fix this
                if (!line.startsWith("DB")) {
                    var high = (ins & 0xff00) >> 8;
                    instructions.push(high);
                }
                var low = ins & 0xff;
                instructions.push(low);
            }
        });
        // console.log("* assembler finished");
        return new Uint8Array(instructions);
    };
    return Assembler;
}());

export default Assembler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXNzZW1ibGVyLmpzIiwic291cmNlcyI6WyIuLi9hc3NlbWJsZXIvQXJnLnRzIiwiLi4vYXNzZW1ibGVyL0Fzc2VtYmxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6W251bGwsbnVsbF0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0lBRUUsYUFBWSxHQUFXO1FBRGYsUUFBRyxHQUFXLEVBQUUsQ0FBQztRQUV2QixJQUFJLEdBQUcsRUFBRTtZQUNQLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1NBQ2hCO0tBQ0Y7SUFFRCxxQkFBTyxHQUFQO1FBQ0UsT0FBTyxJQUFJLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQztLQUN4QjtJQUVELHdCQUFVLEdBQVY7UUFDRSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2pDO0lBRUQseUJBQVcsR0FBWDtRQUNFLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQzdDO0lBRUQsc0JBQVEsR0FBUjtRQUNFLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDbEM7SUFFRCx1QkFBUyxHQUFUO1FBQ0UsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDOUM7SUFFRCx3QkFBVSxHQUFWO1FBQ0UsSUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQzNCLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0tBQ3JEO0lBRUQsZ0JBQUUsR0FBRixVQUFHLEdBQUc7UUFDSixPQUFPLElBQUksQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDO0tBQ3pCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBOEJELG9CQUFNLEdBQU47UUFDRSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUM7S0FDakI7SUFDSCxVQUFDO0FBQUQsQ0FBQzs7QUNsRUQsSUFBTSxFQUFFLEdBQUcsVUFBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO0lBQ3BELE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzdDLENBQUMsQ0FBQzs7SUFJQSxtQkFBWSxPQUFlO1FBRDNCLFlBQU8sR0FBRyxFQUFFLENBQUM7UUFLYixXQUFNLEdBQThCLEVBQUUsQ0FBQztRQUhyQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztLQUN4QjtJQUlELGdDQUFZLEdBQVosVUFBYSxJQUFZO1FBQ3ZCLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUIsSUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRXJCLElBQUEsS0FBcUIsS0FBSzthQUMzQixJQUFJLENBQUMsRUFBRSxDQUFDO2FBQ1IsS0FBSyxDQUFDLEdBQUcsQ0FBQzthQUNWLEdBQUcsQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFBLENBQUMsRUFIcEIsSUFBSSxRQUFBLEVBQUUsSUFBSSxRQUFBLEVBQUUsSUFBSSxRQUdJLENBQUM7UUFFMUIsSUFBSSxDQUFDLElBQUk7WUFBRSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLElBQUk7WUFBRSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLElBQUk7WUFBRSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFOUIsT0FBTyxFQUFFLEVBQUUsSUFBQSxFQUFFLElBQUksTUFBQSxFQUFFLElBQUksTUFBQSxFQUFFLElBQUksTUFBQSxFQUFFLENBQUM7S0FDakM7SUFFRCw2QkFBUyxHQUFULFVBQVUsSUFBWTtRQUNkLElBQUEsS0FBMkIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBaEQsRUFBRSxRQUFBLEVBQUUsSUFBSSxVQUFBLEVBQUUsSUFBSSxVQUFBLEVBQUUsSUFBSSxVQUE0QixDQUFDO1FBRXpELFFBQVEsRUFBRTtZQUNSLEtBQUssS0FBSyxFQUFFO2dCQUNWLE9BQU8sTUFBTSxDQUFDO2FBQ2Y7WUFFRCxLQUFLLEtBQUssRUFBRTtnQkFDVixPQUFPLE1BQU0sQ0FBQzthQUNmO1lBRUQsS0FBSyxJQUFJLEVBQUU7Z0JBQ1QsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUU7b0JBQ2IsSUFBQSxLQUFZLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBNUIsQ0FBQyxRQUFBLEVBQUUsQ0FBQyxRQUFBLEVBQUUsQ0FBQyxRQUFxQixDQUFDO29CQUNwQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDekI7cUJBQU0sSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7b0JBQ3RCLElBQUEsS0FBWSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQTVCLENBQUMsUUFBQSxFQUFFLENBQUMsUUFBQSxFQUFFLENBQUMsUUFBcUIsQ0FBQztvQkFDcEMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQ3pCO3FCQUFNO29CQUNMLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7b0JBQzNDLElBQUksT0FBTyxPQUFPLEtBQUssV0FBVyxFQUFFO3dCQUNsQyxNQUFNLElBQUksS0FBSyxDQUFDLFdBQVMsSUFBSSxDQUFDLE1BQU0sRUFBRSx3QkFBcUIsQ0FBQyxDQUFDO3FCQUM5RDtvQkFDRCxJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBQ3pELE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUN2RzthQUNGO1lBRUQsS0FBSyxNQUFNLEVBQUU7Z0JBQ1gsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUU7b0JBQ2IsSUFBQSxLQUFZLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBNUIsQ0FBQyxRQUFBLEVBQUUsQ0FBQyxRQUFBLEVBQUUsQ0FBQyxRQUFxQixDQUFDO29CQUNwQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDekI7cUJBQU07b0JBQ0wsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztvQkFDM0MsSUFBSSxPQUFPLE9BQU8sS0FBSyxXQUFXLEVBQUU7d0JBQ2xDLE1BQU0sSUFBSSxLQUFLLENBQUMsV0FBUyxJQUFJLENBQUMsTUFBTSxFQUFFLHdCQUFxQixDQUFDLENBQUM7cUJBQzlEO29CQUNELElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDekQsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQ3ZHO2FBQ0Y7WUFFRCxLQUFLLElBQUksRUFBRTtnQkFDVCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO29CQUN0QixNQUFNLElBQUksS0FBSyxDQUFDLG1EQUFpRCxJQUFJLENBQUMsTUFBTSxFQUFJLENBQUMsQ0FBQztpQkFDbkY7Z0JBRUQsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7b0JBQ3JCLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUMzRDtxQkFBTTtvQkFDQyxJQUFBLEtBQVcsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUF6QixDQUFDLFFBQUEsRUFBRSxDQUFDLFFBQXFCLENBQUM7b0JBQ25DLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUMxQzthQUNGO1lBRUQsS0FBSyxLQUFLLEVBQUU7Z0JBQ1YsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7b0JBQ3JCLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2lCQUM3RDtxQkFBTSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRTtvQkFDcEIsSUFBQSxLQUFXLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBekIsQ0FBQyxRQUFBLEVBQUUsQ0FBQyxRQUFxQixDQUFDO29CQUNuQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDMUM7cUJBQU07b0JBQ0wsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQ0FBOEIsSUFBSSxDQUFDLE1BQU0sRUFBRSx5QkFBc0IsQ0FBQyxDQUFDO2lCQUNwRjthQUNGO1lBRUQsS0FBSyxJQUFJLEVBQUU7Z0JBQ1QsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7b0JBQ3JCLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFO3dCQUNiLElBQUEsS0FBVyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQXpCLENBQUMsUUFBQSxFQUFFLENBQUMsUUFBcUIsQ0FBQzt3QkFDbkMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7cUJBQzFDO3lCQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO3dCQUM1QixPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztxQkFDM0Q7eUJBQU0sSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUN4QixPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztxQkFDMUM7eUJBQU0sSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFO3dCQUN2QixPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztxQkFDNUM7eUJBQU0sSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFO3dCQUN6QixPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztxQkFDMUM7eUJBQU07d0JBQ0wsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBNkIsSUFBSSxDQUFDLE1BQU0sRUFBRSx5QkFBc0IsQ0FBQyxDQUFDO3FCQUNuRjtpQkFDRjtxQkFBTSxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ2pCLElBQUEsS0FBWSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQTVCLENBQUMsUUFBQSxFQUFFLENBQUMsUUFBQSxFQUFFLENBQUMsUUFBcUIsQ0FBQztvQkFDcEMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQ3pCO3FCQUFNLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDeEIsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQzFDO3FCQUFNLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDeEIsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQzFDO3FCQUFNLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDdkIsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQzFDO3FCQUFNLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDdkIsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQzFDO3FCQUFNLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDekIsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQzFDO2FBQ0Y7WUFFRCxLQUFLLEtBQUssRUFBRTtnQkFDVixJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ2hCLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2lCQUM1QztxQkFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRTtvQkFDNUIsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7aUJBQzdEO3FCQUFNLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFO29CQUNwQixJQUFBLEtBQVcsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUF6QixDQUFDLFFBQUEsRUFBRSxDQUFDLFFBQXFCLENBQUM7b0JBQ25DLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUMxQztxQkFBTTtvQkFDTCxNQUFNLElBQUksS0FBSyxDQUFDLGdDQUE4QixJQUFJLENBQUMsTUFBTSxFQUFFLHlCQUFzQixDQUFDLENBQUM7aUJBQ3BGO2FBQ0Y7WUFFRCxLQUFLLElBQUksRUFBRTtnQkFDVCxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQzthQUM3RDtZQUVELEtBQUssS0FBSyxFQUFFO2dCQUNWLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQzdEO1lBRUQsS0FBSyxLQUFLLEVBQUU7Z0JBQ1YsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7YUFDN0Q7WUFFRCxLQUFLLEtBQUssRUFBRTtnQkFDVixPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQzthQUM3RDtZQUVELEtBQUssS0FBSyxFQUFFO2dCQUNWLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFO29CQUNsQixPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztpQkFDNUM7cUJBQU07b0JBQ0wsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7aUJBQzdEO2FBQ0Y7WUFFRCxLQUFLLE1BQU0sRUFBRTtnQkFDWCxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQzthQUM3RDtZQUVELEtBQUssS0FBSyxFQUFFO2dCQUNWLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQzdEO1lBRUQsS0FBSyxLQUFLLEVBQUU7Z0JBQ0osSUFBQSxLQUFXLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBekIsQ0FBQyxRQUFBLEVBQUUsQ0FBQyxRQUFxQixDQUFDO2dCQUNuQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUMxQztZQUVELEtBQUssS0FBSyxFQUFFO2dCQUNKLElBQUEsS0FBVSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQXRCLENBQUMsUUFBcUIsQ0FBQztnQkFDbEMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDM0Q7WUFFRCxLQUFLLEtBQUssRUFBRTtnQkFDVixPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQzthQUM5QztZQUNELEtBQUssTUFBTSxFQUFFO2dCQUNYLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQzlDO1lBRUQsS0FBSyxNQUFNLEVBQUU7Z0JBQ1gsT0FBTyxNQUFNLENBQUM7YUFDZjtZQUVELEtBQUssSUFBSSxFQUFFO2dCQUNULE9BQU8sSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQzthQUNoQztZQUVEO2dCQUNFLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQWtCLEVBQUUsV0FBUSxDQUFDLENBQUM7U0FDakQ7S0FDRjtJQUVELDZCQUFTLEdBQVQ7UUFBQSxpQkFpQkM7UUFoQkMsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFdkMsSUFBSSxpQkFBaUIsR0FBRyxLQUFLLENBQUM7UUFFOUIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUk7WUFDakIsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNuQixJQUFJLElBQUksSUFBSSxFQUFFO2dCQUFFLE9BQU87WUFFdkIsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUN0QixJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxLQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLGlCQUFpQixDQUFDO2FBQ3hDO2lCQUFNO2dCQUNMLGlCQUFpQixJQUFJLENBQUMsQ0FBQzthQUN4QjtTQUNGLENBQUMsQ0FBQztLQUNKO0lBRUQsbUNBQWUsR0FBZjtRQUFBLGlCQThCQztRQTdCQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7O1FBRWpCLElBQU0sWUFBWSxHQUFhLEVBQUUsQ0FBQztRQUNsQyxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV2QyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSTtZQUNqQixJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQixJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ25CLElBQUksSUFBSSxJQUFJLEVBQUU7Z0JBQUUsT0FBTzs7WUFHdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3ZCLElBQU0sR0FBRyxHQUFHLEtBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7Ozs7Z0JBS2pDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUMxQixJQUFNLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxNQUFNLEtBQUssQ0FBQyxDQUFDO29CQUNqQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN6QjtnQkFFRCxJQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDO2dCQUN2QixZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ3hCO1NBQ0YsQ0FBQyxDQUFDOztRQUdILE9BQU8sSUFBSSxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7S0FDckM7SUFDSCxnQkFBQztBQUFELENBQUM7Ozs7In0=
