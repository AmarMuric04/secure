#!/usr/bin/env node
// Diagnostic script to check user salt and password encryption
// Run with: node scripts/check-user-salt.js <email>

const { connectDB } = require("./lib/db/connection");
const { UserModel, PasswordEntryModel } = require("./lib/db/models");

async function checkUser(email) {
  try {
    await connectDB();
    console.log("Connected to database\n");

    const user = await UserModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return;
    }

    console.log("User Information:");
    console.log("================");
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name || "N/A"}`);
    console.log(`Auth Provider: ${user.authProvider || "credentials"}`);
    console.log(`Has authHash: ${!!user.authHash}`);
    console.log(`Has authSalt: ${!!user.authSalt}`);
    
    if (user.authSalt) {
      console.log(`Salt (first 20 chars): ${user.authSalt.substring(0, 20)}...`);
      console.log(`Salt length: ${user.authSalt.length} characters`);
    } else {
      console.log("⚠️  WARNING: User has NO authSalt! This will cause decryption to fail.");
    }

    console.log(`Has encryptedVaultKey: ${!!user.encryptedVaultKey}`);
    console.log(`MFA Enabled: ${user.mfaEnabled}`);
    console.log(`Created: ${user.createdAt}`);

    // Check passwords
    const passwords = await PasswordEntryModel.find({ userId: user._id.toString() });
    
    console.log(`\nPassword Entries:`);
    console.log("=================");
    console.log(`Total passwords: ${passwords.length}`);
    
    if (passwords.length > 0) {
      console.log(`\nFirst password details:`);
      const first = passwords[0];
      console.log(`  - ID: ${first._id}`);
      console.log(`  - Created: ${first.createdAt}`);
      console.log(`  - Has encryptedData: ${!!first.encryptedData}`);
      console.log(`  - Has IV: ${!!first.iv}`);
      console.log(`  - Encryption version: ${first.encryptionVersion}`);
      console.log(`  - Favorite: ${first.favorite}`);
      console.log(`  - Password strength: ${first.passwordStrength}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/check-user-salt.js <email>");
  process.exit(1);
}

checkUser(email);
