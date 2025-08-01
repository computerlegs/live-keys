const fs = require('fs');
const path = require('path');

const createFromTemplate = (targetName, templateName) => {
  const targetPath = path.join(process.cwd(), targetName);
  const templatePath = path.join(process.cwd(), templateName);

  if (fs.existsSync(targetPath)) {
    console.log(`✅ ${targetName} already exists. Skipping.`);
  } else {
    try {
      fs.copyFileSync(templatePath, targetPath);
      console.log(`✅ Successfully created ${targetName} from template.`);
    } catch (error) {
      console.error(`❌ Failed to create ${targetName}:`, error);
      process.exit(1);
    }
  }
};

console.log('🔐 Setting up live-keys...');

createFromTemplate('keys.json', 'keys.template.json');
createFromTemplate('live-keys.config.json', 'live-keys.config.template.json');

console.log('\n🚀 Setup complete! You can now run the server with `npm run dev`'); 