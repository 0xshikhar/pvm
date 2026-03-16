.PHONY: all clean build link

all: build link

build:
	RUSTC_BOOTSTRAP=1 cargo +1.86.0 build -Zbuild-std=core,alloc --target ./riscv64emac-unknown-none-polkavm.json --release

link:
	polkatool link --strip --output contract.polkavm target/riscv64emac-unknown-none-polkavm/release/contract

clean:
	cargo clean
	rm -f contract.polkavm

disassemble:
	polkatool disassemble contract.polkavm

stats:
	polkatool stats contract.polkavm
