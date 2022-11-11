const { ethers } = require("hardhat");
const hre = require("hardhat");

const network = hre.network.name;
const config = require(`./../config/${network}.json`);

const abi = require("./../artifacts/contracts/Claimer.sol/Claimer.json").abi;
const amount = 100;

const getSignature = async (wallet, Claimer, amount, deadline) => {
    const hft = await Claimer.hft();
    const nonce = await Claimer.nonces(wallet.address);
    hash = ethers.utils.solidityKeccak256(["address", "address", "address", "uint256", "uint256", "uint256"],
                                    [Claimer.address, hft, wallet.address, amount, deadline, nonce]);
    flatsig = await wallet.signMessage(hash);
    return ethers.utils.splitSignature(flatsig);
}

const main = async () => {
    [wallet] = await ethers.getSigners();
    const Claimer = new ethers.Contract(config.contractAddress, abi, wallet);
    const deadline = parseInt(Date.now() / 1000) + 200;
    sig = await getSignature(wallet, Claimer, amount, deadline);
    res = await Claimer.claimHFT([amount, deadline, sig.v, sig.r, sig.s]);
    await res.wait();
    console.log(`Tx ${res.transactionHash} in block ${res.blockNumber}`)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});