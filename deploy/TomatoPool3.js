module.exports = async function ({ ethers, deployments, getNamedAccounts, network }) {
  const { deploy, execute } = deployments

  const { deployer } = await getNamedAccounts()

  const tomato = await ethers.getContract("TomatoToken")

  let pool3;
  // 1000 alloc points in total
  if (network.name == "rinkeby") {
    pool3 = [
      {
        // Tomato
        allocPoint: 250,
        lpToken: tomato.address,
        withUpdate: false
      },
    ]
  } else {
    pool3 = [
      {
        // Tomato
        allocPoint: 250000,
        lpToken: tomato.address,
        withUpdate: false
      },
    ]
  }

  for (var i = 0; i < pool3.length; i++) {
    await execute(
      'MasterChef',
      {from: deployer, log: true},
      'add',
      pool3[i].allocPoint,
      pool3[i].lpToken,
      pool3[i].withUpdate
    );
  }
}

module.exports.tags = ["Pool3"]
module.exports.dependencies = ["TomatoToken"]
