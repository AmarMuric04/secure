#!/usr/bin/env node
/**
 * Confirm and Delete All Passwords
 * 
 * Usage: node scripts/confirm-delete-passwords.js <email>
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function confirmAndDelete(email) {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    
    const db = client.db();
    const usersCollection = db.collection('users');
    const passwordsCollection = db.collection('passwordentries');

    const user = await usersCollection.findOne({ 
      email: email.toLowerCase() 
    });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      rl.close();
      await client.close();
      process.exit(1);
    }

    const count = await passwordsCollection.countDocuments({ 
      userId: user._id.toString() 
    });

    if (count === 0) {
      console.log(`✓ No passwords to delete for ${email}`);
      rl.close();
      await client.close();
      process.exit(0);
    }

    console.log(`\n⚠️  WARNING: About to delete ${count} password(s) for ${email}`);
    console.log('⚠️  THIS ACTION CANNOT BE UNDONE!\n');

    const confirm = await question('Type "DELETE" to confirm: ');

    if (confirm.trim() !== 'DELETE') {
      console.log('\n❌ Cancelled - nothing was deleted.');
      rl.close();
      await client.close();
      process.exit(0);
    }

    const result = await passwordsCollection.deleteMany({
      userId: user._id.toString(),
    });

    console.log(`\n✅ SUCCESS! Deleted ${result.deletedCount} password(s)`);
    console.log('\nNext steps:');
    console.log('1. Clear browser storage: sessionStorage.clear(); localStorage.clear();');
    console.log('2. Log out and log back in');
    console.log('3. Create new passwords - they will work correctly!\n');

    rl.close();
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    await client.close();
    process.exit(1);
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/confirm-delete-passwords.js <email>');
  process.exit(1);
}

confirmAndDelete(email);
