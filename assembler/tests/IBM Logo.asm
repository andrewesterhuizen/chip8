start:
    CLS
    LD I, lbl_0x022a ; load address of sprite to I register
    LD V0, 0x0c ; load n into reg - 12
    LD V1, 0x08 ; load n into reg
    DRW V0, V1, 0x0f ; draw sprite from mem at I, at x = V0, y = V1
    ADD V0, 0x09 ; add n to V0
    LD I, lbl_0x0239 ; load address of sprite to I register
    DRW V0, V1, 0x0f ; draw sprite from mem at I, at x = V0, y = V1
    LD I, lbl_0x0248 ; load address of sprite to I register
    ADD V0, 0x08 ; add n to V0
    DRW V0, V1, 0x0f ; draw sprite from mem at I, at x = V0, y = V1
    ADD V0, 0x04 ; add n to V0
    LD I, lbl_0x0257 ; load address of sprite to I register
    DRW V0, V1, 0x0f ; draw sprite from mem at I, at x = V0, y = V1
    ADD V0, 0x08 ; add n to V0
    LD I, lbl_0x0266 ; load address of sprite to I register
    DRW V0, V1, 0x0f ; draw sprite from mem at I, at x = V0, y = V1
    ADD V0, 0x08 ; add n to V0
    LD I, lbl_0x0275 ; load address of sprite to I register
    DRW V0, V1, 0x0f ; draw sprite from mem at I, at x = V0, y = V1
lbl_0x0228:
    JP lbl_0x0228
lbl_0x022a:
    DB 0xff    ; 11111111
    DB 0x00    ;         
    DB 0xff    ; 11111111
    DB 0x00    ;         
    DB 0x3c    ;   1111  
    DB 0x00    ;         
    DB 0x3c    ;   1111  
    DB 0x00    ;         
    DB 0x3c    ;   1111  
    DB 0x00    ;         
    DB 0x3c    ;   1111  
    DB 0x00    ;         
    DB 0xff    ; 11111111
    DB 0x00    ;         
    DB 0xff    ; 11111111
lbl_0x0239:
    DB 0xff    ; 11111111
    DB 0x00    ;         
    DB 0xff    ; 11111111
    DB 0x00    ;         
    DB 0x38    ;   111   
    DB 0x00    ;         
    DB 0x3f    ;   111111
    DB 0x00    ;         
    DB 0x3f    ;   111111
    DB 0x00    ;         
    DB 0x38    ;   111   
    DB 0x00    ;         
    DB 0xff    ; 11111111
    DB 0x00    ;         
    DB 0xff    ; 11111111
lbl_0x0248:
    DB 0x80    ; 1       
    DB 0x00    ;         
    DB 0xe0    ; 111     
    DB 0x00    ;         
    DB 0xe0    ; 111     
    DB 0x00    ;         
    DB 0x80    ; 1       
    DB 0x00    ;         
    DB 0x80    ; 1       
    DB 0x00    ;         
    DB 0xe0    ; 111     
    DB 0x00    ;         
    DB 0xe0    ; 111     
    DB 0x00    ;         
    DB 0x80    ; 1       
lbl_0x0257:
    DB 0xf8    ; 11111   
    DB 0x00    ;         
    DB 0xfc    ; 111111  
    DB 0x00    ;         
    DB 0x3e    ;   11111 
    DB 0x00    ;         
    DB 0x3f    ;   111111
    DB 0x00    ;         
    DB 0x3b    ;   111 11
    DB 0x00    ;         
    DB 0x39    ;   111  1
    DB 0x00    ;         
    DB 0xf8    ; 11111   
    DB 0x00    ;         
    DB 0xf8    ; 11111   
lbl_0x0266:
    DB 0x03    ;       11
    DB 0x00    ;         
    DB 0x07    ;      111
    DB 0x00    ;         
    DB 0x0f    ;     1111
    DB 0x00    ;         
    DB 0xbf    ; 1 111111
    DB 0x00    ;         
    DB 0xfb    ; 11111 11
    DB 0x00    ;         
    DB 0xf3    ; 1111  11
    DB 0x00    ;         
    DB 0xe3    ; 111   11
    DB 0x00    ;         
    DB 0x43    ;  1    11
lbl_0x0275:
    DB 0xe0    ; 111     
    DB 0x00    ;         
    DB 0xe0    ; 111     
    DB 0x00    ;         
    DB 0x80    ; 1       
    DB 0x00    ;         
    DB 0x80    ; 1       
    DB 0x00    ;         
    DB 0x80    ; 1       
    DB 0x00    ;         
    DB 0x80    ; 1       
    DB 0x00    ;         
    DB 0xe0    ; 111     
    DB 0x00    ;         
    DB 0xe0    ; 111     

