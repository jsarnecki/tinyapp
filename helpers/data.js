const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "admin"
  }
};

const users = {
  'admin': {
      id: 'admin',
      email: 'joshsarnecki@gmail.com',
      password: '$2a$10$r7vErsgCElCbKdbRfUkASebHpuGUJ9D9h9sBwBb9wyFRuTbgnnQJi'
  }
};

// For potential testing purposes
const testDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "admin"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "admin"
  }
};

const testUsers = {
  'testUser': {
    id: 'testUser',
    email: 'test@user.ca',
    password: '$2a$10$bmDZVNexuP9GZHPtrOVywepwP2tlrZvehKGwm9WxWpyxwc.f8Prrm'
  },
  'admin': {
      id: 'admin',
      email: 'joshsarnecki@gmail.com',
      password: '$2a$10$r7vErsgCElCbKdbRfUkASebHpuGUJ9D9h9sBwBb9wyFRuTbgnnQJi'
  },
  "userRandomID": {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
  }
};

module.exports = { users, urlDatabase };