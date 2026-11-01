# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# ---------------------------------------------------------------------------
# DoorStore release hardening (R8) — keep rules for native libs that rely on
# JNI/reflection. Without these, release builds can crash at runtime even
# though they compile. Verify on a device after every dependency upgrade.
# ---------------------------------------------------------------------------

# React Native + Hermes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }
-dontwarn com.facebook.react.**

# Firebase / Google Play services
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# Notifee (push notification display)
-keep class com.notifee.** { *; }
-dontwarn com.notifee.**

# Reanimated / Worklets / Screens / Gesture Handler (JNI callbacks)
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.worklets.** { *; }
-keep class com.swmansion.rnscreens.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }

# react-native-geolocation-service
-keep class com.agontuk.RNGeolocationService.** { *; }
