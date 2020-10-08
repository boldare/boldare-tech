---
title: How to use AWS cognito without any library
subTitle: My target language doesn't support any aws' library for cognito, what do it do now?
tags: ["aws", "cognito", "watchos", "apple-watch", "unsupported"]
cover: /img/aws.png
postAuthor: Grzegorz M. (@grzesjam), Maciej Papież (@maciejpapiez)
---

## Issue
There is need to create an app for your service which uses AWS cognito user pool as its authentication server.

Apple Watch, and it's WatchOS or any other device/language don't have any library available to use, what am I doing to do?   

**Simple**, create your own authentication flow using simple https requests.

## Solution

*All the requests are send to `POST https://cognito-idp.[YOUR REGION].amazonaws.com/`*

1. Create `app client` **without** client secret and enable `ALLOW_USER_PASSWORD_AUTH`

1. Set headers to:
    ```text
    X-Amz-Target = AWSCognitoIdentityProviderService.InitiateAuth
    Content-Type = application/x-amz-json-1.1
    ```
   
1. Try to log in by sending:
    ```json
    {
       "AuthFlow": "USER_PASSWORD_AUTH",
       "AuthParameters": { 
          "USERNAME": "[EMAIL ADDRESS]",
          "PASSWORD": "[PASSWORD]"
       },
       "ClientId": "[YOUR CLIENT ID]"
    }
    ```

1. **If its user's first login** you might get response:
    ```json
    {
        "ChallengeName": "NEW_PASSWORD_REQUIRED",
        "ChallengeParameters": {
          "USER_ID_FOR_SRP": "[NAME]",
          "requiredAttributes": "[]",
          "userAttributes": "{\"email_verified\":\"true\",\"email\":\"[EMAIL ADDRESS]\"}"
        },
        "Session": "[VERY LONG SESSION TOKEN]"
    }
    ```
    To set password you need to ask user for it and send request:
    ```json
    {
       "ChallengeName": "NEW_PASSWORD_REQUIRED",
       "ChallengeResponses": { 
          "NEW_PASSWORD": "[NEW USER DEFINED PASSWORD]",
          "USERNAME": "[EMAIL ADDRESS]"
       },
       "ClientId": "[YOUR CLIENT ID]",
       "Session": "[VERY LONG SESSION TOKEN YOU GOT BEFORE]"
    }
   ```
1. Response provides token to get access to your service and refresh token:
    ```json
    {
        "AuthenticationResult": {
          "AccessToken": "[VERY LONG TOKEN]",
          "ExpiresIn": 3600,
          "IdToken": "[ALSO VERY LONG TOKEN]",
          "RefreshToken": "[ANOTHER LONG REFRESH TOKEN]",
          "TokenType": "Bearer"
        },
        "ChallengeParameters": {}
    }
    ```
1. If time for refreshing token comes do it by:
    ```json 
    {
       "AuthFlow": "REFRESH_TOKEN",
       "AuthParameters": { 
        "REFRESH_TOKEN": "[VERY LONG REFRESH TOKEN]"
       },
       "ClientId": "[YOUR CLIENT ID]"
    }
    ```

For more details I recommend visiting [AWS' documentation](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_InitiateAuth.html#API_InitiateAuth_RequestSyntax)

That's all, hope that helps!

## Small tidbits 

#### Why don't we use oauth2? 

Some devices like Apple Watch or Fitbit and most of the other smartwatches can't show webpages, so we are unable to forward user to login page.

#### Why not use oauth2's "password grant"?

`The latest OAuth 2.0 Security Best Current Practice disallows the password grant entirely` [Source](https://oauth.net/2/grant-types/password/)
