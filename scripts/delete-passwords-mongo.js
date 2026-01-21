#!/usr/bin/env node
/**
 * Delete All Passwords - Direct MongoDB Script
 * WARNING: This will permanently delete ALL passwords for a user!
 * 
 * Usage: node scripts/delete-passwords-mongo.js <email>
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function deletePasswords(email) {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✓ Connected to MongoDB\n');

    const db = client.db();
    const usersCollection = db.collection('users');
    const passwordsCollection = db.collection('passwordentries');

    // Find user
    const user = await usersCollection.findOne({ 
      email: email.toLowerCase() 
    });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log('User Information:');
    console.log('================');
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name || 'N/A'}`);
    console.log(`Has authSalt: ${!!user.authSalt}`);
    if (user.authSalt) {
      console.log(`Salt (first 16 chars): ${user.authSalt.substring(0, 16)}...`);
    }

    // Count passwords
    const count = await passwordsCollection.countDocuments({ 
      userId: user._id.toString() 
    });

    if (count === 0) {
      console.log(`\n✓ No passwords found for ${email}`);
      await client.close();
      process.exit(0);
    }

    console.log(`\n⚠️  Found ${count} password(s) to delete`);
    console.log('⚠️  THIS ACTION CANNOT BE UNDONE!');
    console.log('\nTo proceed, run the following command:');
    console.log(`\nnode scripts/confirm-delete-passwords.js ${email}\n`);

    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.close();
    process.exit(1);
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/delete-passwords-mongo.js <email>');
  process.exit(1);
}

deletePasswords(email);
