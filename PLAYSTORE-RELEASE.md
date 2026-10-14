# DoorStore — Play Store Release Readiness

Build: `android/app/build/outputs/bundle/release/app-release.aab` (27 MB)
Package: `com.doorstore.pk` · versionCode `1` · versionName `1.0`

Secrets (keystore passwords, fingerprints) live in **`RELEASE-CREDENTIALS.txt`**, which is
gitignored. This document is safe to commit.

---

## 0. BLOCKER: register the new package in Firebase before shipping ⚠️

The Android application id changed from `com.doorstore` to `com.doorstore.pk`. Firebase
ties every Android app to an exact package name + signing-certificate fingerprint, and the
app uses Firebase Auth for phone/OTP login. The build succeeds, but at runtime login fails
until the new package is registered.

In the Firebase console (`doorstore-47ff3`): **Project settings → Add app → Android**, then:

| Field | Value |
|---|---|
| Android package name | `com.doorstore.pk` |
| SHA-1 (release / upload key) | `44:7F:C5:93:1E:78:D3:ED:F4:BF:C2:24:75:0D:CD:92:CD:C8:5C:5E` |
| SHA-1 (debug keystore, for local testing) | `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` |

Then download the new `google-services.json` and replace `android/app/google-services.json`.
The locally patched copy only changes `package_name`; its `mobilesdk_app_id` still belongs to
the old `com.doorstore` registration, which is why login would fail.

If Play App Signing is enabled, also add the **app signing** SHA-1 that Play shows under
Release → Setup → App signing (it differs from the upload key).

---

## 1. Verified in the build — done ✅

| Check | Result |
|---|---|
| AAB signed with a real upload key (not the debug key) | ✅ cert SHA-256 `037ec518…cbab1a` |
| AAB signature verifies | ✅ `keytool -printcert -jarfile` |
| APK signature verifies | ✅ `apksigner` — v2 scheme |
| `android:debuggable` absent from release manifest | ✅ |
| `targetSdk` meets the current Play requirement | ✅ 36 |
| `minSdk` sane for RN 0.86 | ✅ 24 |
| `usesCleartextTraffic` disabled in release | ✅ `false` |
| `allowBackup` disabled | ✅ |
| No JVM/JS crash on the release variant | ✅ `BUILD SUCCESSFUL` |
| 64-bit native libs present | ✅ arm64-v8a |
| Debug symbols shipped for deobfuscating crashes | ✅ `BUNDLE-METADATA/…debugsymbols` |
| TypeScript | ✅ `npx tsc --noEmit` → 0 errors |
| Secrets not committed | ✅ keystore + `keystore.properties` gitignored |

Release signing is wired through `android/keystore.properties`, so `./gradlew bundleRelease`
always signs with the real upload key and **falls back to the debug keystore only with a
warning** when that file is absent (such an artifact is rejected by Play).

---

## 2. Must be done in Play Console before the app can go live ⚠️

These are console-side tasks — nothing in the code blocks them.

1. **Enroll in Play App Signing.** Upload the AAB and let Google hold the *app signing*
   key; our keystore becomes the *upload* key. This makes a lost upload key recoverable
   and is strongly recommended.
2. **Privacy policy URL** — mandatory, because the app requests location. It must state
   what is collected (location, name, phone, order data) and how it is used.
3. **Data safety form** — declare location, personal info, and that data is not sold.
4. **Location permission declaration** — `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION`
   are in the manifest, so Play requires the "foreground location" declaration. If the
   location is only for delivery address entry, say so explicitly, otherwise the release
   gets rejected.
5. **Store listing assets** — 512×512 icon, 1024×500 feature graphic, phone screenshots.
6. **Confirm the package name `com.doorstore.pk` is still free.** Package names are global and
   permanent across Play. If it is taken, the ID must change and the AAB must be rebuilt —
   check this before creating the listing.

---

## 3. Quality items that are not blockers, but you should decide on ⚠️

- **The launcher icon is still the default React Native icon.** The store-listing icon is
  uploaded separately, but the on-device icon would look unfinished. Worth replacing before
  a public launch.
- **`arm64-v8a` only.** `reactNativeArchitectures` in `android/gradle.properties` excludes
  32-bit ARM, so the app will not install on older 32-bit-only devices. Play will report
  reduced device coverage. Adding `armeabi-v7a` costs nothing per-device in an AAB.
- **`enableProguardInReleaseBuilds = false`.** R8 is off; enabling it would cut the ~23 MB
  of dex substantially, but it needs a full regression pass first.
- **`versionCode` must increase on every upload.** Currently `1`; bump it in
  `android/app/build.gradle` before each new release.
- **ESLint reports 30 errors / 147 warnings** (mostly unused imports and
  `react-hooks/exhaustive-deps`, plus inline-style warnings). Not part of the Android build,
  but worth cleaning up.
- **`npm test` does not run.** Jest is configured with `preset: '@react-native/jest-preset'`
  but that package is not installed, and plain `npm install` fails on a pre-existing peer
  conflict (`react-native-print` → `react-native-windows` wants `react-native@0.84.1`).
  Needs `@react-native/jest-preset@0.86.0` added as a devDependency, and a decision on the
  peer-conflict strategy.
- **`.env` is committed** with `SUPABASE_URL` / `SUPABASE_ANON_KEY`. The anon key is designed
  to be public and is protected by Row Level Security, so this is low risk — but confirm RLS
  is actually enabled on every table, since the key is now public.

---

## 4. Rebuilding

```bash
cd android
./gradlew bundleRelease     # -> app/build/outputs/bundle/release/app-release.aab
./gradlew assembleRelease   # -> app/build/outputs/apk/release/app-release.apk
```

> Note: the previous test APKs were signed with the **debug** key, so the new release-signed
> APK will not install over an existing install — uninstall the old one first.

### If you ever change `applicationId` again

`./gradlew clean` does **not** clean the root project's build folder, and React Native's
settings plugin caches `android/build/generated/autolinking/autolinking.json`. That cache is
only rebuilt when it is missing, when a lockfile changes, or when it has no `packageName` —
so after a package rename the stale `packageName`/`applicationId` silently flows into the
generated `ReactNativeApplicationEntryPoint.java` and the build fails with
`cannot find symbol: class BuildConfig`.

Always pair a package rename with:

```bash
rm -rf android/build/generated/autolinking
./gradlew bundleRelease assembleRelease
```
