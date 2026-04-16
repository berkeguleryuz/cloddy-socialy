import { ethers } from "hardhat";

// Helper function to wait
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // 1. Deploy CloddyToken
  console.log("\n1. Deploying CloddyToken...");
  const CloddyToken = await ethers.getContractFactory("CloddyToken");
  const cloddyToken = await CloddyToken.deploy(deployer.address);
  await cloddyToken.waitForDeployment();
  console.log("CloddyToken deployed to:", await cloddyToken.getAddress());
  await delay(5000);

  // 2. Deploy CloddyReputation
  console.log("\n2. Deploying CloddyReputation...");
  const CloddyReputation = await ethers.getContractFactory("CloddyReputation");
  const cloddyReputation = await CloddyReputation.deploy();
  await cloddyReputation.waitForDeployment();
  console.log("CloddyReputation deployed to:", await cloddyReputation.getAddress());
  await delay(5000);

  // 3. Deploy CloddyProfile
  console.log("\n3. Deploying CloddyProfile...");
  const CloddyProfile = await ethers.getContractFactory("CloddyProfile");
  const cloddyProfile = await CloddyProfile.deploy();
  await cloddyProfile.waitForDeployment();
  console.log("CloddyProfile deployed to:", await cloddyProfile.getAddress());
  await delay(5000);

  // 4. Deploy CloddyBadges
  console.log("\n4. Deploying CloddyBadges...");
  const baseURI = "https://api.cloddy.io/badges/";
  const CloddyBadges = await ethers.getContractFactory("CloddyBadges");
  const cloddyBadges = await CloddyBadges.deploy(baseURI);
  await cloddyBadges.waitForDeployment();
  console.log("CloddyBadges deployed to:", await cloddyBadges.getAddress());
  await delay(5000);

  // 5. Deploy CloddyTokenGate
  console.log("\n5. Deploying CloddyTokenGate...");
  const CloddyTokenGate = await ethers.getContractFactory("CloddyTokenGate");
  const cloddyTokenGate = await CloddyTokenGate.deploy();
  await cloddyTokenGate.waitForDeployment();
  console.log("CloddyTokenGate deployed to:", await cloddyTokenGate.getAddress());
  await delay(5000);

  // 6. Deploy CloddyEquippable
  console.log("\n6. Deploying CloddyEquippable...");
  const CloddyEquippable = await ethers.getContractFactory("CloddyEquippable");
  const cloddyEquippable = await CloddyEquippable.deploy(await cloddyProfile.getAddress());
  await cloddyEquippable.waitForDeployment();
  console.log("CloddyEquippable deployed to:", await cloddyEquippable.getAddress());
  await delay(5000);

  // 7. Deploy CloddyMarketplace
  console.log("\n7. Deploying CloddyMarketplace...");
  const CloddyMarketplace = await ethers.getContractFactory("CloddyMarketplace");
  const cloddyMarketplace = await CloddyMarketplace.deploy(deployer.address);
  await cloddyMarketplace.waitForDeployment();
  console.log("CloddyMarketplace deployed to:", await cloddyMarketplace.getAddress());
  await delay(5000);

  // Grant roles for integration
  console.log("\n8. Setting up roles...");

  // Grant MINTER_ROLE to reputation contract for profile
  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
  await cloddyProfile.grantRole(MINTER_ROLE, await cloddyReputation.getAddress());
  console.log("Granted MINTER_ROLE to CloddyReputation on CloddyProfile");
  await delay(3000);

  // Grant XP_MANAGER_ROLE on reputation contract
  const XP_MANAGER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("XP_MANAGER_ROLE"));
  await cloddyReputation.grantRole(XP_MANAGER_ROLE, deployer.address);
  console.log("Granted XP_MANAGER_ROLE to deployer");
  await delay(3000);

  // Grant MINTER_ROLE on badges
  await cloddyBadges.grantRole(MINTER_ROLE, deployer.address);
  console.log("Granted MINTER_ROLE to deployer on CloddyBadges");
  await delay(3000);

  // Grant GATE_MANAGER_ROLE on token gate
  const GATE_MANAGER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("GATE_MANAGER_ROLE"));
  await cloddyTokenGate.grantRole(GATE_MANAGER_ROLE, deployer.address);
  console.log("Granted GATE_MANAGER_ROLE to deployer");

  // Summary
  console.log("\n========== DEPLOYMENT SUMMARY ==========");
  console.log("Network: Base Sepolia (chainId: 84532)");
  console.log("=========================================");
  console.log("CloddyToken:", await cloddyToken.getAddress());
  console.log("CloddyReputation:", await cloddyReputation.getAddress());
  console.log("CloddyProfile:", await cloddyProfile.getAddress());
  console.log("CloddyBadges:", await cloddyBadges.getAddress());
  console.log("CloddyTokenGate:", await cloddyTokenGate.getAddress());
  console.log("CloddyEquippable:", await cloddyEquippable.getAddress());
  console.log("CloddyMarketplace:", await cloddyMarketplace.getAddress());
  console.log("==========================================");

  console.log("\n📋 Add these to your .env.local file:");
  console.log(`NEXT_PUBLIC_CLODDY_TOKEN_ADDRESS=${await cloddyToken.getAddress()}`);
  console.log(`NEXT_PUBLIC_CLODDY_PROFILE_ADDRESS=${await cloddyProfile.getAddress()}`);
  console.log(`NEXT_PUBLIC_CLODDY_BADGES_ADDRESS=${await cloddyBadges.getAddress()}`);
  console.log(`NEXT_PUBLIC_CLODDY_REPUTATION_ADDRESS=${await cloddyReputation.getAddress()}`);
  console.log(`NEXT_PUBLIC_CLODDY_MARKETPLACE_ADDRESS=${await cloddyMarketplace.getAddress()}`);
  console.log(`NEXT_PUBLIC_CLODDY_TOKEN_GATE_ADDRESS=${await cloddyTokenGate.getAddress()}`);
  console.log(`NEXT_PUBLIC_CLODDY_EQUIPPABLE_ADDRESS=${await cloddyEquippable.getAddress()}`);

  // Return addresses for verification
  return {
    cloddyToken: await cloddyToken.getAddress(),
    cloddyReputation: await cloddyReputation.getAddress(),
    cloddyProfile: await cloddyProfile.getAddress(),
    cloddyBadges: await cloddyBadges.getAddress(),
    cloddyTokenGate: await cloddyTokenGate.getAddress(),
    cloddyEquippable: await cloddyEquippable.getAddress(),
    cloddyMarketplace: await cloddyMarketplace.getAddress(),
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
