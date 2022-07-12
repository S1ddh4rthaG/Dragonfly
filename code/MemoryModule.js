const _32bit = 0xFFFFFFFF;

class Memory {
    constructor() {
        this.PC = 0x000000;
        this.REG = Array(0x20).fill(0x0);
        this.MEM = Array(0x1000).fill(0x0);

        this.endian = true; //true => Little Endian, false => Big Endian

        //Flags
        this.flgs = {
            'ovf': false,
            'regAccess': false,
            'regValue': false,
            'memAddr': {
                'ovf': false,
                'aligned': true
            },
            'memValue': false,
        }
    }

    //Read and Write Program Counter
    readPC() {
        return this.PC;
    }

    writePC(val) {
        if (val > _32bit)
            this.flgs.ovf = true;

        this.PC = val & _32bit;
    }

    //Read and Write Registers
    readReg(ID) {
        if (!(ID >= 0 && ID <= 31))
            this.flgs.regAccess = true;

        return (ID >= 0 && ID <= 31) ? this.REG[ID] : 0;
    }

    writeReg(ID, val) {
        if (!(ID >= 0 && ID <= 31))
            this.flgs.regAccess = true;

        if (ID >= 1 && ID <= 31) {
            if (val > _32bit)
                this.flgs.regValue = true;

            this.REG[ID] = val & _32bit;
        }
    }

    //Read and Write to Memory
    readMem(addr) {
        if (addr % 4 != 0) this.flgs.memAddr.aligned = false;
        if (addr >= 0x1000) this.flgs.memAddr.ovf = true;

        if (addr % 4 == 0 && addr < 0x1000) {
            let half_words = this.MEM.slice(addr, addr + 4);

            let val = 0x0;

            if (this.endian) {
                for (let i = 3; i >= 0; i--) {
                    val = (val << 8) + half_words[i];
                }
            } else {
                for (let i = 0; i < 4; i++) {
                    val = (val << 8) + half_words[i];
                }
            }


            return val;
        }

        return 0;
    }

    writeMem(addr, val) {
        if (val > _32bit) this.flgs.memValue = true;
        if (addr % 4 != 0) this.flgs.memAddr.aligned = false;
        if (addr >= 0x1000) this.flgs.memAddr.ovf = true;

        if (addr % 4 == 0 && addr < 0x1000) {
            val = val & _32bit;

            if (this.endian) {
                for (let i = 0; i < 4; i++) {
                    this.MEM[addr + i] = val & 0xFF;
                    val = (val >> 8);
                }
            } else {
                for (let i = 3; i >= 0; i--) {
                    val = (val << 8) + half_words[i];
                }
            }

        }
    }
}

export { Memory };