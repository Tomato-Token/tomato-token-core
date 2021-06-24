import { ethers, deployments, getNamedAccounts, network } from 'hardhat';
import { expect } from "chai";
import { advanceBlockTo } from "./utilities"

describe("Atm", function () {
  const wallets = [
    process.env.TEAM1,
    process.env.TEAM2,
    process.env.TEAM3,
    process.env.TEAM4,
    process.env.TEAM5,
    process.env.TEAM6,
    process.env.TEAM7,
    process.env.TEAM8,
    process.env.TEAM9,
    process.env.TEAM10
  ];

  const shares = [
    3000,
    330,
    170,
    170,
    330,
    1500,
    1500,
    1500,
    750,
    750
  ];

  let tomato: any;
  let atm: any;
  let deployerSigner: any;


  before(async function () {
    this.signers = await ethers.getSigners()
    deployerSigner = this.signers[0]
    this.bob = this.signers[1]
    this.carol = this.signers[2]
    this.dev = this.signers[3]
    this.minter = this.signers[4]
  })

  beforeEach(async function () {
    const TomatoToken = await ethers.getContractFactory("TomatoToken")
    const Atm = await ethers.getContractFactory("Atm")
    tomato = await TomatoToken.deploy()
    await tomato.deployed()
    atm = await Atm.deploy(tomato.address, wallets, shares)
    await atm.deployed()
  })

  it('check wallets', async function () {
    for (let index = 0; index < wallets.length; index++) {
      expect(await atm.shares(wallets[index])).to.be.equal(shares[index]);
    }
  })

  it('check balances', async function () {
    const tests = [
      {
        mint: 10000,
        wallet: {
          index: 0,
          preBalance: 0,
          postBalance: 3000,
          preWithdraw: 0,
          postWithdraw: 3000,
          preAvailable: 3000,
          postAvailable: 0,
        },
        atm: {
          preBalance: 0,
          midBalance: 10000,
          postBalance: 7000
        }
      },
      {
        mint: 0,
        wallet: {
          index: 1,
          preBalance: 0,
          postBalance: 330,
          preWithdraw: 0,
          postWithdraw: 330,
          preAvailable: 330,
          postAvailable: 0,
        },
        atm: {
          preBalance: 7000,
          midBalance: 7000,
          postBalance: 6670
        }
      },
      {
        mint: 0,
        wallet: {
          index: 5,
          preBalance: 0,
          postBalance: 1500,
          preWithdraw: 0,
          postWithdraw: 1500,
          preAvailable: 1500,
          postAvailable: 0,
        },
        atm: {
          preBalance: 6670,
          midBalance: 6670,
          postBalance: 5170
        }
      },
      {
        // 15000
        mint: 5000,
        wallet: {
          index: 5,
          preBalance: 1500,
          postBalance: 2250,
          preWithdraw: 1500,
          postWithdraw: 2250,
          preAvailable: 750,
          postAvailable: 0,
        },
        atm: {
          preBalance: 5170,
          midBalance: 10170,
          postBalance: 9420
        }
      },
      {
        // 20000
        mint: 5000,
        wallet: {
          index: 2,
          preBalance: 0,
          postBalance: 340,
          preWithdraw: 0,
          postWithdraw: 340,
          preAvailable: 340,
          postAvailable: 0,
        },
        atm: {
          preBalance: 9420,
          midBalance: 14420,
          postBalance: 14080
        }
      },
      {
        // 25000
        mint: 5000,
        wallet: {
          index: 0,
          preBalance: 3000,
          postBalance: 7500,
          preWithdraw: 3000,
          postWithdraw: 7500,
          preAvailable: 4500,
          postAvailable: 0,
        },
        atm: {
          preBalance: 14080,
          midBalance: 19080,
          postBalance: 14580
        }
      },
      {
        // 50000
        mint: 25000,
        wallet: {
          index: 1,
          preBalance: 330,
          postBalance: 1650,
          preWithdraw: 330,
          postWithdraw: 1650,
          preAvailable: 1320,
          postAvailable: 0,
        },
        atm: {
          preBalance: 14580,
          midBalance: 39580,
          postBalance: 38260
        }
      },
      {
        // 100000
        mint: 50000,
        wallet: {
          index: 9,
          preBalance: 0,
          postBalance: 7500,
          preWithdraw: 0,
          postWithdraw: 7500,
          preAvailable: 7500,
          postAvailable: 0,
        },
        atm: {
          preBalance: 38260,
          midBalance: 88260,
          postBalance: 80760
        }
      },
      {
        // 100000
        mint: 0,
        wallet: {
          index: 0,
          preBalance: 7500,
          postBalance: 30000,
          preWithdraw: 7500,
          postWithdraw: 30000,
          preAvailable: 22500,
          postAvailable: 0,
        },
        atm: {
          preBalance: 80760,
          midBalance: 80760,
          postBalance: 58260
        }
      },
      {
        // 100000
        mint: 0,
        wallet: {
          index: 1,
          preBalance: 1650,
          postBalance: 3300,
          preWithdraw: 1650,
          postWithdraw: 3300,
          preAvailable: 1650,
          postAvailable: 0,
        },
        atm: {
          preBalance: 58260,
          midBalance: 58260,
          postBalance: 56610
        }
      },
      {
        // 100000
        mint: 0,
        wallet: {
          index: 2,
          preBalance: 340,
          postBalance: 1700,
          preWithdraw: 340,
          postWithdraw: 1700,
          preAvailable: 1360,
          postAvailable: 0,
        },
        atm: {
          preBalance: 56610,
          midBalance: 56610,
          postBalance: 55250
        }
      },
      {
        // 100000
        mint: 0,
        wallet: {
          index: 3,
          preBalance: 0,
          postBalance: 1700,
          preWithdraw: 0,
          postWithdraw: 1700,
          preAvailable: 1700,
          postAvailable: 0,
        },
        atm: {
          preBalance: 55250,
          midBalance: 55250,
          postBalance: 53550
        }
      },
      {
        // 100000
        mint: 0,
        wallet: {
          index: 4,
          preBalance: 0,
          postBalance: 3300,
          preWithdraw: 0,
          postWithdraw: 3300,
          preAvailable: 3300,
          postAvailable: 0,
        },
        atm: {
          preBalance: 53550,
          midBalance: 53550,
          postBalance: 50250
        }
      },
      {
        // 100000
        mint: 0,
        wallet: {
          index: 5,
          preBalance: 2250,
          postBalance: 15000,
          preWithdraw: 2250,
          postWithdraw: 15000,
          preAvailable: 12750,
          postAvailable: 0,
        },
        atm: {
          preBalance: 50250,
          midBalance: 50250,
          postBalance: 37500
        }
      },
      {
        // 100000
        mint: 0,
        wallet: {
          index: 6,
          preBalance: 0,
          postBalance: 15000,
          preWithdraw: 0,
          postWithdraw: 15000,
          preAvailable: 15000,
          postAvailable: 0,
        },
        atm: {
          preBalance: 37500,
          midBalance: 37500,
          postBalance: 22500
        }
      },
      {
        // 100000
        mint: 0,
        wallet: {
          index: 7,
          preBalance: 0,
          postBalance: 15000,
          preWithdraw: 0,
          postWithdraw: 15000,
          preAvailable: 15000,
          postAvailable: 0,
        },
        atm: {
          preBalance: 22500,
          midBalance: 22500,
          postBalance: 7500
        }
      },
      {
        // 100000
        mint: 0,
        wallet: {
          index: 8,
          preBalance: 0,
          postBalance: 7500,
          preWithdraw: 0,
          postWithdraw: 7500,
          preAvailable: 7500,
          postAvailable: 0,
        },
        atm: {
          preBalance: 7500,
          midBalance: 7500,
          postBalance: 0
        }
      },
      {
        // 100000
        mint: 0,
        wallet: {
          index: 9,
          preBalance: 7500,
          postBalance: 7500,
          preWithdraw: 7500,
          postWithdraw: 7500,
          preAvailable: 0,
          postAvailable: 0,
        },
        atm: {
          preBalance: 0,
          midBalance: 0,
          postBalance: 0
        }
      },
    ]
    process.stdout.write("withdraw: ");
    for (let index = 0; index < tests.length; index++) {
      process.stdout.write(index.toString() + ",");

      const testCase = tests[index];
      const user = wallets[testCase.wallet.index];
      const userShares = shares[testCase.wallet.index];

      expect(await tomato.balanceOf(atm.address)).to.be.equal(testCase.atm.preBalance)

      if (testCase.mint > 0) await tomato.mint(atm.address, testCase.mint);
      expect(await tomato.balanceOf(atm.address)).to.be.equal(testCase.atm.midBalance)

      await deployerSigner.sendTransaction({
        to: user,
        value: ethers.utils.parseEther("0.1")
      });

      await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [user]
      })

      expect(await tomato.balanceOf(user)).to.be.equal(testCase.wallet.preBalance);

      let atmBalance = await tomato.balanceOf(atm.address);
      let userAvailable = await atm.available(user);
      expect(userAvailable).to.be.equal(testCase.wallet.preAvailable);
      let userWithdrawn = await atm.withdrawn(user);
      expect(userWithdrawn).to.be.equal(testCase.wallet.preWithdraw);

      const signer = await ethers.provider.getSigner(user);
      let tx = await atm.connect(signer).withdraw();

      expect(await tomato.balanceOf(user)).to.be.equal(testCase.wallet.postBalance);
      expect(await tomato.balanceOf(atm.address)).to.be.equal(testCase.atm.postBalance);
      expect(await atm.available(user)).to.be.equal(testCase.wallet.postAvailable);
      expect(await atm.withdrawn(user)).to.be.equal(testCase.wallet.postWithdraw);

      await network.provider.request({
        method: "hardhat_stopImpersonatingAccount",
        params: [user]}
      )
    }
    console.log("done")
  })
})
