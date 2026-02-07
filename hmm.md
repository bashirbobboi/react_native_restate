# Feature: Authentication and Onboarding Flow (Google + Email/Password)

**Reference:** See `docs/PRD.md` section 3 (Authentication & Profiles) and section 4 (User Journeys - New User)

## Overview

This document provides AI-friendly instructions for implementing **TWO** authentication flows that both redirect to a multi-step onboarding:

1. **Google OAuth Sign-In** - User signs in with Google → onboarding
2. **Email/Password Sign-Up** - User creates account with email + password → onboarding

Both flows collect user information (email, username, first name, last name, location, date of birth) and update the user's profile in Supabase.

## Important Implementation Notes

### Out of Scope (Do NOT Implement)
- ❌ **Apple Sign-In** - Not implementing in this phase
- ❌ **Bio field** - Not part of onboarding flow
- ❌ **Email verification** - Skip email confirmation flow for now

### Critical Requirements
- ✅ **Keep existing UI design** - DO NOT modify existing screens' styling or layout
- ✅ **Only modify logic/functionality** - Add new handlers, update data flow
- ✅ **Preserve existing components** - Use existing components like `OnboardingHeader`, form inputs, buttons

## Key Architectural Principles

### 1. Supabase Auto-Creation Pattern

**CRITICAL UNDERSTANDING:** When a user signs in with Google (or any OAuth provider), Supabase automatically:

1. **Creates `auth.users` entry immediately** - Contains Google-provided info (email, name, etc.)
2. **Fires database trigger** - Automatically creates a corresponding `profiles` table entry with:
   - `id` = user's UUID from `auth.users`
   - All other fields = `NULL` (username, first_name, last_name, etc.)
   - `onboarding_completed` = `false`

**This means:** The `profiles` table entry ALREADY EXISTS when onboarding starts. You must **UPDATE** it, never create a new one.

### 2. Profile Update Pattern

**Always use `UPDATE`, never `INSERT`:**

```typescript
// ✅ CORRECT - Update existing profile
await supabase
  .from('profiles')
  .update({ 
    username: 'newusername',
    first_name: 'John',
    last_name: 'Doe'
  })
  .eq('id', user.id)

// ❌ WRONG - Never insert (profile already exists)
await supabase.from('profiles').insert({ ... })
```

## Authentication Flow Comparison

### Flow A: Google OAuth
```
User → Google Sign-In → OAuth → Supabase creates auth + profile → 
/onboarding/email (pre-filled, uneditable) → 
/onboarding/name-username → 
/onboarding/location → 
/onboarding/dob → 
Main App
```

### Flow B: Email/Password
```
User → Continue with Email → /onboarding/email (editable) → 
Enter email + password → Supabase creates auth + profile → 
/onboarding/name-username → 
/onboarding/location → 
/onboarding/dob → 
Main App
```

**Key Difference:** 
- **Google users**: Email is pre-filled from OAuth (uneditable)
- **Email/Password users**: Must enter email + password to create account

## Implementation Steps

### Step 1: Update `app/sign-in.tsx` for Both Flows

#### Current State
- There's a `handleLogin` function for Google OAuth
- There's a "Continue with Email" button that routes to `/onboarding/email`
- After sign-in, it attempts to route based on `computeNextOnboardingRoute()`

#### What Needs to Happen for Both Flows

**A. Google Sign-In Button:**

1. **User clicks Google Sign-In button**
   - Function `handleLogin()` is called (already exists)
   - It calls `signInWithGoogle()` from `lib/auth.ts`

2. **Google OAuth Flow**
   - User is redirected to Google authentication
   - User grants permissions
   - Google redirects back to app with authorization code
   - Supabase exchanges code for session

3. **Immediate Supabase Actions (Automatic)**
   - Supabase creates `auth.users` entry
   - Database trigger creates blank `profiles` entry
   - Session is established

4. **Route to Onboarding**
   - After successful sign-in, route to `/onboarding/email`
   - User will see email pre-filled (from Google)
   - Will continue to name/username screen

**B. Email/Password Button:**

1. **User clicks "Continue with Email" button**
   - Route to `/onboarding/email` (without any session)
   - User enters email + password
   - Calls `supabase.auth.signUp()` to create account
   - Supabase creates `auth.users` + triggers `profiles` creation
   - Routes to `/onboarding/name-username`

#### Code Pattern (Updated `sign-in.tsx`)

```typescript
// Handler for Google OAuth
const handleGoogleLogin = async () => {
  try {
    const session = await signInWithGoogle();
    
    if (!session) {
      return; // User cancelled
    }
    
    // After Google sign-in, route to email screen
    // Email will be auto-detected from session in the email screen
    router.push('/onboarding/email');
  } catch (e) {
    console.error('Google sign-in error', e);
    Alert.alert('Error', 'Sign in failed. Please try again.');
  }
}

// Handler for Email/Password button
const handleEmailButton = () => {
  // Just route to email screen
  // User will enter email + password there
  router.push('/onboarding/email');
}
```

**Update the button handlers:**
```typescript
// Google button
<TouchableOpacity onPress={handleGoogleLogin} ...>

// Email button  
<TouchableOpacity onPress={handleEmailButton} ...>
```

### Step 2: Email Onboarding Screen (`app/onboarding/email.tsx`)

#### Current State
- File already exists with basic email input
- Checks if user came from Google (`providerIsGoogle`)
- Makes email uneditable if from Google

#### Requirements - Handle BOTH Flows

**Detect which flow the user is in:**
- If `session` exists (from Google) → Google flow
- If no `session` → Email/Password flow

**A. Google Flow (session exists):**
1. **Auto-fill email from session**
   - Extract email from `session.user.email` or `session.user.user_metadata.email`
   - Display in `TextInput` with `editable={false}`
   - Show lock icon or "From Google account" indicator

2. **Continue Button**
   - Navigate to `/onboarding/name-username`
   - No signup needed (already authenticated)

**B. Email/Password Flow (no session):**
1. **Email + Password Input**
   - Show editable email `TextInput`
   - Show password `TextInput` (with secure text entry)
   - Show "Confirm Password" `TextInput`
   - Validate email format and password match

2. **Sign Up Button**
   - Call `supabase.auth.signUp({ email, password })`
   - Supabase creates `auth.users` + triggers `profiles` creation
   - After successful signup, navigate to `/onboarding/name-username`
   - Handle errors (email already exists, weak password, etc.)

#### UI Requirements
- **Keep existing UI design and styling** - Only modify logic
- Email should be visible but not editable (for Google users)
- Clear indication this came from Google (existing check is fine)
- "Continue" button to proceed (existing button)
- For Email/Password: Add password fields (see code pattern)

#### Code Pattern

```typescript
import { router } from 'expo-router'
import { useState, useEffect } from 'react'
import { useAuthContext } from '../../hooks/use-auth-context'
import { supabase } from '../../lib/supabase'

export default function OnboardingEmail() {
  const { session } = useAuthContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Detect if user came from Google
  const isGoogleUser = session !== null
  
  // Auto-fill email if from Google
  useEffect(() => {
    if (session?.user) {
      const googleEmail = session.user.email || session.user.user_metadata?.email
      setEmail(googleEmail || '')
    }
  }, [session])
  
  // Handler for Google users (just continue)
  const handleGoogleContinue = () => {
    router.push('/onboarding/name-username')
  }
  
  // Handler for Email/Password signup
  const handleEmailSignUp = async () => {
    // Validation
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      })
      
      if (error) {
        setError(error.message)
        return
      }
      
      // Skip email verification check - auto-confirm is enabled in Supabase
      // Profile is auto-created via trigger
      
      // Success - profile auto-created via trigger
      // Navigate to name/username screen
      router.push('/onboarding/name-username')
    } catch (e: any) {
      setError(e.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }
  
  // Render different UI based on flow
  if (isGoogleUser) {
    // Google Flow: Show email (uneditable) + Continue
    return (
      <View>
        <Text>Your Email</Text>
        <TextInput
          value={email}
          editable={false}
          // Style as disabled
        />
        <Text>From your Google account</Text>
        
        <TouchableOpacity onPress={handleGoogleContinue}>
          <Text>Continue</Text>
        </TouchableOpacity>
      </View>
    )
  }
  
  // Email/Password Flow: Show email + password fields + Sign Up
  return (
    <View>
      <Text>Create Account</Text>
      
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      
      <TextInput
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm Password"
        secureTextEntry
      />
      
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      
      <TouchableOpacity onPress={handleEmailSignUp} disabled={loading}>
        <Text>{loading ? 'Creating Account...' : 'Sign Up'}</Text>
      </TouchableOpacity>
    </View>
  )
}
```

### Step 3: Name & Username Screen (`app/onboarding/name-username.tsx`)

#### Current State
- File already exists with UI, styling, and validation
- Has fields for first_name, last_name, username, avatar upload
- Already pre-fills first_name and last_name from Google if available
- **DO NOT modify UI/styling - only update logic**

#### What Needs to Happen

1. **Pre-fill Logic (Already Mostly Done)**
   - First name: From `session.user.user_metadata.given_name` (already implemented)
   - Last name: From `session.user.user_metadata.family_name` (already implemented)
   - Username: Empty (user must choose)
   - Avatar: Optional upload (already implemented)

2. **Validation (Already Exists)**
   - Username: Must be unique, valid format (already implemented via `isUsernameAvailable`)
   - Names: Valid format (already implemented)
   - Keep existing validation logic

3. **Navigation Update**
   - After saving, route to `/onboarding/location` (instead of completing onboarding)
   - Do NOT set `onboarding_completed` to `true` yet (save for last screen)

#### Code Changes (Minimal - Keep Existing UI)

**Only modify the save/navigation logic:**

```typescript
const handleSave = async () => {
  if (!session?.user) return
  
  // ... existing validation logic (keep as is) ...
  
  // UPDATE profile (not create - it already exists via trigger)
  const { error } = await supabase
    .from('profiles')
    .update({
      username: username.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      avatar_url: uploadedAvatarPath, // If avatar was uploaded
      // DO NOT set onboarding_completed yet
    })
    .eq('id', session.user.id)
  
  if (error) {
    Alert.alert('Error', 'Failed to save profile')
    return
  }
  
  // Navigate to NEXT onboarding screen (location)
  router.push('/onboarding/location')
}
```

**Key Changes:**
- Remove `onboarding_completed: true` (save for last screen)
- Change navigation from main app to `/onboarding/location`
- Keep ALL existing UI, styling, validation

### Step 4: Location Screen (`app/onboarding/location.tsx`)

#### Current State
- Files exist: `location.tsx` and `location-select.tsx`
- Has Nigerian states/cities selection UI
- **DO NOT modify UI/styling**

#### What Needs to Happen

1. **Save Location to Profile**
   - After user selects location, UPDATE profile
   - Store location as string (e.g., "Lagos, Nigeria" or "Abuja, FCT")

2. **Navigation**
   - After saving, route to `/onboarding/dob`
   - Do NOT set `onboarding_completed` yet

#### Code Changes

```typescript
const handleSaveLocation = async () => {
  if (!session?.user) return
  if (!selectedLocation) {
    // Show error
    return
  }
  
  // UPDATE profile with location
  const { error } = await supabase
    .from('profiles')
    .update({
      location: selectedLocation.trim(),
    })
    .eq('id', session.user.id)
  
  if (error) {
    Alert.alert('Error', 'Failed to save location')
    return
  }
  
  // Navigate to DOB screen
  router.push('/onboarding/dob')
}
```

### Step 5: Date of Birth Screen (`app/onboarding/dob.tsx`)

#### Current State
- File exists with date picker UI
- **DO NOT modify UI/styling**

#### What Needs to Happen

1. **Save DOB to Profile**
   - After user selects date of birth, UPDATE profile
   - Store as date string (format: YYYY-MM-DD)

2. **Complete Onboarding**
   - This is the FINAL onboarding screen
   - Set `onboarding_completed: true`
   - Navigate to main app

3. **Age Validation**
   - User must be 16+ years old (from PRD.md)
   - Calculate age and show error if under 16

#### Code Changes

```typescript
const handleSaveDOB = async () => {
  if (!session?.user) return
  if (!selectedDate) {
    Alert.alert('Error', 'Please select your date of birth')
    return
  }
  
  // Validate age (must be 16+)
  const age = calculateAge(selectedDate)
  if (age < 16) {
    Alert.alert('Age Requirement', 'You must be at least 16 years old to use Steeze')
    return
  }
  
  // Format date as YYYY-MM-DD
  const dobString = selectedDate.toISOString().split('T')[0]
  
  // UPDATE profile with DOB and mark onboarding complete
  const { error } = await supabase
    .from('profiles')
    .update({
      dob: dobString,
      onboarding_completed: true, // FINAL STEP - mark complete
    })
    .eq('id', session.user.id)
  
  if (error) {
    Alert.alert('Error', 'Failed to save date of birth')
    return
  }
  
  // Navigate to main app - onboarding complete!
  router.replace('/(root)/(tabs)/index')
}

// Helper function
function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}
```

## Data Flow Diagrams

### Flow A: Google OAuth

```
┌─────────────────────────────────────────────────────────┐
│ 1. User clicks "Continue with Google"                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Google OAuth Flow                                    │
│    - User authenticates with Google                     │
│    - Google redirects with authorization code           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Supabase Auto-Creation (Automatic)                   │
│    ✅ auth.users created (with Google email/name)       │
│    ✅ profiles created (via trigger - all fields NULL)  │
│    ✅ Session established                                │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Route to /onboarding/email                           │
│    - Session exists (Google user)                       │
│    - Email auto-filled from session                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Email Screen (Google Flow)                           │
│    - Display email (uneditable, from Google)            │
│    - User clicks Continue                               │
│    Route: /onboarding/name-username                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Name & Username Screen                               │
│    - Pre-fill first_name, last_name from Google         │
│    - User enters username                               │
│    - Validate username availability                     │
│    - UPDATE profiles table (username, names, avatar)    │
│    Route: /onboarding/location                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 7. Location Screen                                      │
│    - User selects location (state/city)                 │
│    - UPDATE profiles table (location)                   │
│    Route: /onboarding/dob                               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 8. Date of Birth Screen (FINAL)                         │
│    - User selects DOB                                   │
│    - Validate age (16+)                                 │
│    - UPDATE profiles table (dob, onboarding_completed)  │
│    - Route to main app                                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 9. Onboarding Complete!                                 │
│    profiles table now has:                              │
│    - username, first_name, last_name, avatar_url        │
│    - location, dob                                      │
│    - onboarding_completed = true                        │
│    → User enters main app                               │
└─────────────────────────────────────────────────────────┘
```

### Flow B: Email/Password

```
┌─────────────────────────────────────────────────────────┐
│ 1. User clicks "Continue with Email"                    │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Route to /onboarding/email                           │
│    - No session exists                                  │
│    - Shows signup form                                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Email Screen (Email/Password Flow)                   │
│    - User enters email                                  │
│    - User enters password                               │
│    - User confirms password                             │
│    - User clicks "Sign Up"                              │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Supabase Sign Up                                     │
│    Call: supabase.auth.signUp({ email, password })     │
│    ✅ auth.users created                                 │
│    ✅ profiles created (via trigger - all fields NULL)  │
│    ✅ Session established (or email confirmation sent)  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Route to /onboarding/name-username                   │
│    - Account created successfully                       │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Name & Username Screen                               │
│    - First name: empty (user must enter)                │
│    - Last name: empty (user must enter)                 │
│    - User enters username                               │
│    - Validate username availability                     │
│    - UPDATE profiles table (username, names, avatar)    │
│    Route: /onboarding/location                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 7. Location Screen                                      │
│    - User selects location (state/city)                 │
│    - UPDATE profiles table (location)                   │
│    Route: /onboarding/dob                               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 8. Date of Birth Screen (FINAL)                         │
│    - User selects DOB                                   │
│    - Validate age (16+)                                 │
│    - UPDATE profiles table (dob, onboarding_completed)  │
│    - Route to main app                                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 9. Onboarding Complete!                                 │
│    profiles table now has:                              │
│    - username, first_name, last_name, avatar_url        │
│    - location, dob                                      │
│    - onboarding_completed = true                        │
│    → User enters main app                               │
└─────────────────────────────────────────────────────────┘
```

## Database Schema Reference

### `auth.users` (Supabase managed)
- `id` (UUID, primary key)
- `email`
- `user_metadata` (JSON, contains Google profile data)
  - `given_name` (first name from Google)
  - `family_name` (last name from Google)

### `profiles` (Your table - see migration)
- `id` (UUID, foreign key → `auth.users.id`)
- `username` (text, nullable, UNIQUE)
- `first_name` (text, nullable)
- `last_name` (text, nullable)
- `avatar_url` (text, nullable)
- `location` (text, nullable)
- `dob` (date, nullable)
- `onboarding_completed` (boolean, default false)
- ... other fields (bio not used in onboarding)

**Important:** The `profiles` entry is created automatically by a database trigger when a user signs in. The trigger is defined in your migration file.

## Key Functions to Use

### From `lib/auth.ts`
- `signInWithGoogle()` - Initiates Google OAuth flow, returns session

### From `lib/profile.ts`
- `isUsernameAvailable(username)` - Checks if username is available
- `getOrCreateProfileFromAuth()` - Gets profile, but for Google sign-in, profile already exists

### From Supabase Client
- `supabase.from('profiles').update({...}).eq('id', user.id)` - Update profile
- `supabase.auth.getUser()` - Get current authenticated user

## Error Handling

1. **Google Sign-In Cancelled**
   - User closes Google auth popup
   - Return gracefully, show no error

2. **Network Errors**
   - Handle Supabase connection issues
   - Show user-friendly error messages
   - Allow retry

3. **Username Already Taken**
   - Check availability before saving
   - Show clear error message
   - Suggest alternatives if possible

4. **Profile Update Fails**
   - Handle Supabase errors
   - Log error details
   - Show user-friendly message
   - Allow retry

## Testing Checklist

### Google OAuth Flow
- [ ] Google sign-in button works
- [ ] User can complete Google OAuth flow
- [ ] After Google sign-in, user is routed to `/onboarding/email`
- [ ] Email is pre-filled and uneditable (from Google)
- [ ] Email screen shows indication it's from Google
- [ ] Continue button navigates to name/username screen
- [ ] First name and last name are pre-filled from Google (if available)
- [ ] Username field is empty and editable
- [ ] Username validation works (format, availability)
- [ ] Avatar upload works (optional)
- [ ] Profile is updated (not created) when saving
- [ ] After name/username, routes to `/onboarding/location`
- [ ] Location selection works
- [ ] After location, routes to `/onboarding/dob`
- [ ] DOB picker works
- [ ] Age validation works (16+ required)
- [ ] After DOB, `onboarding_completed` flag is set to `true`
- [ ] User is routed to main app

### Email/Password Flow
- [ ] "Continue with Email" button works
- [ ] User is routed to `/onboarding/email` (no session)
- [ ] Email input is editable
- [ ] Password input is secure (hidden text)
- [ ] Confirm password validation works
- [ ] "Sign Up" button calls `supabase.auth.signUp()`
- [ ] Account is created successfully (no email verification)
- [ ] Profile is auto-created via database trigger
- [ ] User is routed to name/username screen
- [ ] First name and last name fields are empty (no Google data)
- [ ] User can enter all fields (names, username, avatar)
- [ ] Username validation works
- [ ] Avatar upload works (optional)
- [ ] Profile is updated when saving
- [ ] After name/username, routes to `/onboarding/location`
- [ ] Location selection works
- [ ] After location, routes to `/onboarding/dob`
- [ ] DOB picker works
- [ ] Age validation works (16+ required)
- [ ] After DOB, `onboarding_completed` flag is set to `true`
- [ ] User is routed to main app

### Error Cases
- [ ] Google OAuth cancelled - handled gracefully
- [ ] Email already exists - shows error message
- [ ] Weak password - shows error message
- [ ] Passwords don't match - shows error message
- [ ] Network errors - handled with retry option
- [ ] Username taken - shows clear error
- [ ] User under 16 years old - shows age requirement error
- [ ] No location selected - shows error
- [ ] No DOB selected - shows error

## References

- **PRD.md**: Section 3 (Authentication & Profiles), Section 4 (User Journeys - New User)
- **Database Migration**: `supabase/migrations/20251031203710_remote_schema.sql` - See trigger that auto-creates profiles
- **Existing Code**:
  - `app/sign-in.tsx` - Sign-in screen
  - `app/onboarding/email.tsx` - Email onboarding (may need modification)
  - `app/onboarding/name-username.tsx` - Name/username onboarding (already has some logic)
  - `lib/auth.ts` - Authentication helpers
  - `lib/profile.ts` - Profile management helpers

## Implementation Checklist

### Required Changes Summary

1. **sign-in.tsx**
   - ✅ Google button already exists
   - ✅ Email button already routes to `/onboarding/email`
   - ✏️ Remove any `computeNextOnboardingRoute()` logic from Google handler
   - ✏️ Just route to `/onboarding/email` after Google sign-in

2. **onboarding/email.tsx**
   - ✏️ Add detection: if session exists → Google flow, else → Email/Password flow
   - ✏️ For Google: keep existing UI (uneditable email), route to `/onboarding/name-username`
   - ✏️ For Email/Password: add password fields, call `supabase.auth.signUp()`, route to `/onboarding/name-username`
   - ❌ NO email verification flow

3. **onboarding/name-username.tsx**
   - ✅ UI and validation already done
   - ✏️ Change navigation: from main app → `/onboarding/location`
   - ✏️ Remove `onboarding_completed: true` from update

4. **onboarding/location.tsx**
   - ✅ UI already exists
   - ✏️ Add save handler: UPDATE profile with location
   - ✏️ Navigate to `/onboarding/dob` after save

5. **onboarding/dob.tsx**
   - ✅ UI already exists
   - ✏️ Add save handler: UPDATE profile with dob
   - ✏️ Add age validation (16+)
   - ✏️ Set `onboarding_completed: true` here (FINAL step)
   - ✏️ Navigate to main app after save

## Notes for AI Implementation

1. **Always UPDATE, never INSERT** - The profile exists via trigger
2. **Keep existing UI/styling** - DO NOT modify any styling or layout
3. **Use `useAuthContext()`** - Get current session to detect Google vs Email/Password
4. **Validate before saving** - Username availability, age check, etc.
5. **Handle loading states** - Show loading indicators during async operations
6. **Progressive updates** - Each screen updates different profile fields
7. **Set onboarding_completed ONLY on DOB screen** - This is the final step
8. **No email verification** - Skip confirmation checks in sign-up flow
9. **Age gate at 16+** - Calculate age from DOB and reject if under 16

