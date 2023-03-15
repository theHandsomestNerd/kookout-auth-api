import authService from "./authService";

const providerName = 'password';

// const provider = new TwitterAuthProvider();

const findProvider = (firebaseUser: any) => {
  return authService.findProvider(firebaseUser, providerName);
};

const getDisplayName = (firebaseUser: any) => {
  const passwordProviderFound = findProvider(firebaseUser);

  if (passwordProviderFound) {
    return passwordProviderFound.displayName;
  }
  return 'This User does not have password auth';
};

const getEmail = (firebaseUser: any) => {
  const passwordProviderFound = findProvider(firebaseUser);

  if (passwordProviderFound) {
    return passwordProviderFound.email;
  }
  return 'This User does not have password auth';
};

export default {
  getDisplayName,
  getEmail,
  findProvider,
  providerName,
};
