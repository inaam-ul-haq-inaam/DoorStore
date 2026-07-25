const fs = require('fs');
const path = require('path');

function replaceAll(filePath, searchStr, replaceStr) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(new RegExp(searchStr, 'g'), replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
}

// Fix types.ts
const typesPath = path.join(__dirname, 'src/navigation/types.ts');
replaceAll(typesPath, 'MainTabs: NavigatorScreenParams<MainTabParamList>;', 'MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;');

// Fix controllers
const customerDir = path.join(__dirname, 'src/customer/screens');

const cartCtrl = path.join(customerDir, 'CartScreen/controller.ts');
replaceAll(cartCtrl, 'RootStackNavigationProp', 'CustomerStackNavigationProp');

const checkoutCtrl = path.join(customerDir, 'CheckoutScreen/controller.ts');
replaceAll(checkoutCtrl, 'RootStackNavigationProp', 'CustomerStackNavigationProp');

const homeCtrl = path.join(customerDir, 'HomeScreen/controller.ts');
// HomeScreen is inside MainTabs. Its prop should probably be MainTabNavigationProp<'Home'>,
// but CustomerStackNavigationProp works if we use it directly since it has access to the stack.
// Actually, earlier it was RootStackNavigationProp. Replacing with CustomerStackNavigationProp will fix it.
replaceAll(homeCtrl, 'RootStackNavigationProp', 'CustomerStackNavigationProp');

const orderSuccessCtrl = path.join(customerDir, 'OrderSuccessScreen/controller.ts');
replaceAll(orderSuccessCtrl, 'RootStackNavigationProp', 'CustomerStackNavigationProp');
replaceAll(orderSuccessCtrl, 'RootStackParamList', 'CustomerStackParamList');

const productDetailsCtrl = path.join(customerDir, 'ProductDetailsScreen/controller.ts');
replaceAll(productDetailsCtrl, 'RootStackNavigationProp', 'CustomerStackNavigationProp');
replaceAll(productDetailsCtrl, 'RootStackParamList', 'CustomerStackParamList');
