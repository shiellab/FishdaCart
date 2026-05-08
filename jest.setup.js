/* global jest */

require('react-native-gesture-handler/jestSetup');

const mockReact = require('react');

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  toggleDrawer: jest.fn(),
};

const mockCreateNavigator = () => ({
  Navigator: ({ children }) => mockReact.createElement(mockReact.Fragment, null, children),
  Group: ({ children }) => mockReact.createElement(mockReact.Fragment, null, children),
  Screen: ({ component: Component, children }) => {
    if (children) {
      return children({ navigation: mockNavigation, route: { params: {} } });
    }

    return Component
      ? mockReact.createElement(Component, { navigation: mockNavigation, route: { params: {} } })
      : null;
  },
});

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => mockReact.createElement(mockReact.Fragment, null, children),
  useFocusEffect: jest.fn(),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: mockCreateNavigator,
}));

jest.mock('@react-navigation/drawer', () => ({
  createDrawerNavigator: mockCreateNavigator,
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: mockCreateNavigator,
}));

jest.mock('@react-navigation/material-top-tabs', () => ({
  createMaterialTopTabNavigator: mockCreateNavigator,
}));

jest.mock('react-native-reanimated', () => ({
  View: 'Animated.View',
  default: {
    View: 'Animated.View',
    createAnimatedComponent: (component) => component,
  },
  createAnimatedComponent: (component) => component,
  useAnimatedStyle: jest.fn((callback) => callback()),
  useSharedValue: jest.fn((value) => ({ value })),
  withTiming: jest.fn((value) => value),
}));

jest.mock('@react-native-firebase/app', () => ({}));

jest.mock('@react-native-firebase/auth', () => {
  const authInstance = {
    currentUser: null,
    onAuthStateChanged: jest.fn((callback) => {
      callback(null);
      return jest.fn();
    }),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signInWithCredential: jest.fn(),
    signOut: jest.fn(),
  };

  const auth = jest.fn(() => authInstance);
  auth.GoogleAuthProvider = {
    credential: jest.fn(() => ({})),
  };

  return auth;
});

jest.mock('@react-native-firebase/firestore', () => {
  const doc = {
    get: jest.fn(async () => ({ exists: false, data: jest.fn(() => ({})) })),
    set: jest.fn(async () => undefined),
    onSnapshot: jest.fn(() => jest.fn()),
  };

  const firestore = jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => doc),
    })),
  }));

  firestore.FieldValue = {
    serverTimestamp: jest.fn(() => new Date()),
  };

  return firestore;
});

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    signIn: jest.fn(),
  },
}));

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');
