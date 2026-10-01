# Karma for iPhone

This is a native SwiftUI starter app for iPhone (iOS 17 or later, including
iPhone 17 Pro Max). It provides an in-app Safari view for ChatGPT's official
website, an optional OpenClaw web address, and a clearly disabled Lark
integration state. It does **not** claim to connect to ChatGPT's API,
OpenClaw's service API, AnyCross, or Lark without separately provisioned
services.

## Build on a Mac

Install Xcode with an iOS simulator and [XcodeGen](https://github.com/yonaskolb/XcodeGen).
From `packages/ios` run:

```sh
xcodegen generate
xcodebuild -project Karma.xcodeproj -scheme Karma -destination 'generic/platform=iOS Simulator' build
```

Open `Karma.xcodeproj` in Xcode, choose an available iPhone simulator (iPhone
17 Pro Max if installed), and Run. To install on a physical phone or
distribute the app, replace `com.example.karma` in `project.yml` with an
owned bundle identifier, regenerate the project, and configure an Apple
Developer signing team. An iOS build cannot be verified on Linux.

The shared HTTPS address validation is tested with `swift test` in this
directory. No third-party app dependencies or credentials are required to
build the starter app.

## Before requesting Lark access

The Lark screen intentionally has no Connect button until a secure
integration is available. Agree on the following with the Lark and AnyCross
administrators:

1. Identify the Lark tenant, the approved app, and the minimum read/write
   permissions actually needed. Obtain administrator consent through Lark.
2. Establish a server-side AnyCross connection to Lark, with a documented
   authentication flow, redirect URLs, permitted operations, and data
   retention rules. Keep client secrets and workflow credentials on the
   server, never in this app or its web address.
3. Provide an authenticated mobile-facing HTTPS API and a test environment.
   Specify request/response contracts, account linking, error handling, and
   how users revoke access. Only then add the iOS sign-in and Lark actions.

OpenClaw currently opens a user-supplied HTTPS **web page**, not an OpenClaw
API. Configure its website under Settings without query parameters or
credentials. ChatGPT signs in through the official website in Safari; no
OpenAI API key is stored in this app. The existing `packages/studio` assistant
OpenClaw plugin provides planning metadata, not a mobile connection.
