import { Memory } from "./MemoryModule.js";

class RISC_V {
  constructor(Instructions, DataSection) {
    this.IP = 0;
    this.MEM = new Memory();

    this.INST = [
      // ['addi', 1, 0, 2, 'i'],
      // ['add', 2, 1, 1, 'r'],
      // ['jalr',3, 2, 1,'i' ],
      // ['sub', 4, 2, 1, 'r'],
      // ['or', 1, 2, 4, 'r'],
      // ['addi',0, 0, 0, 'i']
      // ['jalr', 3, 0, 2, 'i'],
      // ['addi', 1, 0, 10, 'i'],
      // ['addi', 2, 0, 10, 'i'],
      // ['addi', 1, 0, 1, 'i'],
      // ['add', 2, 1, 1, 'r'],
      // ['beq', 0, 0, 1, 'sb'],
      // ['addi', 1, 0, -2, 'i'],
      // ['or', 1, 2, 4, 'r'],
      // ['addi', 1, 0, 10, 'i'],
      // ['sw', 1, 0, 0, 's'],
      // ['lw', 1, 0, 0, 'i'],
      // ['sw', 1, 0, 4, 's'],
      // ['addi', 1, 0, -256, 'i'],
      // ['sw', 1, 0, 0, 's'],
      // ['sb', 1, 0, 4, 's'],
      // ['sh', 1, 0, 8, 's'],
      // ['lw', 1, 0, 0, 'i'],
      // ['lw', 2, 0, 4, 'i'],
      // ['lw', 3, 0, 8, 'i'],
      // ['addi', 1, 0, 10, 'i'],
      // ['addi', 2, 0, 2, 'i'],
      // ['xori', 3, 0, 100, 'i'],
      // ['ori', 4, 1, 10, 'i'],
      // ['andi', 5, 2, 10, 'i'],
      ["beq", 1, 0, 12, "sb"],
      ["addi", 1, 0, 20, "i"],
      ["addi", 1, 0, 30, "i"],
      ["addi", 1, 0, 40, "i"],
    ];

    // Operational Flags
    this.killIF = false; // Kill instruction?
    this.redoID = false; // Redo instruction decode stage?
    this.tknBranch = false; // Branch taken?
    this.enabledDF = true; // Enable data forwarding?

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

    //Counters
    this.cycles = 0;
    this.kills = 0;
    this.stalls = 0;
    this.wbs = 0;
  }

  feedDataSection() {
    //Do memory operations here
  }

  getInst() {
    if (this.MEM.PC < this.INST.length) return this.INST[this.MEM.PC];
    return undefined;
  }

  setCompFlags(rs1, rs2) {
    //signed comparision
    let l = rs1 < rs2;
    let e = rs1 == rs2;

    this.CompFlags["E"] = e;
    this.CompFlags["L"] = l;
    this.CompFlags["G"] = !l && !e;
    this.CompFlags["LE"] = l || e;
    this.CompFlags["GE"] = !l || e;
  }

  checkRAW(rs1, rs2) {
    if (
      ((rs1 == this.desID || rs2 == this.desID) && this.desID != 0) ||
      ((rs1 == this.desEX || rs2 == this.desEX) && this.desEX != 0) ||
      ((rs1 == this.desMM || rs2 == this.desMM) && this.desMM != 0)
    ) {
      return true;
    }

    return false;
  }

  //immediate value sign extender
  immNsigned(imm, n) {
    const _32bit = 0xffffffff;
    let sign = (1 << (n - 1)) & imm;

    return sign != 0 ? imm | (_32bit << n) : imm;
  }

  forwardRAW(rs1, rs2) {
    let shouldStall,
      values = [undefined, undefined];

    //For load if EX_MM, ID_EX match. For normal if ID_EX match.
    shouldStall =
      (rs1 == this.desID || rs2 == this.desID) &&
      this.desID != 0 &&
      this.ID_EX[0][0] == "l";

    if (!shouldStall) {
      if (rs1 == this.desID && this.desID != 0) values[0] = this.wrkEX_MM[2];
      if (rs1 == this.desEX && this.desEX != 0) values[0] = this.wrkMM_WB[2];
      if (rs2 == this.desID && this.desID != 0) values[1] = this.wrkEX_MM[2];
      if (rs2 == this.desEX && this.desEX != 0) values[1] = this.wrkMM_WB[2];
    }

    return [shouldStall, values];
  }

  isEmpty(buff) {
    return buff == undefined;
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

    // Update Destinations of Buffers
    this.desID =
      this.ID_EX != undefined && this.ID_EX[this.ID_EX.length - 1][0] != "s"
        ? this.ID_EX[1]
        : 0;
    this.desEX =
      this.EX_MM != undefined && this.EX_MM[this.EX_MM.length - 1][0] != "s"
        ? this.EX_MM[1]
        : 0;
    this.desMM =
      this.MM_WB != undefined && this.MM_WB[this.MM_WB.length - 1][0] != "s"
        ? this.MM_WB[1]
        : 0;

    // Increment cycles
    this.cycles++;
  }

  // PIPELINE STAGES
  instructionFetch() {
    if (this.redoID == true) {
      console.log("Is this the fault?");
      this.wrkIF_ID = this.IF_ID;
      return;
    }

    if (this.MEM.PC < this.INST.length * 4) {
      let inst = this.INST[this.MEM.PC / 4];
      if (this.MEM.PC != this.IP) {
        console.log("Not Equal:", this.MEM.PC, this.IP, this.killIF);
        this.killIF = true;

        this.MEM.writePC(this.IP);
      } else {
        this.MEM.writePC(this.MEM.PC + 4);
      }

      this.IP = this.MEM.PC;
      this.wrkIF_ID = inst;
    } else {
      this.wrkIF_ID = undefined;
    }
  }

  instructionDecode() {
    if (this.IF_ID == undefined) {
      this.wrkID_EX = undefined;
      return;
    }

    if (this.killIF == true) {
      // IF_ID Buffer is flushed, So ID Stage can't executed(i.e Bubble/Stall)
      this.IF_ID = undefined;
      this.wrkID_EX = undefined;

      //Single kill resolve
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
            rs1_val = checkList[1][0] != undefined ? checkList[1][0] : rs1_val;
            rs2_val = checkList[1][1] != undefined ? checkList[1][1] : rs2_val;
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
            rs_val = checkList[1][0] != undefined ? checkList[1][0] : rs_val;
          }
        }

        if (!stallCheck && inst[0] == "jalr") {
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
            rs1_val = checkList[1][0] != undefined ? checkList[1][0] : rs1_val;
            rs2_val = checkList[1][1] != undefined ? checkList[1][1] : rs2_val;
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

        if (inst[0] == "jal") {
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
            rs1_val = checkList[1][0] != undefined ? checkList[1][0] : rs1_val;
            rs2_val = checkList[1][1] != undefined ? checkList[1][1] : rs2_val;
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

    // If RAW we need to ID again.
    if (stallCheck) {
      this.stalls++;
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
    if (this.ID_EX == undefined) {
      this.wrkEX_MM = undefined;
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

    this.wrkEX_MM = output;
  }

  memory() {
    if (this.EX_MM == undefined) {
      this.wrkMM_WB = undefined;
      return;
    }

    let keyword = this.EX_MM[0];
    let instFmt = this.EX_MM[this.EX_MM.length - 1];

    let res, addr, rd, rs_val;

    switch (instFmt) {
      case "i":
        if (keyword[0] == "l") {
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
  }

  writeback() {
    if (this.MM_WB == undefined) {
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
  }

  startProcessor() {
    do {
      this.writeback();
      this.memory();
      this.instructionExecute();
      this.instructionDecode();
      this.instructionFetch();

      this.updateState();
      console.log(" ------------------ ");
      console.log("IF", this.IF_ID);
      console.log("ID", this.ID_EX);
      console.log("EX", this.EX_MM);
      console.log("MM", this.MM_WB);
      console.log(" ------------------ ");
    } while (!this.isPipelineEmpty());

    console.log(
      "Cycles: ",
      this.cycles,
      " Kills: ",
      this.kills,
      " Stalls: ",
      this.stalls
    );

    console.log("\n REGISTERS \n");
    console.log("Reg[1]: ", this.MEM.REG[1]);
    console.log("Reg[2]: ", this.MEM.REG[2]);
    console.log("Reg[3]: ", this.MEM.REG[3]);
    console.log("Reg[4]: ", this.MEM.REG[4]);
    console.log("Reg[5]: ", this.MEM.REG[5]);
    console.log("Reg[6]: ", this.MEM.REG[6]);

    console.log("\n MEMORY \n");
    console.log("Mem[0]  : ", this.MEM.readMem(0x0));
    console.log("Mem[4]  : ", this.MEM.readMem(0x4));
    console.log("Mem[8]  : ", this.MEM.readMem(0x8));
    console.log("Mem[12] : ", this.MEM.readMem(0x12));
  }
}

function main() {
  let rc = new RISC_V();
  rc.startProcessor();
}

main();
