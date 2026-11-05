# Validation

Last checked: November 5, 2026.

## Automated checks

```sh
npm run check:versions
npm run typecheck
npm test
npm run build:ios
npm run bundle:android
```

| Check | Result |
| --- | --- |
| Jolt manifest, lockfile, override, and installed version match `0.1.0-rc.11` | Pass |
| Strict Vue / TypeScript check | Pass |
| Six navigation, layout, and card trajectory tests | Pass |
| Signed iOS simulator build | Pass |
| Android JavaScript bundle | Pass |
| Android resources compiled with `aapt2` | Pass |
| Android native APK | Not verified; the Gradle distribution download failed in the build environment |

## iOS simulator checks

The app was exercised on iPhone 17 with iOS 26.2. The layout was also checked on iPhone SE (3rd generation).

- The native launch emblem transitions into the animated splash and first page.
- All three pages display their headings, artwork, copy, and controls.
- Cards exit below the horizon and launch upward into their next arrangement.
- The white text highlight travels left to right, including between pages with the same title.
- Next, Replay, page indicators, and swipes navigate correctly. Rapid taps do not queue transitions.
- The active indicator fills over four seconds and advances the carousel.
- Pause holds both the page and indicator. Manual navigation preserves the paused state.
- Backgrounding freezes the countdown. Returning resumes the remaining interval.
- With Reduce Motion enabled before launch, the entrance uses a short fade, the artwork stays still, and autoplay starts paused.
- The accessibility tree exposes the three page controls, Pause / Resume, and Next / Replay.
- Application logs contained no Vue warnings or JavaScript errors during the final checks.

Screenshots in `docs/screenshots/` come from the running iPhone 17 simulator. The SE simulator's accessibility service was unavailable during the latest pass, so the new interaction checks were performed on iPhone 17.

## Build notes and remaining coverage

For a direct simulator build with `xcodebuild`, keep local signing enabled: `CODE_SIGNING_ALLOWED=YES CODE_SIGN_IDENTITY=-`. An unsigned build made SpringBoard reject the launch storyboard with resource-validation error `-67056`, producing a black screen before the app opened.

Android native rendering, touch interaction, and physical-device performance still need device testing. The blur fallback on pre-iOS-26 runtimes has not been exercised. The composition targets portrait phones; tablet and landscape layouts are outside the current scope.
