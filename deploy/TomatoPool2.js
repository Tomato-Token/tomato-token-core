module.exports = async function ({ ethers, deployments, getNamedAccounts, network }) {
  const { deploy, execute } = deployments

  const { deployer } = await getNamedAccounts()

  let pool2;
  if (network.name == "rinkeby") {
    pool2 = [
      {
        // WETH/USDC
        allocPoint: 750,
        lpToken: "0xB1bC33810F9e6E8D417925236991Fcc5012AaaE8",
        withUpdate: false
      },
    ]
  } else {
    pool2 = [
      {
        // Tomato/ETH
        allocPoint: 375000,
        lpToken: "#",
        withUpdate: false
      },
      {
        // Tomato/SHIBA
        allocPoint: 375000,
        lpToken: "#",
        withUpdate: false
      },
    ]
  }


  for (var i = 0; i < pool2.length; i++) {
    await execute(
      'MasterChef',
      {from: deployer, log: true},
      'add',
      pool2[i].allocPoint,
      pool2[i].lpToken,
      pool2[i].withUpdate
    );
  }
}

module.exports.tags = ["Pool2"]
module.exports.dependencies = ["TomatoToken"]
