# Delete All Passwords - Browser Console Script

## Instructions:

1. **Open your browser** and go to: http://localhost:3000/vault
2. **Open the browser console** (Press F12, or right-click → Inspect → Console tab)
3. **Copy and paste this code** into the console:

```javascript
// Step 1: Delete all passwords
console.log('🗑️  Deleting all passwords...');

fetch('/api/dev/delete-all-passwords', {
  method: 'DELETE',
  credentials: 'include'
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('✅ SUCCESS:', data.data.message);
    console.log('📊 Deleted:', data.data.deletedCount, 'password(s)');
    
    // Step 2: Clear browser storage
    console.log('🧹 Clearing browser storage...');
    sessionStorage.clear();
    localStorage.clear();
    console.log('✅ Storage cleared!');
    
    // Step 3: Instructions
    console.log('\n📋 Next steps:');
    console.log('1. Log out (click your profile → Log out)');
    console.log('2. Log back in with your credentials');
    console.log('3. Create a new password in the vault');
    console.log('4. Refresh the page - it should decrypt correctly! 🎉');
    
  } else {
    console.error('❌ Error:', data.error?.message || 'Unknown error');
  }
})
.catch(error => {
  console.error('❌ Network error:', error);
  console.log('💡 Make sure you are logged in and the server is running!');
});
```

## Alternative: Run this one-liner

If you're already on the vault page and logged in, just run this:

```javascript
fetch('/api/dev/delete-all-passwords', { method: 'DELETE', credentials: 'include' }).then(r => r.json()).then(d => console.log('✅', d)).then(() => { sessionStorage.clear(); localStorage.clear(); console.log('✅ Storage cleared! Now log out and back in.'); });
```

---

## What This Does:

1. ✅ Calls the API to delete all your passwords from the database
2. ✅ Clears your browser's session and local storage
3. ✅ Shows you the next steps

## After Running:

You'll see output like:
```
🗑️  Deleting all passwords...
✅ SUCCESS: Successfully deleted 4 password(s)
📊 Deleted: 4 password(s)
🧹 Clearing browser storage...
✅ Storage cleared!

📋 Next steps:
1. Log out (click your profile → Log out)
2. Log back in with your credentials
3. Create a new password in the vault
4. Refresh the page - it should decrypt correctly! 🎉
```

Then just follow those steps and you're done! The new passwords you create will work perfectly.
