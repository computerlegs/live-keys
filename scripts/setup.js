const fs = require('fs');
const path = require('path');

const targetPath = path.join(process.cwd(), 'keys.json');
const templatePath = path.join(process.cwd(), 'keys.template.json');

console.log('🔐 Setting up SecureStream Key Server...');

if (fs.existsSync(targetPath)) {
  console.log('✅ keys.json already exists. Skipping setup.');
} else {
  try {
    fs.copyFileSync(templatePath, targetPath);
    console.log('✅ Successfully created keys.json from template.');
    console.log('下一步 (Next Step): Please edit keys.json with your API keys.');
  } catch (error) {
    console.error('❌ Failed to create keys.json:', error);
    process.exit(1);
  }
}

console.log('\n🚀 Setup complete! You can now run the server with `npm run dev`'); 