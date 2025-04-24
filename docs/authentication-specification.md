# Authentication Specification: AWS Cognito with Google OAuth

## Overview

This document specifies the implementation of user authentication using AWS Cognito with Google OAuth for the Play Later application. The implementation will provide secure authentication without using AWS Amplify, focusing on direct integration with the Cognito service.

## Goals

- Implement secure user authentication using AWS Cognito
- Support Google OAuth for social login
- Implement protected routes using TanStack Router
- Provide a clean, maintainable authentication architecture
- Enable session persistence and token refresh

## Non-Goals

- Using AWS Amplify for authentication
- Implementing additional identity providers beyond Google at this stage
- Building custom UI components for the Cognito Hosted UI

## Architecture

The authentication system will include the following components:

1. Authentication Context - A React context to manage and provide authentication state
2. Auth Services - Service modules to interact with AWS Cognito
3. Authentication Hooks - Custom hooks for components to consume authentication state
4. Protected Routes - TanStack Router integration to protect routes
5. Auth Utilities - Helper functions for token management, validation, etc.

## Technical Requirements

### 1. AWS Cognito Setup Tasks

- [ ] **Task 1.1: Create AWS Cognito User Pool**

  - Create a new User Pool in AWS Cognito
  - Configure appropriate password policies and account recovery options
  - Enable Multi-Factor Authentication (MFA) as optional

- [ ] **Task 1.2: Create App Client**

  - Configure an App Client within the User Pool
  - Enable OAuth 2.0 features
  - Set callback and logout URLs
  - Enable the authorization code grant flow
  - Select appropriate OAuth scopes (openid, email, profile)

- [ ] **Task 1.3: Configure Google as Identity Provider**

  - Create a Google OAuth project in Google Developer Console
  - Configure Google as an identity provider in Cognito
  - Map Google attributes to Cognito attributes

- [ ] **Task 1.4: Configure Hosted UI**
  - Set up the Cognito Hosted UI domain
  - Customize UI elements as needed
  - Test the authentication flow through the hosted UI

### 2. Authentication Context Implementation

- [ ] **Task 2.1: Create Auth Types**

  - Define TypeScript interfaces for auth state
  - Define types for user information and tokens

- [ ] **Task 2.2: Environment Configuration**

  - Define and validate environment variables
  - Create a schema for validation using zod
  - Set up configuration for different environments

- [ ] **Task 2.3: Implement Auth Context**

  - Create an AuthContext with required state and methods
  - Implement AuthProvider component with state management
  - Add methods for login, logout, and token refresh

- [ ] **Task 2.4: Implement Token Management**
  - Add utilities for token storage and retrieval
  - Implement token parsing and validation
  - Add token refresh logic

### 3. Cognito Service Implementation

- [ ] **Task 3.1: Create Base Cognito Service**

  - Add dependencies (amazon-cognito-identity-js, jwt-decode)
  - Initialize Cognito User Pool
  - Implement basic auth operations

- [ ] **Task 3.2: Implement OAuth Flow**

  - Create methods for initiating Google OAuth flow
  - Implement code exchange for tokens
  - Handle OAuth callbacks and errors

- [ ] **Task 3.3: Implement Session Management**

  - Add methods for retrieving the current user
  - Implement session refresh
  - Add logout functionality

- [ ] **Task 3.4: Implement Error Handling**
  - Create consistent error handling mechanisms
  - Add specific error types and messages
  - Implement logging for auth errors

### 4. Authentication Hooks

- [ ] **Task 4.1: Create useAuth Hook**

  - Implement a hook to access the AuthContext
  - Add proper type safety and error handling
  - Add convenience methods for common auth tasks

- [ ] **Task 4.2: Create useProtectedRoute Hook**
  - Implement a hook for route protection
  - Add redirection logic for unauthenticated users
  - Handle loading states during authentication checks

### 5. Route Implementation

- [ ] **Task 5.1: Create Auth Callback Route**

  - Implement `/auth/callback` route
  - Handle the OAuth code from Cognito
  - Process token exchange and set authentication state
  - Implement error handling for failed authentication

- [ ] **Task 5.2: Create Login Route**

  - Implement `/login` route
  - Add login UI with Google sign-in button
  - Handle redirects to the authentication flow
  - Add state management for login in progress

- [ ] **Task 5.3: Update Root Route**

  - Update the root route to include auth context
  - Configure route context with authentication state
  - Set up global auth state management

- [ ] **Task 5.4: Implement Protected Routes**
  - Create protected route mechanism using TanStack Router
  - Implement route guards using beforeLoad hooks
  - Add redirection for unauthenticated access attempts

### 6. Testing and Validation

- [ ] **Task 6.1: Test Authentication Flow**

  - Verify the complete login flow
  - Test token exchange and state management
  - Validate error handling scenarios

- [ ] **Task 6.2: Test Protected Routes**

  - Verify protected route access control
  - Test redirection to login for unauthenticated users
  - Validate access for authenticated users

- [ ] **Task 6.3: Test Token Refresh**
  - Verify token refresh mechanism
  - Test handling of expired tokens
  - Validate session persistence

## File Structure

The authentication implementation will follow this file structure:

```
src/
├── features/
│   └── auth/
│       ├── components/
│       │   └── protected-route.tsx
│       ├── context/
│       │   └── auth-context.tsx
│       ├── hooks/
│       │   ├── use-auth.ts
│       │   └── use-protected-route.ts
│       ├── services/
│       │   └── cognito-service.ts
│       └── utils/
│           ├── token-utils.ts
│           └── auth-types.ts
├── routes/
│   ├── __root.tsx (updated)
│   ├── auth/
│   │   └── callback.tsx
│   ├── login.tsx
│   └── protected.tsx (example)
```

## Dependencies

The following dependencies will be required:

- `amazon-cognito-identity-js`: For AWS Cognito integration
- `jwt-decode`: For decoding and validating JWT tokens

## Environment Variables

The following environment variables need to be configured:

```
VITE_COGNITO_USER_POOL_ID=your-user-pool-id
VITE_COGNITO_CLIENT_ID=your-client-id
VITE_COGNITO_DOMAIN=your-cognito-domain
VITE_COGNITO_REGION=your-cognito-region
VITE_REDIRECT_URI=http://localhost:3000/auth/callback
```

## Implementation Approach

The implementation should be done incrementally:

1. First, set up the AWS Cognito resources
2. Implement the basic authentication service
3. Create the authentication context and provider
4. Implement authentication hooks
5. Set up the callback and login routes
6. Integrate with the root route and implement protected routes
7. Test the complete authentication flow

## Future Enhancements

- Add support for additional identity providers
- Implement role-based access control
- Add custom UI for authentication instead of Cognito Hosted UI
- Implement refresh token rotation for enhanced security
- Add unit and integration tests for authentication components
