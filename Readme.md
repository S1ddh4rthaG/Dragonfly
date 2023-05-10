
# Dragonfly Simulator

Basic RISCV Simulator developed in effort to understand pipelining and data-forwarding concepts made under supervision of Dr. Raghavendra Kanakagiri.

Check it out at [Dragonfly Simulator](https://dragonfly.on.fleek.co/) hosted on fleek.co.

Please checkout the design decisions and the thought process behind the project at [Dragonfly](https://docs.google.com/spreadsheets/d/1MTAT29GAzdWuOYdeGXMxk6qQ_8ED9W3Wkp7Lfpar3eE/edit?usp=sharing)


## Features

- Visualize Pipeline
- Toggle DataForwarding
- Registers and Memory display
- Compilation using Parser so pin-point error messages
- Support for **almost** all of basic RISC-V ISA.

## Run Locally

Clone the project

```bash
  git clone https://github.com/S1ddh4rthaG/Dragonfly
```

Go to the project directory

```bash
  npm start
```

[or]

You can dabble with Advanced features by looking into Parser.js, DataParser.js, MemoryModule.js in the misc folder.
They have files that are planned to be implimented if this Project is revisited. 

## Screenshots

Editor

![Editor](https://github.com/S1ddh4rthaG/Dragonfly/blob/main/assets/imgs/editor.png)

Pipeline

![Pipeline](https://github.com/S1ddh4rthaG/Dragonfly/blob/main/assets/imgs/pipeline_page.png)

Memory

![Memory](https://github.com/S1ddh4rthaG/Dragonfly/blob/main/assets/imgs/memory.png)

Dashboard
![Dashboard](https://github.com/S1ddh4rthaG/Dragonfly/blob/main/assets/imgs/dashboard.png)

Stats Board
![StatsBoard](https://github.com/S1ddh4rthaG/Dragonfly/blob/main/assets/imgs/stats_board.png)

Pipeline Detailed View

![Pipeline Detailed](https://github.com/S1ddh4rthaG/Dragonfly/blob/main/assets/imgs/pipeline.png)

## Instructions

### Supported

|S.No               |Inst |Name                              |Syntax/ Syntaxes of Usage|Opcodes|funct3|funct7   |Type|Syntax Rules                   |
|-------------------|-----|----------------------------------|-------------------------|-------|------|---------|----|-------------------------------|
|R-Type Instructions|     |
|1                  |add  |ADD                               |add rd, rs1, rs2         |110011 |0x0   |0x00     |R   |<keyword> <reg> <reg> <reg>    |
|2                  |sub  |SUB                               |sub rd, rs1, rs2         |110011 |0x0   |0x20     |R   |
|3                  |xor  |XOR                               |xor rd, rs1, rs2         |110011 |0x4   |0x00     |R   |
|4                  |or   |OR                                |or rd, rs1, rs2          |110011 |0x6   |0x00     |R   |
|5                  |and  |AND                               |and rd, rs1, rs2         |110011 |0x7   |0x00     |R   |
|6                  |sll  |Shift Left Logical                |sll rd, rs1, rs2         |110011 |0x1   |0x00     |R   |
|7                  |srl  |Shift Right Logical               |srl rd, rs1, rs2         |110011 |0x5   |0x00     |R   |
|8                  |sra  |Shift Right Arthimetic            |sra rd, rs1, rs2         |110011 |0x5   |0x20     |R   |
|9                  |slt  |Set Less than                     |slt rd, rs1, rs2         |110011 |0x2   |0x00     |R   |
|10                 |sltu |Set Less than(Unsigned)           |sltu rd, rs1, rs2        |110011 |0x3   |0x00     |R   |
|                   |     |                                  |                         |       |      |         |    |                               |
|I-Type Instructions|     |
|                   |     |                                  |                         |       |      |imm[5:11]|    |                               |
|11                 |addi |ADD Immediate                     |addi rd, rs1, imm12      |0010011|0x0   |\-       |I   |<keyword> <reg> <reg> <number> |
|12                 |xori |XOR Immediate                     |xori rd, rs1, imm12      |0010011|0x4   |\-       |I   |
|13                 |ori  |OR Immediate                      |ori rd, rs1, imm12       |0010011|0x6   |\-       |I   |
|14                 |andi |AND Immediate                     |andi rd, rs1, imm12      |0010011|0x7   |\-       |I   |
|15                 |slli |Shift Left Logical Immediate      |slli rd, rs1, shamt      |0010011|0x1   |0x00     |I   |
|16                 |srli |Shift Right Logical Immediate     |srli rd, rs1, shamt      |0010011|0x5   |0x00     |I   |
|17                 |srai |Shift Right Arthimetic Immediate  |srai rd, rs1, shamt      |0010011|0x5   |0x20     |I   |
|18                 |slti |Set Less than Immediate           |slti rd, rs1, imm12      |0010011|0x2   |\-       |I   |
|19                 |sltiu|Set Less than Immediate (Unsigned)|sltiu rd, rs1, imm12     |0010011|0x3   |\-       |I   |
|20                 |lb   |Load Byte                         |lb rd, imm12(rs1)        |0000011|0x0   |\-       |I   |<keyword> <reg> <number>(<reg>)|
|21                 |lh   |Load Half                         |lh rd, imm12(rs1)        |0000011|0x1   |\-       |I   |
|22                 |lw   |Load Word                         |lw rd, imm12(rs1)        |0000011|0x2   |\-       |I   |
|23                 |lbu  |Load Byte (Unsigned)              |lbu rd, imm12(rs1)       |0000011|0x4   |\-       |I   |
|24                 |lhu  |Load Half (Unsigned)              |lhu rd, imm12(rs1)       |0000011|0x5   |\-       |I   |
|25                 |jalr |Jump and Link Reg                 |jalr rd, imm12(rs1)      |1100111|0x0   |\-       |I   |
|                   |     |                                  |                         |       |      |         |    |                               |
|S-Type Instructions|     |
|                   |     |                                  |                         |       |      |         |    |                               |
|26                 |sb   |Store Byte                        |sb rs2, imm12(rs1)       |0100011|0x0   |\-       |S   |<keyword> <reg> <number>(<reg>)|
|27                 |sh   |Store Half                        |sh rs2, imm12(rs1)       |0100011|0x1   |\-       |S   |
|28                 |sw   |Store Word                        |sw rs2, imm12(rs1)       |0100011|0x2   |\-       |S   |
|                   |     |                                  |                         |       |      |         |    |                               |
|                   |     |                                  |                         |       |      |         |    |                               |
|29                 |beq  |Branch Equal                      |beq rs1, rs2, imm12      |1100011|0x0   |\-       |SB  |<keyword> <reg> <reg> <number> |
|30                 |bne  |Branch Not Equal                  |bne rs1, rs2, imm12      |1100011|0x1   |\-       |SB  |
|31                 |blt  |Branch Less than                  |blt rs1, rs2, imm12      |1100011|0x4   |\-       |SB  |
|32                 |bge  |Branch Greater than               |bge rs1, rs2, imm12      |1100011|0x5   |\-       |SB  |
|33                 |bltu |Branch Less than (Unsigned)       |bltu rs1, rs2, imm12     |1100011|0x6   |\-       |SB  |
|34                 |bgeu |Branch Greater than (Unsigned)    |bgeu rs1, rs2, imm12     |1100011|0x7   |\-       |SB  |
|                   |     |                                  |                         |       |      |         |    |                               |
|U-Type Instructions|     |
|                   |     |                                  |                         |       |      |         |    |                               |
|35(x)                  |lui  |Load Upper Imm                    |lui rd, imm20            |0110111|\-    |\-       |U   |<keyword> <reg> <number>       |
|36(x)                 |auipc|Add upper imm to PC               |auipc rd, imm20          |0010111|\-    |\-       |U   |
|37                 |jal  |Jump and Link                     |jal rd, imm20            |1101111|\-    |\-       |UJ  |


## Attributions
This site uses favicon under CC BY 4.0 License. Please refer to [Twemoji](https://twemoji.twitter.com/) and [Favicon/emojis](https://favicon.io/emoji-favicons/)

Refer to [https://riscv.org/](https://riscv.org/) for additional details regarding RISC-V .