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
    deployer,
    deployer,
    deployer,
    deployer,
    deployer,
    deployer,
    deployer,
    deployer,
    deployer,
    deployer,
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

  await deploy("ATM", {
    from: deployer,
    log: true,
    args: [
      tomato.address,
      wallets,
      shares
    ],
    deterministicDeployment: false
  })

  const atm = await ethers.getContract("ATM")


  const tomatoPerBlock = "10000" + "00000000000000000";
  const startBlock = "8806158";
  const bonusEndBlock = "123876342";

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

  if (await tomato.owner() !== masterChef.address) {
    // Transfer Sushi Ownership to Chef
    await execute(
      'TomatoToken',
      {from: deployer, log: true},
      'transferOwnership',
      masterChef.address
    );
  }

  if (await masterChef.owner() !== deployer) {
    // Transfer ownership of MasterChef to dev
    await execute(
      'MasterChef',
      {from: deployer, log: true},
      'transferOwnership',
      deployer
    );
  }
}

module.exports.tags = ["TomatoToken"]
