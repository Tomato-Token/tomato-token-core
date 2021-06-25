import {ethers, deployments, getNamedAccounts, network} from 'hardhat';
const {execute, read} = deployments;
import {expect} from 'chai';
import { advanceBlockTo, WETH_ABI } from "./utilities"

describe('TomatoToken', function () {
  let tomatoToken: any;
  let atm: any;
  let weth: any;
  let masterChef: any;
  let deployer: string;
  let deployerSigner: any;

  before(async function () {
    weth = new ethers.Contract(
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      WETH_ABI,
      await ethers.provider.getSigner(deployer)
    );
  })

  beforeEach(async function () {
    const namedAccounts = await getNamedAccounts();
    deployer = namedAccounts.deployer;
    deployerSigner = await ethers.provider.getSigner(deployer);

    await deployments.fixture(['TomatoToken', 'Pool1']);

    tomatoToken = new ethers.Contract(
      (await deployments.get('TomatoToken')).address,
      (await deployments.get('TomatoToken')).abi,
      await ethers.provider.getSigner(deployer)
    );
    atm = new ethers.Contract(
      (await deployments.get('Atm')).address,
      (await deployments.get('Atm')).abi,
      await ethers.provider.getSigner(deployer)
    );
    masterChef = new ethers.Contract(
      (await deployments.get('MasterChef')).address,
      (await deployments.get('MasterChef')).abi,
      await ethers.provider.getSigner(deployer)
    );
  });

  it('totalSupply()', async function () {
    const totalSupply = ethers.utils.parseUnits('46000000000000', 18);
    expect(await tomatoToken.totalSupply()).to.be.equal(totalSupply)
  });

  it('balanceOf()', async function () {
    const totalSupply = ethers.utils.parseUnits('45999998900000', 18);
    expect(await tomatoToken.balanceOf(tomatoToken.address)).to.be.equal(totalSupply)
    const deployerMint = ethers.utils.parseUnits('1100000', 18);
    expect(await tomatoToken.balanceOf(deployer)).to.be.equal(deployerMint)
  });

  it('has pool1', async function () {
    const pool = await masterChef.poolInfo(3)
    expect(pool.lpToken).to.be.equal("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2")
  })

  it('totalAllocPoint()', async function () {
    const totalAllocPoint = await masterChef.totalAllocPoint()
    expect(totalAllocPoint).to.be.equal("100000")
  })

  it('poolLength()', async function () {
    const poolLength = await masterChef.poolLength()
    expect(poolLength).to.be.equal("11")
  })

  describe('Atm', function () {
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

    beforeEach(async function () {
      if(process.env.FORKING == "false") this.skip();
    })

    it('check wallets', async function () {
      for (let index = 0; index < wallets.length; index++) {
        expect(await atm.shares(wallets[index])).to.be.equal(shares[index]);
      }
    })

    it('farm X blocks', async function () {
      const startBlock = await masterChef.startBlock();

      expect(await tomatoToken.balanceOf(atm.address)).to.be.equal(0)

      await weth.deposit({value: "100"});
      await weth.approve(masterChef.address, "1000");
      expect(await weth.balanceOf(deployer)).to.be.equal("100");

      const pid = 3;
      await masterChef.deposit(pid, "100")
      await advanceBlockTo(startBlock.add(15).toString());

      expect(await tomatoToken.balanceOf(atm.address)).to.be.equal(0)

      let tx = await masterChef.massUpdatePools();
      await tx.wait();
      let blocks = ethers.BigNumber.from(tx.blockNumber).sub(startBlock)

      const tomatoPerBlock = await masterChef.sushiPerBlock();
      const totalAllocPoint = await masterChef.totalAllocPoint()
      const pool = await masterChef.poolInfo(pid)

      expect(await tomatoToken.balanceOf(atm.address)).to.be.equal(
        tomatoPerBlock.mul(pool.allocPoint).div(totalAllocPoint).mul(blocks.toString()).div(10)
      )
    })

    it('distributes token to team using atm', async function () {
      const startBlock = await masterChef.startBlock();
      expect(await tomatoToken.balanceOf(atm.address)).to.be.equal(0)

      await weth.deposit({value: "100"});
      await weth.approve(masterChef.address, "1000");
      expect(await weth.balanceOf(deployer)).to.be.equal("100");

      const pid = 3;
      await masterChef.deposit(pid, "100")
      await advanceBlockTo(startBlock.add(15).toString());

      let tx = await masterChef.massUpdatePools();
      await tx.wait();
      let blocks = ethers.BigNumber.from(tx.blockNumber).sub(startBlock)
      const tomatoPerBlock = await masterChef.sushiPerBlock();
      const totalAllocPoint = await masterChef.totalAllocPoint()
      const pool = await masterChef.poolInfo(pid)

      expect(await tomatoToken.balanceOf(atm.address)).to.be.equal(
        tomatoPerBlock.mul(pool.allocPoint).div(totalAllocPoint).mul(blocks.toString()).div(10)
      )

      async function withdrawAtm(user: any, userShares: any) {
        await deployerSigner.sendTransaction({
          to: user,
          value: ethers.utils.parseEther("0.01")
        });

        await network.provider.request({
          method: "hardhat_impersonateAccount",
          params: [user]}
        )

        expect(await atm.shares(user)).to.be.equal(userShares)

        let userStartBal = ethers.BigNumber.from(0) // await tomatoToken.balanceOf(user);
        let atmBalance = await tomatoToken.balanceOf(atm.address);
        let userAvailable = await atm.available(user);
        let userWithdrawn = ethers.BigNumber.from(0) // await atm.withdrawn(user);
        expect(userAvailable).to.be.equal(
          (await atm.currentDepositTotal()).mul(userShares).div(await atm.SHARE_DENOMINATOR()).sub(userWithdrawn)
        )
        const signer = await ethers.provider.getSigner(user);
        let tx = await atm.connect(signer).withdraw();
        let latestBlock = tx.blockNumber;

        expect(await tomatoToken.balanceOf(user)).to.be.equal(userAvailable)
        expect(await atm.available(user)).to.be.equal(0);
        expect(await atm.withdrawn(user)).to.be.equal(userWithdrawn.add(userAvailable));
        expect(await tomatoToken.balanceOf(atm.address)).to.be.equal(atmBalance.sub(userAvailable))

        await network.provider.request({
          method: "hardhat_stopImpersonatingAccount",
          params: [user]}
        )
        return latestBlock;
      }

      expect(await tomatoToken.balanceOf(wallets[0])).to.be.equal(0);
      let latestBlock = await withdrawAtm(wallets[0], shares[0]);
      await advanceBlockTo(ethers.BigNumber.from(latestBlock).add(1).toString());

      expect(await tomatoToken.balanceOf(wallets[1])).to.be.equal(0);
      latestBlock = await withdrawAtm(wallets[1], shares[1]);
      await advanceBlockTo(ethers.BigNumber.from(latestBlock).add(1).toString());

      expect(await tomatoToken.balanceOf(wallets[2])).to.be.equal(0);
      latestBlock = await withdrawAtm(wallets[2], shares[2]);
    })
  })
});
