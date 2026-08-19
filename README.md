# Wedding invitation and RSVP

An elegant, mobile-first wedding website with private household invitations, per-guest RSVPs and a Cognito-protected administration area. The application is a React/TypeScript SPA hosted by AWS Amplify, with its backend defined entirely in Amplify Gen 2 TypeScript.

> All names, dates, addresses, telephone numbers and images in the repository are placeholders. Change `src/config/wedding.ts` before publishing real invitations.

## Architecture

| Layer          | AWS service                           | Purpose                                                             |
| -------------- | ------------------------------------- | ------------------------------------------------------------------- |
| Hosting        | Amplify Hosting + CloudFront          | Builds from GitHub, deploys the SPA and provides HTTPS              |
| Authentication | Amazon Cognito through Amplify Auth   | Email/password access for the small `ADMINS` group                  |
| API            | AWS AppSync through Amplify Data      | Typed admin CRUD plus two tightly scoped public RSVP operations     |
| Persistence    | Amazon DynamoDB through Amplify Data  | Invitations, guests and RSVP records                                |
| Server logic   | AWS Lambda through Amplify Functions  | Code validation, invitation lookup, RSVP writes and link generation |
| Secrets        | Amplify secrets / AWS Systems Manager | HMAC pepper used to hash invitation codes                           |

There are no servers, containers, relational databases, NAT gateways or always-on resources. Wedding photographs are static assets in the initial design, and email is intentionally deferred.

### Invitation security

The admin action generates 32 random bytes with Node's cryptographic RNG and returns a URL-safe code once. Only an HMAC-SHA-256 digest is stored. The pepper is an Amplify secret and is never sent to the browser. Generating a replacement link invalidates the old one.

Guests do not receive direct model access. Public AppSync operations call the `guest-rsvp` Lambda, which validates the code, resolves exactly one invitation and verifies every submitted guest ID belongs to that invitation. Data models remain restricted to Cognito users in `ADMINS`. The browser removes the code from the address bar after loading and uses session storage for same-tab refreshes. Do not log RSVP URLs or include analytics that capture query strings.

The public AppSync API key is an application identifier, not an authorization secret. Access to private records still depends on a valid high-entropy invitation code. The key expires after 365 days; deploy or rotate it so it remains valid through the RSVP period.

## Project structure

```text
amplify/
  auth/                 Cognito and admin group
  data/                 DynamoDB models and AppSync operations
  functions/            Guest RSVP and admin link Lambdas
  shared/               Cryptographic invitation-code logic
src/
  components/           Shared public UI
  config/               Central wedding content
  pages/                Public routes, RSVP and admin dashboard
  services/             Amplify client access
  test/                 Focused unit and component tests
  types/ validation/ utils/
scripts/seed-demo.ts     Development-only fictional invitations
```

## Local development

### Prerequisites

- Node.js 20 or 22 LTS and npm
- An AWS account with permission to deploy Amplify Gen 2 resources
- AWS CLI v2 configured for the London region

Use AWS IAM Identity Center (SSO) rather than permanent access keys where possible:

```bash
aws configure sso
aws sso login --profile wedding-dev
export AWS_PROFILE=wedding-dev
export AWS_REGION=eu-west-2
export AWS_DEFAULT_REGION=eu-west-2
```

Install and start the frontend:

```bash
npm ci
npm run dev
```

In a second terminal, start a personal cloud sandbox. This creates isolated development resources in the active AWS profile's region and writes `amplify_outputs.json`:

```bash
export AWS_PROFILE=wedding-dev
export AWS_REGION=eu-west-2
npx ampx sandbox secret set INVITE_CODE_PEPPER
npm run sandbox
```

Use a long, randomly generated value for `INVITE_CODE_PEPPER`. Never put it in `.env`, source control, client code or logs. Keep the sandbox running while developing.

Quality checks:

```bash
npm test
npm run lint
npm run format:check
npm run build
```

To remove your development sandbox:

```bash
npm run sandbox:delete
```

## Initial administrator

The backend creates the Cognito `ADMINS` group but deliberately does not create a shared default password. After the first sandbox or production deployment:

1. Open the deployed backend in the Amplify console.
2. Open **Authentication → User management**.
3. Create the administrator using a private email address.
4. Add that user to the `ADMINS` group.
5. Sign in at `/admin` and complete any forced password change.

The same operation can be scripted with `aws cognito-idp admin-create-user` and `admin-add-user-to-group`, but the generated user-pool ID differs by environment.

## Fictional development data

After creating a sandbox admin, the seed command signs in as that admin and creates only fictional invitations for Sherlock Holmes, John Watson, Elizabeth Bennet and Fitzwilliam Darcy:

```bash
SEED_ADMIN_EMAIL='you@example.com' \
SEED_ADMIN_PASSWORD='your-temporary-local-value' \
VITE_SITE_URL='http://localhost:5173' \
npm run seed
```

Run this against development only. The script is never called by the Amplify production build.

## Production deployment from GitHub

1. Sign in to AWS and switch to **Europe (London) – `eu-west-2`**.
2. Open **AWS Amplify → Create new app** and choose GitHub.
3. Install/authorise the AWS Amplify GitHub App for this repository.
4. Select the repository and `main` branch.
5. Amplify should detect `amplify.yml`; keep the application region as London.
6. Add the `INVITE_CODE_PEPPER` secret for the production branch. Use a separate random value from development and retain it securely—changing it invalidates all existing invitation links.
7. Save and deploy. The backend phase runs `ampx pipeline-deploy`; the frontend phase runs the tested Vite build.
8. Create the initial admin and add them to `ADMINS` as described above.
9. Add your custom domain under **Hosting → Custom domains**. Follow Amplify's DNS instructions if DNS is hosted elsewhere.
10. Wait for the Amplify-managed certificate to show as available, then verify HTTPS and the redirect to HTTPS.
11. Create a fictional production invitation, open its private link in a signed-out browser, submit an RSVP, revisit it, and verify the admin dashboard and CSV export.

Future pushes to `main` automatically deploy frontend and backend changes. Pull-request web previews should use a separate backend branch/environment so test data cannot touch production.

### AWS resources and region notes

Amplify Data, Lambda, DynamoDB, Cognito and the Amplify application are created in `eu-west-2` when deployment runs from the London region. IAM is global. Amplify Hosting uses CloudFront's global edge network and its certificate/DNS integrations may appear as global resources; this is expected.

Your AWS identity needs permission to use Amplify, CloudFormation/CDK, AppSync, DynamoDB, Lambda, Cognito, IAM roles, CloudWatch Logs and Systems Manager parameters. For a personal account, begin with Amplify's documented deployment policy, deploy, then narrow permissions once the generated resource set is known.

## Day-to-day data management

- Create a household from `/admin`, add its guests, then choose **Generate & copy link**.
- A link is displayed only when generated. Save it in your invitation workflow. Generating another link rotates the code and invalidates the previous link.
- Use attendance filters to find attending, declined or awaiting guests.
- Administrators can correct attendance from the guest table and reopen an invitation after the deadline.
- **Export CSV** downloads invitation, guest, attendance, dietary, allergy, plus-one, song and message fields for Excel or Google Sheets.

For a pre-wedding backup, export the CSV and store it in an encrypted drive with restricted access. For a full technical backup, enable DynamoDB point-in-time recovery with a small CDK override or create on-demand DynamoDB backups in the AWS console; the CSV is usually sufficient at this scale.

## Configuration and design

All public copy, dates, venue details, map destination, accommodation and schedule entries live in `src/config/wedding.ts`. Replace the remote placeholder hero image with an optimised local WebP/AVIF in `public/images` before launch. Keep the original aspect ratio, include meaningful alt text and target roughly 200–350 KB for the main image.

The public pages and admin area share accessible typography and colours but have distinct editorial and operational layouts. Keyboard focus is visible, form fields have labels, responsive layouts work from 320 px upward, and animation is disabled for `prefers-reduced-motion`.

## Deliberate MVP trade-offs

- **Static images, not S3:** lower complexity and cost for a handful of photographs.
- **No email yet:** invitation, reminder and confirmation emails can later be added with SES behind a Lambda without changing the data model.
- **One-time readable invite code:** avoids storing recoverable plaintext. Rotating is safer than retrieving.
- **AppSync API key for the two public operations:** simple for guests; the Lambda and random code provide record-level security. Set an operational reminder for its expiry.
- **Client-side CSV:** avoids another Lambda and is appropriate for a small guest list.

## Teardown after the wedding

1. Export the final RSVP CSV and any DynamoDB backup you wish to retain.
2. Remove the custom domain from Amplify and remove obsolete DNS records.
3. Delete preview branches and sandbox environments.
4. In the Amplify console, delete the production app and confirm deletion of its backend resources.
5. Check CloudFormation in `eu-west-2` for any retained Amplify stacks.
6. Check DynamoDB, Cognito, Lambda, AppSync, CloudWatch Logs and Systems Manager in `eu-west-2` for intentionally retained resources.
7. Review AWS Cost Explorer the following week to confirm charges have stopped.

## Manual AWS actions

The only expected console actions are authorising the Amplify GitHub App, selecting the London region and branch, supplying the production secret, creating the first admin, and configuring the custom domain. Invitations, tables, APIs, Lambda functions, Cognito resources and permissions are infrastructure as code.
