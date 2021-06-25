module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
  const { deploy, execute } = deployments

  const { deployer } = await getNamedAccounts()

  await deploy("TomatoToken", {
    from: deployer,
    log: true,
    deterministicDeployment: false
  })

  const tomato = await ethers.getContract("TomatoToken")

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

  await deploy("Atm", {
    from: deployer,
    log: true,
    args: [
      tomato.address,
      wallets,
      shares
    ],
    deterministicDeployment: false
  })

  const atm = await ethers.getContract("Atm");

  const tomatoPerBlock = ethers.utils.parseUnits('1100000', 18);
  let startBlock;
  if (network.name == "rinkeby") {
    startBlock = "8811374";
  } else {
    startBlock = "12697750";
  }
  const bonusEndBlock = "1";

  await deploy("MasterChef", {
    from: deployer,
    args: [
      tomato.address,
      atm.address,
      tomatoPerBlock,
      startBlock,
      bonusEndBlock
    ],
    log: true,
    deterministicDeployment: false
  })

  const masterChef = await ethers.getContract("MasterChef")
  const tomatoTokenMint = ethers.utils.parseUnits('45999998900000', 18);
  const deployerMint = ethers.utils.parseUnits('1100000', 18);
  const totalSupply = ethers.utils.parseUnits('46000000000000', 18);

  if (await tomato.totalSupply() != totalSupply.toString()) {
    if (await tomato.balanceOf(tomato.address) != tomatoTokenMint.toString()) {
      console.log('Mint Tomato to Chef')
      await execute(
        'TomatoToken',
        {from: deployer, log: true},
        'mint',
        tomato.address,
        tomatoTokenMint
      );
    }

    if (await tomato.balanceOf(deployer) != deployerMint.toString()) {
      console.log('Mint Tomato to Deployer')
      await execute(
        'TomatoToken',
        {from: deployer, log: true},
        'mint',
        deployer,
        deployerMint
      );
    }
  }

  if (await tomato.owner() !== masterChef.address) {
    console.log('Transfer Tomato Ownership to Chef')
    await execute(
      'TomatoToken',
      {from: deployer, log: true},
      'transferOwnership',
      masterChef.address
    );
  }
}

module.exports.tags = ["TomatoToken"]
