import { Memory } from "./MemoryModule.js";

let labels = [];
let directives = [
  "string",
  "asciz",
  "equ",
  "byte",
  "2byte",
  "half",
  "short",
  "4byte",
  "word",
  "long",
  "8byte",
  "dword",
  "quad",
];
let special = ["text", "data"];

class DataLexer {
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
    this.getDataTokens();
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

  isASCII() {
    var lt = this.str[this.pos].charCodeAt(0);
    return 0 <= lt && lt <= 127;
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
      labels[val] = null;
      this.lexemes.push({
        type: "MemoryLabel",
        value: val,
        line: this.slines,
      });
    }
  }

  getDataTokens() {
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

        case ch === ".":
          val = "";
          this.pos++;
          while (this.isAplhaNumeric()) {
            val += this.str[this.pos++];
          }

          if (directives.includes(val)) {
            tkn = {
              type: "Directive",
              value: val,
              line: this.slines,
            };
          } else {
            while (this.isAplhaNumeric()) {
              val += this.str[this.pos++];
            }

            this.lexemes.push({
              type: "DOT",
              line: this.slines,
            });

            tkn = {
              type: "AlphaNumericString",
              value: val,
              line: this.slines,
            };
          }
          this.lexemes.push(tkn);
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

        case ch == '"':
          this.pos++;

          val = "";
          while (this.isASCII() && this.str[this.pos] != '"') {
            val += this.str[this.pos++];
          }

          this.lexemes.push({
            type: "STRING",
            value: val,
            line: this.slines,
          });

          this.pos++;
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
          var isAN,
            isLabel = false;

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
            } else {
              tkn = {
                type: "PrefixNumericString",
                value: val,
                line: this.slines,
              };
            }
          }

          if (!isLabel) this.lexemes.push(tkn);
          break;

        case this.isChar():
          var val = "";
          var isLabel = false;

          while (this.isAplhaNumeric()) {
            val += this.str[this.pos++];
          }

          while (this.isWhitespace()) {
            this.pos++;
          }

          if (this.current() == ":") {
            if (special.includes(val)) {
              this.pos++;
              tkn = {
                type: "Section",
                val: val,
                line: this.slines,
              };
            } else {
              isLabel = true;
              this.pos++;
              this.addLabels(val);
            }
          } else {
            tkn = {
              type: "AlphaNumericString",
              value: val,
              line: this.slines,
            };
          }

          if (!isLabel) this.lexemes.push(tkn);
          break;

        default:
          this.pos++;
      }
    }
  }
}

/**let lexer = new DataLexer(`text: \
                            msg: .word 1, 2 \n\
                            msg2: \n
                            .equ 1000000000`);
let tokens = lexer.lex_lines;
console.log(tokens, labels);*/

class ImproperDataParser {
  constructor(source) {
    this.MEM = new Memory();
    this.DataPointer = 0;
    this.lexer = new DataLexer(source);
    this.tokens = this.lexer.lex_lines;
    this.pos = 0;
    console.log(this.tokens); //token printing
    console.log(labels); //check labels
    this.convertToRISCV();
  }

  currentToken() {
    return this.tokens[this.pos];
  }

  alignMemory(val) {
    let rem = this.DataPointer % 4;
    this.MEM.writeMem(
      this.DataPointer - rem,
      (val << ((3 - rem) * 8)) | this.MEM.readMem(this.DataPointer - rem)
    );
    console.log(
      "MEM ADDRESS: ",
      this.DataPointer,
      " value: ",
      (this.MEM.readMem(this.DataPointer - rem) << (8 * rem)) >> 24,
      "Aligned MEM ADDRESS: ",
      this.DataPointer - rem,
      " Aligned value: ",
      this.MEM.readMem(this.DataPointer - rem)
    );
    this.DataPointer++;
  }

  convertToRISCV() {
    this.pos = 0;
    var curr = this.currentToken();

    while (curr.type != "EOF") {
      try {
        if (curr.type == "Section") {
          console.log("Section", curr.val);
        } else if (curr.type == "MemoryLabel") {
          let currentLabel = curr.value;
          this.pos++;
          console.log("MemoryLabel", currentLabel);
          curr = this.currentToken();

          if (curr.type == "Directive") {
            console.log("Directive", curr.value);
            labels[currentLabel] = this.DataPointer;
            switch (curr.value) {
              case "asciz":
              case "string":
                this.pos++;
                curr = this.currentToken();
                console.log(curr);
                if (curr.type == "STRING") {
                  //Use this.MEM
                  //Handle it

                  let str = curr.value;

                  for (let i = 0; i < str.length; i++) {
                    this.alignMemory(str.charCodeAt(i));
                  }

                  if (str.length % 4 == 0) {
                    this.MEM.writeMem(this.DataPointer, 0);
                    console.log(
                      "MEM ADDRESS: ",
                      this.DataPointer,
                      " value: ",
                      this.MEM.readMem(this.DataPointer)
                    );
                    this.DataPointer += 4;
                  }
                }
                break;

              case "equ":
                this.pos++;
                curr = this.currentToken();
                console.log(curr);

                if (
                  curr.type == "PosNumericLiteral" ||
                  curr.type == "NegNumericLiteral"
                ) {
                  //Handle it
                  for (let i = 0; i < 4; i++) {
                    this.alignMemory((curr.value << (i * 8)) >> 24);
                  }
                }
                break;

              case "4byte":
              case "long":
              case "word":
                this.pos++;
                curr = this.currentToken();
                console.log(curr);
                if (
                  curr.type == "PosNumericLiteral" ||
                  curr.type == "NegNumericLiteral"
                ) {
                  for (let i = 0; i < 4; i++) {
                    this.alignMemory((curr.value << (i * 8)) >> 24);
                  }
                }

                while (this.tokens[this.pos + 1].type == "COMMA") {
                  this.pos += 2;
                  curr = this.currentToken();
                  if (
                    curr.type == "PosNumericLiteral" ||
                    curr.type == "NegNumericLiteral"
                  ) {
                    for (let i = 0; i < 4; i++) {
                      this.alignMemory((curr.value << (i * 8)) >> 24);
                    }
                  }
                }
                break;

              case "8byte":
              case "quad":
              case "dword":
                this.pos++;
                curr = this.currentToken();
                console.log(curr);
                if (
                  curr.type == "PosNumericLiteral" ||
                  curr.type == "NegNumericLiteral"
                ) {
                  for (let i = 0; i < 4; i++) {
                    this.alignMemory(0);
                  }
                  for (let i = 0; i < 4; i++) {
                    this.alignMemory((curr.value << (i * 8)) >> 24);
                  }
                }

                while (this.tokens[this.pos + 1].type == "COMMA") {
                  this.pos += 2;
                  curr = this.currentToken();
                  if (
                    curr.type == "PosNumericLiteral" ||
                    curr.type == "NegNumericLiteral"
                  ) {
                    for (let i = 0; i < 4; i++) {
                      this.alignMemory(0);
                    }
                    for (let i = 0; i < 4; i++) {
                      this.alignMemory((curr.value << (i * 8)) >> 24);
                    }
                  }
                }
                break;

              case "byte":
                this.pos++;
                curr = this.currentToken();
                console.log(curr);
                if (
                  curr.type == "PosNumericLiteral" ||
                  curr.type == "NegNumericLiteral"
                ) {
                  this.alignMemory(curr.value);
                }

                while (this.tokens[this.pos + 1].type == "COMMA") {
                  this.pos += 2;
                  curr = this.currentToken();
                  if (
                    curr.type == "PosNumericLiteral" ||
                    curr.type == "NegNumericLiteral"
                  ) {
                    this.alignMemory(curr.value);
                  }
                }
                break;

              case "2byte":
              case "short":
              case "half":
                this.pos++;
                curr = this.currentToken();
                console.log(curr);
                if (
                  curr.type == "PosNumericLiteral" ||
                  curr.type == "NegNumericLiteral"
                ) {
                  this.alignMemory((curr.value << 16) >> 24);
                  this.alignMemory((curr.value << 24) >> 24);
                }

                while (this.tokens[this.pos + 1].type == "COMMA") {
                  this.pos += 2;
                  curr = this.currentToken();
                  if (
                    curr.type == "PosNumericLiteral" ||
                    curr.type == "NegNumericLiteral"
                  ) {
                    this.alignMemory((curr.value << 16) >> 24);
                    this.alignMemory((curr.value << 24) >> 24);
                  }
                }
                break;

              default:
            }
          }
          //Handle it
          //   labels[currentLabel] = ; //Mapped value from memory -------> [done]
        } else if (curr.type == "NEWLINE") {
        /**else if (curr.type == "Directive") {
          //Only directives
        }*/
          console.log(curr.type);
        } else {
          throw new SyntaxError(
            `Unexpected Token Type: ${curr.type} on line ${curr.line};`
          );
        }

        this.pos++;
        curr = this.currentToken();
      } catch (err) {
        console.log("ERROR:", err);
        break;
      }
    }
  }
}

let test = new ImproperDataParser(`data: \
                            msg: .2byte 1, 2, 3 \n
                            msg1: .long 4, 5 \n
                            msg2: .equ 1 \n
                            msg3: .quad 3\n
                            msg4: .string "hello"\n
                            msg5: .word 2 \n
                            msg6: .asciz "hemllo" \n`);

console.log("Labels: ", labels);
