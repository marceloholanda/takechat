# Meta app status and later review

TakeChat uses the separate Meta app `2162666984639710` and the official Instagram API.

## Current internal use

The app is in development mode and Meta App Review has not been approved. Add the Instagram accounts as app testers and have each account accept its invitation. With the app in development mode, only accounts with an app role or tester role can authorize.

Do not describe the app as generally available or approved. Public use requires submitting the applicable Instagram permissions for Advanced Access and receiving Meta's approval.

## Permissions used by this application

- `instagram_business_basic`: identify the Instagram professional account after login.
- `instagram_business_manage_comments`: receive comment events and, when configured, post a public reply.
- `instagram_business_manage_messages`: send the private reply requested by the configured campaign.
- `instagram_business_manage_insights`: read account and media insights shown in the dashboard.

## Review demonstration, when ready

Use an authorized test business and professional Instagram account. Connect it to TakeChat, create a campaign on a recent post with a keyword such as `LINK`, comment from a second test account, then show the private reply and its delivery log. Demonstrate that the app processes only comments on the connected account's own content and does not request an Instagram password.

Do not submit a review until the deployed dashboard, Meta callback, webhook verification, privacy policy, data deletion endpoint, and demonstration flow are reachable and working.
