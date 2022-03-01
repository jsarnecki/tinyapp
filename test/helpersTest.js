const { assert } = require('chai');

const {
  authenticateUser,
  getUserByEmail,
  findHashPassword,
  getUserURL
} = require('../Helpers/helperFunctions');

  const users = {
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

  const urlDatabase = {
    "b2xVn2": {
      longURL: "http://www.lighthouselabs.ca",
      userID: "admin"
    },
    "9sm5xK": {
      longURL: "http://www.google.com",
      userID: "admin"
    }
  };

  describe('getUserByEmail', function() {
    it('should return a user with a valid email', function() {

      const user = getUserByEmail("user@example.com", users)
      const expectedUserID = "userRandomID";

      assert(user, expectedUserID, 'these emails are the same');
    });

    it('should return undefined if no valid email is found', function() {
      const invalidEmail = getUserByEmail('yoyoyo@gmail.swag', users);

      assert.isUndefined(invalidEmail, 'this email is undefined');
    });
  });

  describe('findHashPassword', function() {
    it('should return a hashpassword connected to the given email', function() {

      const hashPassword = findHashPassword("joshsarnecki@gmail.com", users)
      const expectedHashPassword = '$2a$10$r7vErsgCElCbKdbRfUkASebHpuGUJ9D9h9sBwBb9wyFRuTbgnnQJi';

      assert(hashPassword, expectedHashPassword);
    });
  });

  describe('authenticateUser', function() {
    it('should return object and not throw error if user details are not already stored in the database', function() {

      const test = {
        id: 'thisTest',
        email: 'test@should',
        password: 'notFail'
      };

      const user = authenticateUser(test, users); 
      assert.isObject(user.data);
    });
  });

  describe('getUserURL', function() {
    it('should return return an object containing all the urls that user has stored in the database', function() {

      const adminURLs = getUserURL('admin', urlDatabase);
      const expected = {
        b2xVn2: 'http://www.lighthouselabs.ca',
        '9sm5xK': 'http://www.google.com'
      }

      assert.deepEqual(adminURLs, expected);
    });
  });

  describe('authenticateUser', function() {
    it('should throw appropriate error when input is null', function() {

      const emptyInput = {
        id: null,
        email: 'some@email',
        password: 'shhh super secret'
      };

      const noInputID = authenticateUser(emptyInput);
      const expected = '404 Error: Must fill in all inputs';

      assert(noInputID.error, expected);
    });
  });
