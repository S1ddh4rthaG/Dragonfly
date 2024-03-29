const instructions = {
  add: "r",
  sub: "r",
  xor: "r",
  or: "r",
  and: "r",
  sll: "r",
  srl: "r",
  sra: "r",
  slt: "r",
  sltu: "r", //R-Type
  addi: "i",
  xori: "i",
  ori: "i",
  andi: "i",
  slli: "i",
  srli: "i",
  srai: "i",
  slti: "i",
  sltiu: "i", //I-Type
  lb: "i",
  lh: "i",
  lw: "i",
  lbu: "i",
  lhu: "i",
  jalr: "i", //I-Type(Special)
  sb: "s",
  sh: "s",
  sw: "s", //S-Type
  beq: "sb",
  bne: "sb",
  blt: "sb",
  bge: "sb",
  bltu: "sb",
  bgeu: "sb", //SB-Type
  lui: "u",
  auipc: "u",
  jal: "uj", //U,UJ-Type
};

let labels = {};

const registers = {
  zero: 0,
  ra: 1,
  sp: 2,
  gp: 3,
  tp: 4,
  t0: 5,
  t1: 6,
  t2: 7,
  s0: 8,
  fp: 8,
  s1: 9,
  a0: 10,
  a1: 11,
  a2: 12,
  a3: 13,
  a4: 14,
  a5: 15,
  a6: 16,
  a7: 17,
  s2: 18,
  s3: 19,
  s4: 20,
  s5: 21,
  s6: 22,
  s7: 23,
  s8: 24,
  s9: 25,
  s10: 26,
  s11: 27,
  t3: 28,
  t4: 29,
  t5: 30,
  t6: 31,
  x0: 0,
  x1: 1,
  x2: 2,
  x3: 3,
  x4: 4,
  x5: 5,
  x6: 6,
  x7: 7,
  x8: 8,
  x9: 9,
  x10: 10,
  x11: 11,
  x12: 12,
  x13: 13,
  x14: 14,
  x15: 15,
  x16: 16,
  x17: 17,
  x18: 18,
  x19: 19,
  x20: 20,
  x21: 21,
  x22: 22,
  x23: 23,
  x24: 24,
  x25: 25,
  x26: 26,
  x27: 27,
  x28: 28,
  x29: 29,
  x30: 30,
  x31: 31,
};

class Lexer {
  constructor(source) {
    this.getSourceStream(source);
  }

  init() {
    this.pos = 0;
    this.line = 0;
    this.slines = 0;
    this.lexemes = [];
    this.lex_lines = [];
  }

  getSourceStream(source) {
    this.str = source;
    this.init();
    this.getTextTokens();
  }

  current() {
    return this.str[this.pos];
  }

  line_lexer() {
    if (this.lexemes != 0) {
      this.line++;
      this.lex_lines = [...this.lex_lines, ...this.lexemes];
      this.lexemes = [];
    }
    this.slines++;
  }

  isDigit() {
    return /[0-9]/.test(this.str[this.pos]);
  }

  isAplhaNumeric() {
    var lt = this.str[this.pos];
    if (lt == undefined) return false;

    return /[a-zA-Z0-9!@%&]/.test(this.str[this.pos]);
  }

  isChar() {
    var lt = this.str[this.pos];
    if (lt == undefined) return false;

    return /[a-zA-Z]/.test(this.str[this.pos]);
  }

  isNewLine() {
    return this.current() == "\n";
  }

  isEOF() {
    return this.current() == undefined;
  }

  isWhitespace() {
    var lt = this.str[this.pos];
    if (lt == undefined) return false;

    return /\s/.test(this.str[this.pos]);
  }

  addLabels(val) {
    if (Object.keys(labels).includes(val)) {
      console.log("Label Declared More than once");
    } else {
      labels[val] = this.line;
    }
  }

  getTextTokens() {
    while (this.pos <= this.str.length) {
      let ch = this.str[this.pos];
      let tkn = null;

      switch (true) {
        case ch == undefined:
          this.pos++;
          tkn = {
            type: "EOF",
            line: this.slines,
          };
          this.lexemes.push(tkn);
          this.line_lexer();
          break;

        case ch === ",":
          this.pos++;
          tkn = {
            type: "COMMA",
            line: this.slines,
          };
          this.lexemes.push(tkn);
          break;

        case ch === ":":
          this.pos++;
          tkn = {
            type: "SCLN",
            line: this.slines,
          };
          this.lexemes.push(tkn);
          break;

        case ch == "#":
          while (!(this.isNewLine() || this.isEOF())) {
            this.pos++;
          }
          break;

        case ch == "-":
          var val = "-";
          this.pos++;

          var isNumber = this.isDigit();

          if (isNumber)
            while (this.isDigit()) {
              val += this.str[this.pos++];
            }

          if (isNumber)
            tkn = {
              type: "NegNumericLiteral",
              value: Number(val),
              line: this.slines,
            };
          else {
            tkn = {
              type: "MINUS",
              line: this.slines,
            };
          }
          this.lexemes.push(tkn);
          break;

        case ch == "(":
          this.pos++;
          tkn = {
            type: "LBKT",
            line: this.slines,
          };
          this.lexemes.push(tkn);
          break;

        case ch == ")":
          this.pos++;
          tkn = {
            type: "RBKT",
            line: this.slines,
          };
          this.lexemes.push(tkn);
          break;

        case ch == "\n":
          this.pos++;
          tkn = {
            type: "NEWLINE",
            line: this.slines,
          };
          if (this.lexemes.length != 0) this.lexemes.push(tkn);
          this.line_lexer();
          break;

        case this.isDigit():
          var val = "";
          var isAN, isLabel;

          while (this.isDigit()) {
            val += this.str[this.pos++];
          }

          isAN = this.isChar();
          while (this.isChar()) {
            val += this.str[this.pos++];
          }

          if (!isAN) {
            tkn = {
              type: "PosNumericLiteral",
              value: parseInt(val),
              line: this.slines,
            };
          } else {
            while (this.isWhitespace()) {
              this.pos++;
            }

            if (this.current() == ":") {
              isLabel = true;
              this.pos++;
              this.addLabels(val);
            } else if (Object.keys(labels).includes(val)) {
              tkn = {
                type: "LabelDestination",
                value: {
                  sourceLine: labels[val],
                  offset: (labels[val] - this.line) * 4,
                },
                line: this.slines,
              };
            } else {
              tkn = {
                type: "PrefixNumericString",
                value: val,
                instLine: this.line,
                line: this.slines,
              };
            }
          }

          if (!isLabel) this.lexemes.push(tkn);
          break;

        case this.isChar():
          var val = "";
          var isxReg = false,
            isLabel = false;

          if (ch == "x") {
            val += ch;
            this.pos++;

            while (this.isWhitespace()) {
              this.pos++;
            }

            isxReg = this.isDigit();
            while (this.isDigit()) {
              val += this.str[this.pos++];
            }
          }

          isxReg = !this.isAplhaNumeric() && isxReg;
          var hasNumbers = false;

          while (this.isAplhaNumeric()) {
            if (!hasNumbers) hasNumbers = this.isDigit();
            val += this.str[this.pos++];
          }

          var isKeyword = Object.keys(instructions).includes(val);
          var isReg = Object.keys(registers).includes(val.toLocaleLowerCase());

          if (isxReg) {
            tkn = {
              type: "Register",
              value: {
                type: "x",
                value: Number(val.substring(1)),
              },
              line: this.slines,
            };
          } else if (isReg) {
            tkn = {
              type: "Register",
              value: {
                type: "Named",
                value: registers[val.toLowerCase()],
              },
              line: this.slines,
            };
          } else if (isKeyword) {
            tkn = {
              type: "Keyword",
              value: val,
              instFmt: instructions[val],
              line: this.slines,
            };
          } else if (!isKeyword) {
            while (this.isWhitespace() && !this.isNewLine()) {
              this.pos++;
            }

            if (this.current() == ":") {
              isLabel = true;
              this.addLabels(val);
              this.pos++;
            } else {
              if (Object.keys(labels).includes(val)) {
                tkn = {
                  type: "LabelDestination",
                  value: {
                    sourceLine: labels[val],
                    offset: labels[val] - this.line,
                  },
                  line: this.slines,
                };
              } else {
                tkn = {
                  type: "AlphaNumericString",
                  value: val,
                  isString: !hasNumbers,
                  instLine: this.line,
                  line: this.slines,
                };
              }
            }
          }
          if (!isLabel) this.lexemes.push(tkn);
          break;

        default:
          this.pos++;
      }
    }
  }
}

class ImproperParser {
  constructor(source) {
    this.lexer = new Lexer(
      source.substring(source.lastIndexOf("\n") + 1).trim()
    );
    this.tokens = this.lexer.lex_lines;
    this.pos = 0;
  }

  currentToken() {
    return this.tokens[this.pos];
  }

  recKeywords(str) {
    var pat = str.toLowerCase();
    let l = str.length;

    return Object.keys(instructions).filter((e) => e.substring(0, l) == pat);
  }

  recNamedRegs(str) {
    var pat = str.toLowerCase();
    let l = str.length;

    return Object.keys(registers).filter((e) => e.substring(0, l) == pat);
  }

  reclabels(str) {
    var pat = str.toLowerCase();
    let l = str.length;

    return Object.keys(labels).filter((e) => e.substring(0, l) == pat);
  }

  recComma() {
    let comma = [","];
    return comma;
  }

  recBKT(type) {
    if (type == "r") return [")"];
    else return ["("];
  }

  showRecommendations() {
    this.pos = 0;
    var curr = this.currentToken();

    while (curr.type != "EOF") {
      try {
        if (curr.type == "AlphaNumericString") {
          if (curr.isString) {
            var recKwd = this.recKeywords(curr.value);
            if (recKwd.length != 0) {
              console.log("Recommended Keywords: ", recKwd, this.pos);
              break;
            }
            //to recommend both labels and keywords -> used in a new line
            console.log(
              "Recommended Label: ",
              Object.keys(registers).concat(Object.keys(labels)),
              this.pos
            );
            break;
          } else {
            //recommending labels
            console.log("Recommended Label: ", Object.keys(labels), this.pos);
            break;
          }
        } else if (curr.type == "NEWLINE") {
          this.pos++;
          curr = this.currentToken();
          //new line -> recommending keywords and labels
          console.log(
            "Recommended keywords : ",
            Object.keys(instructions),
            this.pos
          );
          break;
        } else if (curr.type == "Keyword") {
          var inst = [curr.value];

          if (curr.instFmt == "r") {
            this.pos++;
            curr = this.currentToken();

            if (curr.type == "Register") {
              inst.push(curr.value.value);
              this.pos++;
              curr = this.currentToken();
            } else {
              if (curr.type == "AlphaNumericString") {
                if (curr.isString == true) {
                  var recRegs = this.recNamedRegs(curr.value);
                  if (recRegs.length != 0) {
                    console.log("Recommended Named Regs: ", recRegs, this.pos);
                    break;
                  }
                }
              } else {
                console.log(
                  "Recommended Registers : ",
                  Object.keys(registers),
                  this.pos
                );
                break;
              }
            }

            if (curr.type == "COMMA") {
              this.pos++;
              curr = this.currentToken();
            } else {
              console.log("Recommended Comma: ", this.recComma(), this.pos);
              break;
            }

            if (curr.type == "Register") {
              inst.push(curr.value.value);

              this.pos++;
              curr = this.currentToken();
            } else {
              if (curr.type == "AlphaNumericString") {
                if (curr.isString == true) {
                  var recRegs = this.recNamedRegs(curr.value);
                  if (recRegs.length != 0) {
                    console.log("Recommended Named Regs: ", recRegs, this.pos);
                    break;
                  }
                }
              } else {
                console.log(
                  "Recommended Registers : ",
                  Object.keys(registers),
                  this.pos
                );
                break;
              }
            }

            if (curr.type == "COMMA") {
              this.pos++;
              curr = this.currentToken();
            } else {
              console.log("Recommended Comma: ", this.recComma(), this.pos);
              break;
            }

            if (curr.type == "Register") {
              inst.push(curr.value.value);

              this.pos++;
              curr = this.currentToken();
            } else {
              if (curr.type == "AlphaNumericString") {
                if (curr.isString == true) {
                  var recRegs = this.recNamedRegs(curr.value);
                  if (recRegs.length != 0) {
                    console.log("Recommended Named Regs: ", recRegs, this.pos);
                    break;
                  }
                }
              } else {
                console.log(
                  "Recommended Registers : ",
                  Object.keys(registers),
                  this.pos
                );
                break;
              }
            }

            inst.push("r");
          }

          if (curr.instFmt == "i") {
            var keyword = inst[0];
            this.pos++;
            curr = this.currentToken();

            if (curr.type == "Register") {
              inst.push(curr.value.value);

              this.pos++;
              curr = this.currentToken();
            } else {
              if (curr.type == "AlphaNumericString") {
                if (curr.isString == true) {
                  var recRegs = this.recNamedRegs(curr.value);
                  if (recRegs.length != 0) {
                    console.log("Recommended Named Regs: ", recRegs, this.pos);
                    break;
                  }
                }
              } else {
                console.log(
                  "Recommended Registers : ",
                  Object.keys(registers),
                  this.pos
                );
                break;
              }
            }

            if (curr.type == "COMMA") {
              this.pos++;
              curr = this.currentToken();
            } else {
              console.log("Recommended Comma: ", this.recComma(), this.pos);
              break;
            }

            if (keyword[0] == "l") {
              var offset;
              if (
                curr.type == "PosNumericLiteral" ||
                curr.type == "NegNumericLiteral"
              ) {
                offset = curr.value;

                this.pos++;
                curr = this.currentToken();
              } else {
                //numerical literal
                break;
              }

              if (curr.type == "LBKT") {
                this.pos++;
                curr = this.currentToken();
              } else {
                console.log("Recommended LBKT: ", this.recBKT("l"), this.pos);
                break;
              }

              if (curr.type == "Register") {
                inst.push(curr.value.value);

                this.pos++;
                curr = this.currentToken();
              } else {
                if (curr.type == "AlphaNumericString") {
                  if (curr.isString == true) {
                    var recRegs = this.recNamedRegs(curr.value);
                    if (recRegs.length != 0) {
                      console.log(
                        "Recommended Named Regs: ",
                        recRegs,
                        this.pos
                      );
                      break;
                    }
                  }
                } else {
                  console.log(
                    "Recommended Registers : ",
                    Object.keys(registers),
                    this.pos
                  );
                  break;
                }
              }

              if (curr.type == "RBKT") {
                this.pos++;
                curr = this.currentToken();
              } else {
                console.log("Recommended RBKT: ", this.recBKT("r"), this.pos);
                break;
              }

              inst.push(offset);
            } else {
              if (curr.type == "Register") {
                inst.push(curr.value.value);
                this.pos++;
                curr = this.currentToken();
              } else {
                if (curr.type == "AlphaNumericString") {
                  if (curr.isString == true) {
                    var recRegs = this.recNamedRegs(curr.value);
                    if (recRegs.length != 0) {
                      console.log(
                        "Recommended Named Regs: ",
                        recRegs,
                        this.pos
                      );
                      break;
                    }
                  }
                } else {
                  console.log(
                    "Recommended Registers : ",
                    Object.keys(registers),
                    this.pos
                  );
                  break;
                }
              }

              if (curr.type == "COMMA") {
                this.pos++;
                curr = this.currentToken();
              } else {
                console.log("Recommended Comma: ", this.recComma(), this.pos);
                break;
              }

              if (inst[0] == "jalr") {
                if (
                  curr.type == "AlphaNumericString" ||
                  curr.type == "PrefixNumericString"
                ) {
                  if (Object.keys(labels).includes(curr.value)) {
                    this.pos++;
                    var offset = (labels[curr.value] - curr.instLine) * 4;
                    inst.push(offset);
                  } else {
                    //label no known -> recommend matching labels
                    console.log(
                      "Recommended Label: ",
                      this.reclabels(curr.value),
                      this.pos
                    );
                    break;
                  }
                } else if (curr.type == "LabelDestination") {
                  this.pos++;
                  inst.push(curr.value.offset);
                } else {
                  //recommend labels
                  console.log(
                    "Recommended Label: ",
                    Object.keys(labels),
                    this.pos
                  );
                  break;
                }
              } else {
                if (
                  curr.type == "PosNumericLiteral" ||
                  curr.type == "NegNumericLiteral"
                ) {
                  this.pos++;
                  inst.push(curr.value);
                } else {
                  //numerical literal
                  break;
                }
              }
            }
            inst.push("i");
          }

          if (curr.instFmt == "s") {
            this.pos++;
            curr = this.currentToken();

            var offset;

            if (curr.type == "Register") {
              inst.push(curr.value.value);

              this.pos++;
              curr = this.currentToken();
            } else {
              //recommend registers
              if (curr.type == "AlphaNumericString") {
                if (curr.isString == true) {
                  var recRegs = this.recNamedRegs(curr.value);
                  if (recRegs.length != 0) {
                    console.log("Recommended Named Regs: ", recRegs, this.pos);
                    break;
                  }
                }
              } else {
                console.log(
                  "Recommended Registers : ",
                  Object.keys(registers),
                  this.pos
                );
                break;
              }
            }

            if (curr.type == "COMMA") {
              this.pos++;
              curr = this.currentToken();
            } else {
              //recommend comma
              console.log("Recommended Comma: ", this.recComma(), this.pos);
              break;
            }

            if (
              curr.type == "PosNumericLiteral" ||
              curr.type == "NegNumericLiteral"
            ) {
              offset = curr.value;
              this.pos++;
              curr = this.currentToken();
            } else {
              //numerical literal
              break;
            }

            if (curr.type == "LBKT") {
              this.pos++;
              curr = this.currentToken();
            } else {
              //left bracket recommendation
              console.log("Recommended LBKT: ", this.recBKT("l"), this.pos);
              break;
            }

            if (curr.type == "Register") {
              inst.push(curr.value.value);

              this.pos++;
              curr = this.currentToken();
            } else {
              if (curr.type == "AlphaNumericString") {
                if (curr.isString == true) {
                  var recRegs = this.recNamedRegs(curr.value);
                  if (recRegs.length != 0) {
                    console.log("Recommended Named Regs: ", recRegs, this.pos);
                    break;
                  }
                }
              } else {
                console.log(
                  "Recommended Registers : ",
                  Object.keys(registers),
                  this.pos
                );
                break;
              }
            }

            if (curr.type == "RBKT") {
              this.pos++;
              curr = this.currentToken();
            } else {
              //right bracket recommendation
              console.log("Recommended RBKT: ", this.recBKT("r"), this.pos);
              break;
            }

            inst.push(offset);
            inst.push("s");
          }

          if (curr.instFmt == "sb") {
            this.pos++;
            curr = this.currentToken();

            if (curr.type == "Register") {
              inst.push(curr.value.value);
              this.pos++;
              curr = this.currentToken();
            } else {
              if (curr.type == "AlphaNumericString") {
                if (curr.isString == true) {
                  var recRegs = this.recNamedRegs(curr.value);
                  if (recRegs.length != 0) {
                    console.log("Recommended Named Regs: ", recRegs, this.pos);
                    break;
                  }
                }
              } else {
                console.log(
                  "Recommended Registers : ",
                  Object.keys(registers),
                  this.pos
                );
                break;
              }
            }

            if (curr.type == "COMMA") {
              this.pos++;
              curr = this.currentToken();
            } else {
              //Expected COMMA
              console.log("Recommended Comma: ", this.recComma(), this.pos);
              break;
            }

            if (curr.type == "Register") {
              inst.push(curr.value.value);
              this.pos++;
              curr = this.currentToken();
            } else {
              if (curr.type == "AlphaNumericString") {
                if (curr.isString == true) {
                  var recRegs = this.recNamedRegs(curr.value);
                  if (recRegs.length != 0) {
                    console.log("Recommended Named Regs: ", recRegs, this.pos);
                    break;
                  }
                }
              } else {
                console.log(
                  "Recommended Registers : ",
                  Object.keys(registers),
                  this.pos
                );
                break;
              }
            }

            if (curr.type == "COMMA") {
              this.pos++;
              curr = this.currentToken();
            } else {
              //Expected COMMA
              console.log("Recommended Comma: ", this.recComma(), this.pos);
              break;
            }

            if (
              curr.type == "AlphaNumericString" ||
              curr.type == "PrefixNumericString"
            ) {
              this.pos++;
              if (Object.keys(labels).includes(curr.value)) {
                var offset = (labels[curr.value] - curr.instLine) * 4;
                inst.push(offset);
              } else {
                //Unknown label -> recommend matching labels
                console.log(
                  "Recommended Label: ",
                  this.reclabels(curr.value),
                  this.pos
                );
                break;
              }
            } else if (curr.type == "LabelDestination") {
              this.pos++;
              inst.push(curr.value.offset);
            } else {
              //recommend all labels
              console.log("Recommended Label: ", Object.keys(labels), this.pos);
              break;
            }
            curr = this.currentToken();
            inst.push("sb");
          }

          if (curr.instFmt == "u" || curr.instFmt == "uj") {
            var instFmt = curr.instFmt;
            this.pos++;
            curr = this.currentToken();

            if (curr.type == "Register") {
              inst.push(curr.value.value);
              this.pos++;
              curr = this.currentToken();
            } else {
              if (curr.type == "AlphaNumericString") {
                if (curr.isString == true) {
                  var recRegs = this.recNamedRegs(curr.value);
                  if (recRegs.length != 0) {
                    console.log("Recommended Named Regs: ", recRegs, this.pos);
                    break;
                  }
                }
              } else {
                console.log(
                  "Recommended Registers : ",
                  Object.keys(registers),
                  this.pos
                );
                break;
              }
            }

            if (curr.type == "COMMA") {
              this.pos++;
              curr = this.currentToken();
            } else {
              //Expected COMMA
              console.log("Recommended Comma: ", this.recComma(), this.pos);
              break;
            }

            if (instFmt == "uj") {
              if (
                curr.type == "AlphaNumericString" ||
                curr.type == "PrefixNumericString"
              ) {
                if (Object.keys(labels).includes(curr.value)) {
                  this.pos++;
                  var offset = (labels[curr.value] - curr.instLine) * 4;
                  inst.push(offset);
                } else {
                  //Unknown label -> recommend matching labels
                  console.log(
                    "Recommended Label: ",
                    this.reclabels(curr.value),
                    this.pos
                  );
                  break;
                }
              } else if (curr.type == "LabelDestination") {
                this.pos++;
                inst.push(curr.value.offset);
              } else {
                // recommend all labels
                console.log(
                  "Recommended Label: ",
                  Object.keys(labels),
                  this.pos
                );
                break;
              }
            } else {
              if (
                curr.type == "PosNumericLiteral" ||
                curr.type == "NegNumericLiteral"
              ) {
                inst.push(curr.value);
                this.pos++;
                curr = this.currentToken();
              } else {
                //Expected NumericLiteral
                break;
              }
            }

            inst.push(instFmt);
          }

          console.log(inst);
          curr = this.currentToken();
        } else {
          this.pos++;
        }
      } catch (err) {
        console.log("ERROR: ", err.message);
        break;
      }
    }
  }

  convertToRiscV() {
    var curr = this.currentToken();

    while (curr.type != "EOF") {
      try {
        if (curr.type == "AlphaNumericString") {
          if (curr.isString) {
            throw new SyntaxError(
              `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected Keyword, Label`
            );
          } else {
            throw new SyntaxError(
              `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected Label`
            );
          }
        } else if (curr.type == "NEWLINE") {
          this.pos++;
          curr = this.currentToken();
        } else if (curr.type == "Keyword") {
          var inst = [curr.value];

          if (curr.instFmt == "r") {
            this.pos++;
            curr = this.currentToken();

            if (curr.type == "Register") {
              inst.push(curr.value.value);

              this.pos++;
              curr = this.currentToken();
            } else {
              throw new SyntaxError(
                `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected Register`
              );
            }

            if (curr.type == "COMMA") {
              this.pos++;
              curr = this.currentToken();
            } else {
              throw new SyntaxError(
                `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected COMMA`
              );
            }

            if (curr.type == "Register") {
              inst.push(curr.value.value);

              this.pos++;
              curr = this.currentToken();
            } else {
              throw new SyntaxError(
                `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected Register`
              );
            }

            if (curr.type == "COMMA") {
              this.pos++;
              curr = this.currentToken();
            } else {
              throw new SyntaxError(
                `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected COMMA`
              );
            }

            if (curr.type == "Register") {
              inst.push(curr.value.value);

              this.pos++;
              curr = this.currentToken();
            } else {
              throw new SyntaxError(
                `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected Register`
              );
            }

            inst.push("r");
          }

          if (curr.instFmt == "i") {
            var keyword = inst[0];
            this.pos++;
            curr = this.currentToken();

            if (curr.type == "Register") {
              inst.push(curr.value.value);

              this.pos++;
              curr = this.currentToken();
            } else {
              throw new SyntaxError(
                `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected Register`
              );
            }

            if (curr.type == "COMMA") {
              this.pos++;
              curr = this.currentToken();
            } else {
              throw new SyntaxError(
                `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected COMMA`
              );
            }

            if (keyword[0] == "l") {
              var offset;
              if (
                curr.type == "PosNumericLiteral" ||
                curr.type == "NegNumericLiteral"
              ) {
                offset = curr.value;
                this.pos++;
                curr = this.currentToken();
              } else {
                throw new SyntaxError(
                  `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected NumericLiteral`
                );
              }

              if (curr.type == "LBKT") {
                this.pos++;
                curr = this.currentToken();
              } else {
                throw new SyntaxError(
                  `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected (`
                );
              }

              if (curr.type == "Register") {
                inst.push(curr.value.value);

                this.pos++;
                curr = this.currentToken();
              } else {
                throw new SyntaxError(
                  `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected Register`
                );
              }

              if (curr.type == "RBKT") {
                this.pos++;
                curr = this.currentToken();
              } else {
                throw new SyntaxError(
                  `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected )`
                );
              }

              inst.push(offset);
            } else {
              if (curr.type == "Register") {
                inst.push(curr.value.value);

                this.pos++;
                curr = this.currentToken();
              } else {
                throw new SyntaxError(
                  `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected Register`
                );
              }

              if (curr.type == "COMMA") {
                this.pos++;
                curr = this.currentToken();
              } else {
                throw new SyntaxError(
                  `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected COMMA`
                );
              }

              if (inst[0] == "jalr") {
                if (
                  curr.type == "AlphaNumericString" ||
                  curr.type == "PrefixNumericString"
                ) {
                  if (Object.keys(labels).includes(curr.value)) {
                    this.pos++;
                    var offset = (labels[curr.value] - curr.instLine) * 4;
                    inst.push(offset);
                  } else {
                    throw new SyntaxError(
                      `Unknown label on line ${curr.line};`
                    );
                  }
                } else if (curr.type == "LabelDestination") {
                  this.pos++;
                  inst.push(curr.value.offset);
                } else {
                  throw new SyntaxError(
                    `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected label`
                  );
                }
              } else {
                if (
                  curr.type == "PosNumericLiteral" ||
                  curr.type == "NegNumericLiteral"
                ) {
                  this.pos++;
                  inst.push(curr.value);
                } else {
                  throw new SyntaxError(
                    `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected NumericLiteral`
                  );
                }
              }
            }
            inst.push("i");
          }

          if (curr.instFmt == "s") {
            this.pos++;
            curr = this.currentToken();

            var offset;

            if (curr.type == "Register") {
              inst.push(curr.value.value);

              this.pos++;
              curr = this.currentToken();
            } else {
              throw new SyntaxError(
                `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected Register`
              );
            }

            if (curr.type == "COMMA") {
              this.pos++;
              curr = this.currentToken();
            } else {
              throw new SyntaxError(
                `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected COMMA`
              );
            }

            if (
              curr.type == "PosNumericLiteral" ||
              curr.type == "NegNumericLiteral"
            ) {
              offset = curr.value;
              this.pos++;
              curr = this.currentToken();
            } else {
              throw new SyntaxError(
                `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected NumericLiteral`
              );
            }

            if (curr.type == "LBKT") {
              this.pos++;
              curr = this.currentToken();
            } else {
              throw new SyntaxError(
                `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected (`
              );
            }

            if (curr.type == "Register") {
              inst.push(curr.value.value);

              this.pos++;
              curr = this.currentToken();
            } else {
              throw new SyntaxError(
                `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected Register`
              );
            }

            if (curr.type == "RBKT") {
              this.pos++;
              curr = this.currentToken();
            } else {
              throw new SyntaxError(
                `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected )`
              );
            }

            inst.push(offset);
            inst.push("s");
          }

          if (curr.instFmt == "sb") {
            this.pos++;
            curr = this.currentToken();

            if (curr.type == "Register") {
              inst.push(curr.value.value);

              this.pos++;
              curr = this.currentToken();
            } else {
              throw new SyntaxError(
                `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected Register`
              );
            }

            if (curr.type == "COMMA") {
              this.pos++;
              curr = this.currentToken();
            } else {
              throw new SyntaxError(
                `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected COMMA`
              );
            }

            if (curr.type == "Register") {
              inst.push(curr.value.value);

              this.pos++;
              curr = this.currentToken();
            } else {
              throw new SyntaxError(
                `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected Register`
              );
            }

            if (curr.type == "COMMA") {
              this.pos++;
              curr = this.currentToken();
            } else {
              throw new SyntaxError(
                `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected COMMA`
              );
            }

            if (
              curr.type == "AlphaNumericString" ||
              curr.type == "PrefixNumericString"
            ) {
              this.pos++;
              if (Object.keys(labels).includes(curr.value)) {
                var offset = (labels[curr.value] - curr.instLine) * 4;
                inst.push(offset);
              } else {
                throw new SyntaxError(`Unknown label on line ${curr.line};`);
              }
            } else if (curr.type == "LabelDestination") {
              this.pos++;
              inst.push(curr.value.offset);
            } else {
              throw new SyntaxError(
                `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected label`
              );
            }
            curr = this.currentToken();
            inst.push("sb");
          }

          if (curr.instFmt == "u" || curr.instFmt == "uj") {
            var instFmt = curr.instFmt;
            this.pos++;
            curr = this.currentToken();

            if (curr.type == "Register") {
              inst.push(curr.value.value);

              this.pos++;
              curr = this.currentToken();
            } else {
              throw new SyntaxError(
                `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected Register`
              );
            }

            if (curr.type == "COMMA") {
              this.pos++;
              curr = this.currentToken();
            } else {
              throw new SyntaxError(
                `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected COMMA`
              );
            }

            if (instFmt == "uj") {
              if (
                curr.type == "AlphaNumericString" ||
                curr.type == "PrefixNumericString"
              ) {
                if (Object.keys(labels).includes(curr.value)) {
                  this.pos++;
                  var offset = (labels[curr.value] - curr.instLine) * 4;
                  inst.push(offset);
                } else {
                  throw new SyntaxError(`Unknown label on line ${curr.line};`);
                }
              } else if (curr.type == "LabelDestination") {
                this.pos++;
                inst.push(curr.value.offset);
              } else {
                throw new SyntaxError(
                  `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected label`
                );
              }
            } else {
              if (
                curr.type == "PosNumericLiteral" ||
                curr.type == "NegNumericLiteral"
              ) {
                inst.push(curr.value);
                this.pos++;
                curr = this.currentToken();
              } else {
                throw new SyntaxError(
                  `Unexpected Token Type: ${curr.type} on line ${curr.line}; Expected NumericLiteral`
                );
              }
            }

            inst.push(instFmt);
          }

          console.log(inst);
          curr = this.currentToken();
        } else {
          this.pos++;
          throw new SyntaxError(
            `Unexpected Token Type: ${curr.type} on line ${curr.line};`
          );
        }
      } catch (err) {
        console.log("ERROR: ", err.message);
        break;
      }
    }
  }
}

// let m = new ImproperParser(
//     'add x10, x10, x10\n\
//     sub x12, x20, x30\n\
//     addi x12, x13, 15\n\
//     lw x10, x102(x120)\n\
//     beq x10, x10, label\n\
//     label3:\n\
//     label:label2:\n\
//     \n\
//     blt x0, x1, label2\n\
//     blt x20, x20, label3\n\
//     sw x10, 000(x10)\n\
//     lui x10, -1000\n\
//     auipc x10, -1000\n\
//     jal x10, label3\
//     \n\n\n\n\
//     '
// );

//let str = ['a', 'ad', 'add', 'add a', 'add a0', 'add a0,', 'add a0, a', 'add a0, a1', 'add a0, a1,', 'add a0, a1, a', 'add a0, a1, a2'];
//let str = ['a', 'ad', 'add', 'addi', 'addi a', 'addi a0', 'addi a0,', 'addi a0, a', 'addi a0, a1', 'addi a0, a1,', 'addi a0, a1, 1',];
//let str = ['\n', 'l', 'lb', 'lb s', 'lb s1', 'lb s1,', 'lb s1, 12', 'lb s1, 12(', 'lb s1, 12(s', 'lb s1, 12(s2', 'lb s1, 12(s2)']
//let str = ['j', 'ja', 'jal', 'jalr', 'jalr t', 'jalr t0', 'jalr t0,', 'jalr t0, t', 'jalr t0, t1', 'jalr t0, t1,', 'jalr t0, t1, l', 'jalr t0, t1, la', 'jalr t0, t1, lab', 'jalr t0, t1, labe', 'jalr t0, t1, label']
//let str = ['s', 'sb', 'sb a', 'sb a0', 'sb a0,', 'sb a0, 9', 'sb a0, 9(', 'sb a0, 9(s', 'sb a0, 9(s1', 'sb a0, 9(s1)']
let st = [
  "b",
  "bl",
  "blt",
  "bltu",
  "bltu z",
  "bltu ze",
  "bltu zer",
  "bltu zero",
  "bltu zero,",
  "bltu zero, a",
  "bltu zero, a0",
  "bltu zero, a0,",
  "bltu zero, a0, l",
  "bltu zero, a0, la",
  "bltu zero, a0, lab",
  "bltu zero, a0, labe",
  "bltu zero, a0, label",
];

let str = ["add x1, s0, s1 \nadd x", "add x1, s"];

//let str = ['l', 'lu', 'lui', 'lui s', 'lui s5', 'lui s5,', 'lui s5, 19']
//let str = ['j', 'ja', 'jal', 'jal a', 'jal a0', 'jal a0,', 'jal a0, l', 'jal a0, la', 'jal a0, lab', 'jal a0, labe', 'jal a0, label']
for (let i = 0; i < str.length; i++) {
  let m = new ImproperParser(str[i]);
  console.log(str[i]);
  //m.convertToRiscV();
  m.showRecommendations();
}
