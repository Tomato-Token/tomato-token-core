module.exports = async function ({ ethers, deployments, getNamedAccounts, network }) {
  const { deploy, execute } = deployments

  const { deployer } = await getNamedAccounts()

  let pool1;
  // 1000 alloc points in total
  if (network.name == "rinkeby") {
    // turn off first 2 pools
    for (var i = 0; i < 2; i++) {
      await execute(
        'MasterChef',
        {from: deployer, log: true},
        'set',
        i,
        0,
        i == 1
      );
    }
  } else {
    // turn off first 11 pools
    for (var i = 0; i < 11; i++) {
      await execute(
        'MasterChef',
        {from: deployer, log: true},
        'set',
        i,
        0,
        i == 10
      );
    }
  }
}

module.exports.tags = ["Pool1Off"]
module.exports.dependencies = ["TomatoToken"]
