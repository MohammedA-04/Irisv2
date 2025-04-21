# Unit Testing Guide for Iris

This guide explains how to run unit tests for both the frontend and backend components of the Iris application.

## Backend Tests

The backend tests are located in the `backend` directory and use Python's unittest framework to test the Flask application.

### Prerequisites

Make sure you have installed all the dependencies in `requirements.txt` and that your Python environment is properly set up:

```bash
cd backend
pip install -r requirements.txt
```

### Running Backend Tests

To run the backend tests, use the following command:

```bash
cd backend
python -m unittest test_app.py
```

This will execute all the test cases in the `test_app.py` file.

### What's Being Tested

1. **User Registration**: Tests the user registration API endpoint
2. **User Login**: Tests successful login and authentication flow
3. **Input Validation**: Tests that inputs like email are properly validated
4. **Error Handling**: Tests proper error responses for invalid credentials

## Frontend Tests

The frontend tests are located in the `frontend/src` directory and use Jest with React Testing Library to test React components.

### Prerequisites

Make sure you have installed all the dependencies in the frontend directory:

```bash
cd frontend
npm install
```

### Running Frontend Tests

To run all frontend tests:

```bash
cd frontend
npm test
```

To run a specific test file:

```bash
cd frontend
npm test -- src/components/auth/Login.test.jsx
```

### What's Being Tested

1. **Component Rendering**: Tests that components render correctly
2. **User Interactions**: Tests user inputs like form submissions
3. **API Interactions**: Tests interactions with backend APIs using mocks
4. **Authentication Flow**: Tests login, OTP verification, and error handling

## Writing Additional Tests

### For Backend
- Add new test methods to the `FlaskAppTestCase` class in `test_app.py`
- Each test method should start with `test_`
- Use the Flask test client to make API requests
- Verify responses and database state changes

### For Frontend
- Create new test files with `.test.jsx` extension alongside component files
- Use React Testing Library to render components and interact with them
- Mock external dependencies like API calls
- Test component behavior and state changes

## Best Practices

1. **Isolation**: Each test should be independent of others
2. **Mock External Dependencies**: Use mocks for APIs, databases, etc.
3. **Test Edge Cases**: Test not just the happy path but also error scenarios
4. **Keep Tests Fast**: Avoid unnecessary setup/teardown operations
5. **Test Real User Workflows**: Make tests reflect actual user behavior 