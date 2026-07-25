const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      content = content.replace(/from '\.\.\/\.\.\/components/g, "from '../../../components");
      content = content.replace(/from '\.\.\/\.\.\/theme/g, "from '../../../theme");
      content = content.replace(/from '\.\.\/\.\.\/navigation/g, "from '../../../navigation");
      
      // Admin controllers had depth 3 already for components like ../../../components, 
      // now they will be depth 3 anyway: src/admin/screens/AddProductScreen -> ../../../components 
      // wait! Admin screens were in src/screens/Admin/AddProductScreen (depth 3). 
      // Now they are in src/admin/screens/AddProductScreen (depth 3). 
      // So their paths DO NOT change! Only customer screens changed from depth 2 to depth 3.
      
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

// Only customer screens changed depth from src/screens/X to src/customer/screens/X (depth 2 to 3)
// Admin screens moved from src/screens/Admin/X to src/admin/screens/X (depth 3 to 3)
replaceInDir(path.join(__dirname, 'src', 'customer', 'screens'));
