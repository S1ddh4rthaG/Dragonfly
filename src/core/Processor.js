/* eslint-disable default-case */
const _32bit = 0xffffffff;

class Memory {
  constructor() {
    this.PC = 0x000000;
    this.REG = Array(0x20).fill(0x0);
    this.MEM = Array(0x1000).fill(0x0);

    this.endian = false; //true => Little Endian, false => Big Endian

    //Flags
    this.flgs = {
      ovf: false,
      regAccess: false,
      regValue: false,
      memAddr: {
        ovf: false,
        aligned: true,
      },
      memValue: false,
    };
  }

  //Read and Write Program Counter
  readPC() {
    return this.PC;
  }

  writePC(val) {
    if (val > _32bit) this.flgs.ovf = true;

    this.PC = val & _32bit;
  }

  //Read and Write Registers
  readReg(ID) {
    if (!(ID >= 0 && ID <= 31)) this.flgs.regAccess = true;

    return ID >= 0 && ID <= 31 ? this.REG[ID] : 0;
  }

  writeReg(ID, val) {
    if (!(ID >= 0 && ID <= 31)) this.flgs.regAccess = true;

    if (ID >= 1 && ID <= 31) {
      if (val > _32bit) this.flgs.regValue = true;

      this.REG[ID] = val & _32bit;
    }
  }

  //Read and Write to Memory
  readMem(addr) {
    if (addr % 4 !== 0) this.flgs.memAddr.aligned = false;
    if (addr >= 0x1000) this.flgs.memAddr.ovf = true;

    if (addr % 4 === 0 && addr < 0x1000) {
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
    if (addr % 4 !== 0) this.flgs.memAddr.aligned = false;
    if (addr >= 0x1000) this.flgs.memAddr.ovf = true;

    if (addr % 4 === 0 && addr < 0x1000) {
      val = val & _32bit;

      if (this.endian) {
        for (let i = 0; i < 4; i++) {
          this.MEM[addr + i] = val & 0xff;
          val = val >> 8;
        }
      } else {
        for (let i = 3; i >= 0; i--) {
          this.MEM[addr + i] = val & 0xff;
          val = val >> 8;
        }
      }
    }
  }

  MEM_DISPLAY(hex = true, rSize = 250, changed = false) {
    if (hex === true) {
      let hexMEM = this.MEM.slice(0, 4 * 4 * rSize)
        .reduce(
          (acc, val, idx) =>
            idx % 4 === 0
              ? acc
                ? `${acc} 0x${this.toHEX(val)}`
                : `0x${this.toHEX(val)}`
              : `${acc}${this.toHEX(val)}`,
          ""
        )
        .split(" ");

      let hexTable = [];
      let j = 0;

      for (let i = 0; i < rSize; i++) {
        hexTable[i] = [hexMEM[j], hexMEM[j + 1], hexMEM[j + 2], hexMEM[j + 3]];
        j += 4;
      }
      return hexTable;
    }
  }

  toHEX(val, size = 2) {
    if (size < 32) {
      let valStr = (val >>> 0).toString(16).toLocaleUpperCase();
      let len = valStr.length;

      if (len <= size) {
        valStr = "0".repeat(size - len) + valStr;
      } else {
        valStr = valStr.substring(len - size, len);
      }
      return valStr;
    }
    return "0".repeat(32);
  }
}

class RISC_V {
  constructor(feedINST) {
    this.setInstructions(feedINST);
  }

  setInstructions(feedINST) {
    this.IP = 0;
    this.MEM = new Memory();

    this.INST = feedINST || [
      ["beq", 1, 0, 12, "sb"],
      ["addi", 1, 0, 20, "i"],
      ["addi", 1, 0, 30, "i"],
      ["addi", 1, 0, 40, "i"],
    ];

    // Operational Flags
    this.killIF = false; // Kill instruction?
    this.redoID = false; // Redo instruction decode stage?
    this.tknBranch = false; // Branch taken?
    this.enabledDF = !true; // Enable data forwarding?

    // Comparision Flags
    this.CompFlags = {
      G: false,
      L: false,
      E: false,
      GE: false,
      LE: false,
    };

    // desBuffers - Stores the des. of ID_EX, EX_MM, MM_WB
    this.desID = 0;
    this.desEX = 0;
    this.desMM = 0;

    // Pipeline Status
    this.ppl = {
      cyc: 0,
      IF: [0, -1],
      ID: [0, -1],
      EX: [0, -1],
      MM: [0, -1],
      WB: [0, -1],
    };

    //Buffers & Working Buffers
    this.IF_ID = this.wrkIF_ID = undefined;
    this.ID_EX = this.wrkID_EX = undefined;
    this.EX_MM = this.wrkEX_MM = undefined;
    this.MM_WB = this.wrkMM_WB = undefined;
    this.WB_ED = this.wrkWB_ED = undefined;

    //Counters
    this.cycles = 0;
    this.kills = 0;
    this.stalls = 0;
    this.wbs = 0;

    //Pipeline Output
    this.pipeID = 0;
    this.pipelineState = [];
    this.iS_IF = {};
    this.iS_ID = {};
    this.iS_EX = {};
    this.iS_MM = {};
    this.iS_WB = {};
  }

  getInst() {
    if (this.MEM.PC < this.INST.length) return this.INST[this.MEM.PC];
    return undefined;
  }

  setCompFlags(rs1, rs2) {
    //signed comparision
    let l = rs1 < rs2;
    let e = rs1 === rs2;

    this.CompFlags["E"] = e;
    this.CompFlags["L"] = l;
    this.CompFlags["G"] = !l && !e;
    this.CompFlags["LE"] = l || e;
    this.CompFlags["GE"] = !l || e;
  }

  checkRAW(rs1, rs2) {
    if (
      ((rs1 === this.desID || rs2 === this.desID) && this.desID !== 0) ||
      ((rs1 === this.desEX || rs2 === this.desEX) && this.desEX !== 0) ||
      ((rs1 === this.desMM || rs2 === this.desMM) && this.desMM !== 0)
    ) {
      return true;
    }

    return false;
  }

  //immediate value sign extender
  immNsigned(imm, n) {
    const _32bit = 0xffffffff;
    let sign = (1 << (n - 1)) & imm;

    return sign !== 0 ? imm | (_32bit << n) : imm;
  }

  forwardRAW(rs1, rs2) {
    let shouldStall,
      values = [undefined, undefined];

    //For load if EX_MM, ID_EX match. For normal if ID_EX match.
    shouldStall =
      (rs1 === this.desID || rs2 === this.desID) &&
      this.desID !== 0 &&
      this.ID_EX[0][0] === "l";

    if (!shouldStall) {
      if (rs1 === this.desID && this.desID !== 0) values[0] = this.wrkEX_MM[2];
      if (rs1 === this.desEX && this.desEX !== 0) values[0] = this.wrkMM_WB[2];
      if (rs2 === this.desID && this.desID !== 0) values[1] = this.wrkEX_MM[2];
      if (rs2 === this.desEX && this.desEX !== 0) values[1] = this.wrkMM_WB[2];
    }

    return [shouldStall, values];
  }

  isEmpty(buff) {
    return buff === undefined;
  }

  isPipelineEmpty() {
    return (
      this.isEmpty(this.IF_ID) &&
      this.isEmpty(this.ID_EX) &&
      this.isEmpty(this.EX_MM) &&
      this.isEmpty(this.MM_WB)
    );
  }

  updateState() {
    // Update Buffers
    this.IF_ID = this.wrkIF_ID;
    this.ID_EX = this.wrkID_EX;
    this.EX_MM = this.wrkEX_MM;
    this.MM_WB = this.wrkMM_WB;
    this.WB_ED = this.wrkWB_ED;

    // Update Destinations of Buffers
    this.desID =
      this.ID_EX !== undefined && this.ID_EX[this.ID_EX.length - 1][0] !== "s"
        ? this.ID_EX[1]
        : 0;
    this.desEX =
      this.EX_MM !== undefined && this.EX_MM[this.EX_MM.length - 1][0] !== "s"
        ? this.EX_MM[1]
        : 0;
    this.desMM =
      this.MM_WB !== undefined && this.MM_WB[this.MM_WB.length - 1][0] !== "s"
        ? this.MM_WB[1]
        : 0;

    //Log cycle
    this.iS_IF.clk =
      this.iS_ID.clk =
      this.iS_EX.clk =
      this.iS_MM.clk =
      this.iS_WB.clk =
        this.cycles;

    // Increment cycles
    this.cycles++;
  }

  // PIPELINE STAGES
  instructionFetch() {
    if (this.redoID === true) {
      this.wrkIF_ID = this.IF_ID;

      this.iS_IF = {
        val: "IF",
        inst: this.INST[this.iS_ID.instID],
        pipeID: this.iS_ID.pipeID,
      };
      return;
    }

    if (this.MEM.PC < this.INST.length * 4) {
      let fetchedPC = this.MEM.PC / 4;
      let inst = this.INST[fetchedPC];

      this.iS_IF = {
        val: "IF",
        inst: inst,
        instID: fetchedPC,
        pipeID: this.pipeID++,
      };

      if (this.MEM.PC !== this.IP) {
        this.killIF = true;
        this.MEM.writePC(this.IP);
      } else {
        this.MEM.writePC(this.MEM.PC + 4);
      }

      this.tknBranch = false;
      this.IP = this.MEM.PC;
      this.wrkIF_ID = inst;
    } else {
      this.wrkIF_ID = undefined;
      this.iS_IF = {
        val: "No IF",
      };
    }
  }

  instructionDecode() {
    if (this.IF_ID === undefined) {
      this.wrkID_EX = undefined;
      this.iS_ID = {
        val: "No ID",
      };
      return;
    }

    if (this.killIF === true) {
      // IF_ID Buffer is flushed, So ID Stage can't executed(i.e Bubble/Stall)
      //Single kill resolve
      this.iS_ID = {
        val: "KILL",
        inst: this.IF_ID,
        instID: this.iS_IF.instID,
        pipeID: this.iS_IF.pipeID,
      };

      this.IF_ID = undefined;
      this.wrkID_EX = undefined;
      this.kills++;
      this.killIF = false;
      return;
    }

    let inst = this.IF_ID;
    let instFmt = this.IF_ID[this.IF_ID.length - 1];
    let stallCheck = false;

    let rs1_val, rs2_val, rs_val, imm, decodedInst, checkList;

    switch (instFmt) {
      case "r":
        // [keyword, rd, rs1.val, rs2.val, 'r']
        rs1_val = this.MEM.readReg(inst[2]);
        rs2_val = this.MEM.readReg(inst[3]);

        if (!this.enabledDF) {
          stallCheck = this.checkRAW(inst[2], inst[3]);
        } else {
          checkList = this.forwardRAW(inst[2], inst[3]);
          stallCheck = checkList[0];

          if (!stallCheck) {
            rs1_val = checkList[1][0] !== undefined ? checkList[1][0] : rs1_val;
            rs2_val = checkList[1][1] !== undefined ? checkList[1][1] : rs2_val;
          }
        }

        decodedInst = [inst[0], inst[1], rs1_val, rs2_val, "r"];
        break;

      case "i":
        // [keyword, rd, rs.val, imm12, 'i']
        rs_val = this.MEM.readReg(inst[2]);
        imm = this.immNsigned(inst[3] & 0xfff, 12); // 12 bits(sign extended)

        if (!this.enabledDF) {
          stallCheck = this.checkRAW(inst[2], undefined);
        } else {
          checkList = this.forwardRAW(inst[2], undefined);
          stallCheck = checkList[0];

          if (!stallCheck) {
            rs_val = checkList[1][0] !== undefined ? checkList[1][0] : rs_val;
          }
        }

        if (!stallCheck && inst[0] === "jalr") {
          this.tknBranch = true;
          decodedInst = [inst[0], inst[1], 0, this.MEM.PC, "i"];
          this.IP = imm + rs_val;
        } else decodedInst = [inst[0], inst[1], rs_val, imm, "i"];
        break;

      case "s":
        // [keyword, rs1.val, rs2.val, imm12, 'i']
        rs1_val = this.MEM.readReg(inst[1]);
        rs2_val = this.MEM.readReg(inst[2]);
        imm = this.immNsigned(inst[3] & 0xfff, 12); // 12 bits(sign extended)

        if (!this.enabledDF) {
          stallCheck = this.checkRAW(inst[1], inst[2]);
        } else {
          checkList = this.forwardRAW(inst[1], inst[2]);
          stallCheck = checkList[0];

          if (!stallCheck) {
            rs1_val = checkList[1][0] !== undefined ? checkList[1][0] : rs1_val;
            rs2_val = checkList[1][1] !== undefined ? checkList[1][1] : rs2_val;
          }
        }

        decodedInst = [inst[0], rs1_val, rs2_val, imm, "s"];
        break;

      case "u":
        // [keyword, rd, imm20, 'u']
        imm = this.immNsigned(inst[2] & 0xfffff, 20); // 20 bits(sign extended)

        decodedInst = [inst[0], inst[1], imm, "u"];
        break;

      case "uj":
        // [keyword, rd, imm20, 'uj]
        imm = this.immNsigned(inst[2] & 0xfffff, 20); // 20 bits(sign extended)

        if (inst[0] === "jal") {
          this.tknBranch = true;
          this.IP = this.MEM.PC + imm;
          this.MEM.writePC(this.MEM.PC + imm);
        }

        decodedInst = [inst[0], inst[1], imm, "uj"];
        break;

      case "sb":
        // [keyword, rs1.val, rs2.val, imm12, 'sb']
        rs1_val = this.MEM.readReg(inst[1]);
        rs2_val = this.MEM.readReg(inst[2]);
        imm = this.immNsigned(inst[3] & 0xfff, 12); // 12 bits(sign extended)

        this.setCompFlags(rs1_val, rs2_val);

        if (!this.enabledDF) {
          stallCheck = this.checkRAW(inst[1], inst[2]);
        } else {
          checkList = this.forwardRAW(inst[1], inst[2]);
          stallCheck = checkList[0];

          if (!stallCheck) {
            rs1_val = checkList[1][0] !== undefined ? checkList[1][0] : rs1_val;
            rs2_val = checkList[1][1] !== undefined ? checkList[1][1] : rs2_val;
          }
        }

        decodedInst = [inst[0], rs1_val, rs2_val, imm, "sb"];

        if (!stallCheck) {
          switch (decodedInst[0]) {
            case "beq":
              if (this.CompFlags.E) {
                this.IP = this.MEM.PC - 4 + imm;
                this.tknBranch = true;
              }
              break;

            case "bne":
              if (!this.CompFlags.E) {
                this.IP = this.MEM.PC - 4 + imm;
                this.tknBranch = true;
              }
              break;

            case "blt":
              if (this.CompFlags.L) {
                this.IP = this.MEM.PC - 4 + imm;
                this.tknBranch = true;
              }
              break;

            case "bge":
              if (this.CompFlags.GE) {
                this.IP = this.MEM.PC - 4 + imm;
                this.tknBranch = true;
              }
              break;

            case "bltu":
              //unsigned
              if (rs1_val >>> 0 < rs2_val >>> 0) {
                this.IP = this.MEM.PC - 4 + (imm & 0xfff);
                this.tknBranch = true;
              }
              break;

            case "bgeu":
              //unsigned
              if (rs1_val >>> 0 >= rs2_val >>> 0) {
                this.IP = this.MEM.PC - 4 + (imm & 0xfff);
                this.tknBranch = true;
              }
              break;
          }
        }
        break;
    }

    this.iS_ID = {
      val: "ID",
      inst: decodedInst,
      instID: this.iS_IF.instID,
      pipeID: this.iS_IF.pipeID,
    };

    // If RAW we need to ID again.
    if (stallCheck) {
      this.stalls++;

      this.iS_ID.val = "STALL";

      this.wrkID_EX = undefined;
      this.redoID = true;
      return;
    } else {
      // RAW Resolved
      this.redoID = false;
    }

    this.wrkID_EX = decodedInst;
  }

  instructionExecute() {
    if (this.ID_EX === undefined) {
      this.wrkEX_MM = undefined;
      this.iS_EX = {
        val: "No EX",
      };
      return;
    }

    let inst = this.ID_EX;
    let instFmt = this.ID_EX[this.ID_EX.length - 1];
    let keyword = this.ID_EX[0];

    let rs1_val, rs2_val, rs_val, rd, imm, res, output;

    switch (instFmt) {
      case "r":
        // [keyword, rd, rs1.val (op) rs2.val, 'r']
        rd = inst[1];
        rs1_val = inst[2];
        rs2_val = inst[3];

        switch (keyword) {
          case "add":
            res = rs1_val + rs2_val;
            break;

          case "sub":
            res = rs1_val - rs2_val;
            break;

          case "xor":
            res = rs1_val ^ rs2_val;
            break;

          case "or":
            res = rs1_val | rs2_val;
            break;

          case "and":
            res = rs1_val & rs2_val;
            break;

          case "sll":
            rs2_val = Math.abs(rs2_val);
            res = rs1_val << rs2_val;
            break;

          case "srl":
            rs2_val = Math.abs(rs2_val);
            // no sign extension
            res = (rs1_val >> rs2_val) & (2 ** (32 - rs2_val) - 1);
            break;

          case "sra":
            rs2_val = Math.abs(rs2_val);
            // sign extension
            res = rs1_val >> rs2_val;
            break;

          case "slt":
            // signed comparision
            res = rs1_val < rs2_val ? 1 : 0;
            break;

          case "sltu":
            // unsigned comparision
            res = rs1_val >>> 0 < rs2_val >>> 0 ? 1 : 0;
            break;
        }

        output = [keyword, rd, res, "r"];
        break;

      case "i":
        // [keyword, rd, rs.val (op) imm, 'i']
        rd = inst[1];
        rs_val = inst[2];
        imm = this.immNsigned(inst[3], 12);

        switch (keyword) {
          case "addi":
            res = rs_val + imm;
            break;

          case "xori":
            res = rs_val ^ imm;
            break;

          case "ori":
            res = rs_val | imm;
            break;

          case "andi":
            res = rs_val & imm;
            break;

          case "slli":
            res = rs_val << (imm & 0x1f);
            break;

          case "srli":
            //unsigned shift
            let shamt = imm & 0x1f;
            res = (rs_val >> shamt) & (2 ** (32 - shamt) - 1);
            break;

          case "srai":
            //signed shift
            res = rs_val >> (imm & 0x1f);
            break;

          case "slti":
            //signed set
            res = rs_val < imm ? 1 : 0;
            break;

          case "sltiu":
            //unsigned set
            res = rs_val >>> 0 < imm >>> 0 ? 1 : 0;
            break;

          case "lb":
          case "lh":
          case "lw":
            res = rs_val + imm;
            break;

          case "lbu":
          case "lhu":
            res = rs_val + imm;
            break;

          case "jalr":
            res = rs_val + imm;
            break;
        }

        output = [keyword, rd, res, "i"];
        break;

      case "s":
        // [keyword, rd.val , rs.val (op) imm, 's']
        rs2_val = inst[1]; // Source Reg

        rs1_val = inst[2];
        imm = inst[3];

        switch (keyword) {
          case "sb":
          case "sw":
          case "sh":
            res = rs1_val + imm;
            break;
        }

        output = [keyword, rs2_val, res, "s"];
        break;

      case "sb":
        output = this.ID_EX;
        break;

      case "u":
      case "uj":
        // [keyword, rd, imm, 'ux']
        rd = inst[1];
        imm = inst[2];

        switch (keyword) {
          case "lui":
            res = imm << 12;
            break;

          case "auipc":
            res = (imm << 12) + (this.MEM.PC - 4);
            break;

          case "jal":
            res = this.MEM.PC + 4;
            break;
        }

        output = [keyword, rd, res, instFmt];
        break;
    }
    this.iS_EX = {
      val: "EX",
      inst: output,
      instID: this.iS_ID.instID,
      pipeID: this.iS_ID.pipeID,
    };

    this.wrkEX_MM = output;
  }

  memory() {
    if (this.EX_MM === undefined) {
      this.wrkMM_WB = undefined;
      this.iS_MM = {
        val: "No MM",
      };
      return;
    }

    let keyword = this.EX_MM[0];
    let instFmt = this.EX_MM[this.EX_MM.length - 1];

    let res, addr, rd, rs_val;

    switch (instFmt) {
      case "i":
        if (keyword[0] === "l") {
          rd = this.EX_MM[1];
          addr = this.EX_MM[2];

          switch (keyword) {
            case "lb":
              res = this.immNsigned(this.MEM.readMem(addr) & 0xff, 8);
              break;

            case "lh":
              res = this.immNsigned(this.MEM.readMem(addr) & 0xffff, 16);
              break;

            case "lw":
              res = this.MEM.readMem(addr);
              break;

            case "lbu":
              res = this.MEM.readMem(addr) & 0xff;
              break;

            case "lhu":
              res = this.MEM.readMem(addr) & 0xffff;
              break;
          }

          this.wrkMM_WB = [keyword, rd, res, "i"];
        } else {
          this.wrkMM_WB = this.EX_MM;
        }
        break;

      case "s":
        rs_val = this.EX_MM[1];
        addr = this.EX_MM[2];

        switch (keyword) {
          case "sb":
            rs_val = this.immNsigned(rs_val & 0xff, 8);
            this.MEM.writeMem(addr, rs_val);
            break;

          case "sh":
            rs_val = this.immNsigned(rs_val & 0xffff, 16);
            this.MEM.writeMem(addr, rs_val);
            break;

          case "sw":
            this.MEM.writeMem(addr, rs_val);
            break;
        }

        this.wrkMM_WB = this.EX_MM;
        break;

      default:
        this.wrkMM_WB = this.EX_MM;
    }

    this.iS_MM = {
      val: "MM",
      inst: this.wrkEX_MM,
      instID: this.iS_EX.instID,
      pipeID: this.iS_EX.pipeID,
    };
  }

  writeback() {
    if (this.MM_WB === undefined) {
      this.wrkWB_ED = undefined;
      this.iS_WB = {
        val: "No WB",
      };
      return;
    }

    this.wbs++; // Count the no of writeback

    let rd = this.MM_WB[1];
    let val = this.MM_WB[2];
    let instFmt = this.MM_WB[this.MM_WB.length - 1];

    switch (instFmt) {
      case "r":
      case "i":
      case "u":
      case "uj":
        this.MEM.writeReg(rd, val);
        break;
    }

    this.wrkWB_ED = this.MM_WB;
    this.iS_WB = {
      val: "WB",
      inst: this.wrkWB_ED,
      instID: this.iS_MM.instID,
      pipeID: this.iS_MM.pipeID,
    };
  }

  startProcessor() {
    do {
      this.writeback();
      this.memory();
      this.instructionExecute();
      this.instructionDecode();
      this.instructionFetch();

      this.updateState();
      this.pipelineState.push({
        IF: this.iS_IF,
        ID: this.iS_ID,
        EX: this.iS_EX,
        MM: this.iS_MM,
        WB: this.iS_WB,
      });
    } while (!this.isPipelineEmpty());

    return this.pipelineState;
  }
}

export default RISC_V;
