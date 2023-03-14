
# Dragonfly Simulator

Basic RISCV Simulator developed in effort to understand pipelining and data-forwarding concepts made under supervision of Dr. Raghavendra Kanakagiri.

Check it out at [Dragonfly Simulator](https://riscv-simulator.herokuapp.com/)

Check out the details at [Dragonfly](https://docs.google.com/spreadsheets/d/1MTAT29GAzdWuOYdeGXMxk6qQ_8ED9W3Wkp7Lfpar3eE/edit?usp=sharing)





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
  cd Dragonfly/client
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm start
```

[or]

U can dabble with Advanced features by looking into Parser.js, DataParser.js, MemoryModule.js

They have files that are planned to be implimented if this Project is revisited. 
## Screenshots

Editor

![Editor](https://github.com/S1ddh4rthaG/Dragonfly/blob/main/imgs/editor.png)

Pipeline

![Pipeline](https://github.com/S1ddh4rthaG/Dragonfly/blob/main/imgs/pipeline_page.png)

Memory

![Memory](https://github.com/S1ddh4rthaG/Dragonfly/blob/main/imgs/memory.png)

Pipeline Detailed View

![Pipeline Detailed](https://github.com/S1ddh4rthaG/Dragonfly/blob/main/imgs/pipeline.png)


## Attributions
This site uses favicon under CC BY 4.0 License. Please refer to [Twemoji](https://twemoji.twitter.com/) and [Favicon/emojis](https://favicon.io/emoji-favicons/)

Refer to [https://riscv.org/](https://riscv.org/) for additional details regarding RISC-V .