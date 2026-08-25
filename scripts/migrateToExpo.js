const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../Mobile/src/components');
const destDir = path.join(__dirname, '../ExpoMobile/src/components');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);

files.forEach(file => {
  if (!file.endsWith('.jsx')) return;

  const srcPath = path.join(srcDir, file);
  const destPath = path.join(destDir, file);
  
  let content = fs.readFileSync(srcPath, 'utf8');

  // React Router replacements
  content = content.replace(/import\s*\{[^}]*\}\s*from\s*['"]react-router-dom['"];?/g, '');
  content = content.replace(/useNavigate\(\)/g, 'navigation');
  
  // Element replacements
  content = content.replace(/<div/g, '<View');
  content = content.replace(/<\/div>/g, '</View>');
  
  content = content.replace(/<span/g, '<Text');
  content = content.replace(/<\/span>/g, '</Text>');
  
  content = content.replace(/<p/g, '<Text');
  content = content.replace(/<\/p>/g, '</Text>');
  
  content = content.replace(/<h[1-6]/g, '<Text');
  content = content.replace(/<\/h[1-6]>/g, '</Text>');
  
  content = content.replace(/<label/g, '<Text');
  content = content.replace(/<\/label>/g, '</Text>');
  
  content = content.replace(/<button/g, '<TouchableOpacity');
  content = content.replace(/<\/button>/g, '</TouchableOpacity>');
  
  content = content.replace(/<input/g, '<TextInput');
  content = content.replace(/<img/g, '<Image');
  
  content = content.replace(/onClick=/g, 'onPress=');

  // Add React Native imports
  const rnImports = `import { View, Text, TouchableOpacity, TextInput, Image, ScrollView, SafeAreaView } from 'react-native';\n`;
  content = rnImports + content;
  
  fs.writeFileSync(destPath, content);
  console.log(`Migrated ${file}`);
});
