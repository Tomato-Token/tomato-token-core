module.exports = async function ({ ethers, deployments, getNamedAccounts, network }) {
  const { deploy, execute } = deployments

  const { deployer } = await getNamedAccounts()

  let pool1;
  // 1000 alloc points in total
  if (network.name == "rinkeby") {
    pool1 = [
      {
        // WETH
        allocPoint: 50,
        lpToken: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
        withUpdate: false
      },
      {
        // USDC
        allocPoint: 50,
        lpToken: "0xeb8f08a975Ab53E34D8a0330E0D34de942C95926",
        withUpdate: false
      },
    ]
  } else {
    pool1 = [
      {
        // SHIBA
        allocPoint: 25000,
        lpToken: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
        withUpdate: false
      },
      {
        // AKITA
        allocPoint: 12500,
        lpToken: "0x3301ee63fb29f863f2333bd4466acb46cd8323e6",
        withUpdate: false
      },
      {
        // ELON
        allocPoint: 12500,
        lpToken: "0x761d38e5ddf6ccf6cf7c55759d5210750b5d60f3",
        withUpdate: false
      },
      {
        // WETH
        allocPoint: 8000,
        lpToken: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        withUpdate: false
      },
      {
        // AAVE
        allocPoint: 6000,
        lpToken: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
        withUpdate: false
      },
      {
        // COMP
        allocPoint: 6000,
        lpToken: "0xc00e94cb662c3520282e6f5717214004a7f26888",
        withUpdate: false
      },
      {
        // UNI
        allocPoint: 6000,
        lpToken: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
        withUpdate: false
      },
      {
        // SUSHI
        allocPoint: 6000,
        lpToken: "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2",
        withUpdate: false
      },
      {
        // SNX
        allocPoint: 6000,
        lpToken: "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f",
        withUpdate: false
      },
      {
        // MKR
        allocPoint: 6000,
        lpToken: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
        withUpdate: false
      },
      {
        // LINK
        allocPoint: 6000,
        lpToken: "0x514910771af9ca656af840dff83e8264ecf986ca",
        withUpdate: true
      },
    ]
  }

  for (var i = 0; i < pool1.length; i++) {
    await execute(
      'MasterChef',
      {from: deployer, log: true},
      'add',
      pool1[i].allocPoint,
      pool1[i].lpToken,
      pool1[i].withUpdate
    );
  }
}

module.exports.tags = ["Pool1"]
module.exports.dependencies = ["TomatoToken"]
