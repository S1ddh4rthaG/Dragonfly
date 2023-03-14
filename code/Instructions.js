/*
    <Program> := epsilon | <Smts>
    <Smts> := <Smt> | <Smt> nl <Stmts>
    <Smt>  := <Header> | <Labels> | <Labels> <Inst> | <Inst>
    
    <Header> := .text
    <Labels> := <Label> | <Label> <Labels>
    <Label>  := <STRING>: 
    <Inst>   := <R-Type> | <I-Type> | <S-Type> | <SB-Type> | <U-Type> | <UJ-Type>

    <R-Type>  := <Keyword> <Reg>, <Reg>, <Reg>
    <I-Type>  := <Keyword> <Reg>, <Reg>, <NUMBER> | <Keyword> <Reg>, <NUMBER>(<Reg>) 
    <S-Type>  := <Keyword> <Reg>, <NUMBER>(<Reg>)
    <SB-Type> := <Keyword> <Reg>, <Reg>, <Label> 
    <U-Type>  := <Keyword> <Reg>, <NUMBER>
    <UJ-Type> := <Keyword> <Reg>, <Label>

    <STRING> := string regex
    <NUMBER> := <Decimal> | -<Decimal> | <Hex> | -<Hex>
    <Keyword> := all possible keywords
    <Reg> := x format | named format
*/
