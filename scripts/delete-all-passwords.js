#!/usr/bin/env node
/**
 * Delete All Passwords Script
 * WARNING: This will permanently delete ALL passwords for a user!
 * Only use this if passwords cannot be decrypted and you want to start fresh.
 * 
 * Usage: node scripts/delete-all-passwords.js <email>
 */

import { connectDB } from "../src/lib/db/connection.js";
import { UserModel, PasswordEntryModel } from "../src/lib/db/models.js";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function deleteAllPasswords(email) {
  try {
    await connectDB();
    console.log("✓ Connected to database\n");

    const user = await UserModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }

    const count = await PasswordEntryModel.countDocuments({ 
      userId: user._id.toString() 
    });

    if (count === 0) {
      console.log(`No passwords found for ${email}`);
      process.exit(0);
    }

    console.log(`⚠️  WARNING: This will delete ${count} password(s) for ${email}`);
    console.log("This action CANNOT be undone!\n");

    const confirm = await question("Type 'DELETE' to confirm: ");

    if (confirm.trim() !== "DELETE") {
      console.log("Cancelled.");
      process.exit(0);
    }

    const result = await PasswordEntryModel.deleteMany({
      userId: user._id.toString(),
    });

    console.log(`\n✓ Deleted ${result.deletedCount} password(s)`);
    console.log("You can now log in and create new passwords with the correct encryption.");

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    rl.close();
    process.exit(1);
  }
}

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/delete-all-passwords.js <email>");
  process.exit(1);
}

deleteAllPasswords(email);
