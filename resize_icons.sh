#!/bin/bash
LOGO="/Users/tanveerpatel/.gemini/antigravity-ide/brain/4df05b42-b678-491f-8d43-38156a8ca627/trick_royale_logo_1781242631716.png"

sips -s format png -z 48 48 "$LOGO" --out android/app/src/main/res/mipmap-mdpi/ic_launcher.png
sips -s format png -z 48 48 "$LOGO" --out android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
sips -s format png -z 72 72 "$LOGO" --out android/app/src/main/res/mipmap-hdpi/ic_launcher.png
sips -s format png -z 72 72 "$LOGO" --out android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
sips -s format png -z 96 96 "$LOGO" --out android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
sips -s format png -z 96 96 "$LOGO" --out android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
sips -s format png -z 144 144 "$LOGO" --out android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
sips -s format png -z 144 144 "$LOGO" --out android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
sips -s format png -z 192 192 "$LOGO" --out android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
sips -s format png -z 192 192 "$LOGO" --out android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png

IOS_DIR="ios/MyApp/Images.xcassets/AppIcon.appiconset"
sips -s format png -z 40 40 "$LOGO" --out "$IOS_DIR/icon-20@2x.png"
sips -s format png -z 60 60 "$LOGO" --out "$IOS_DIR/icon-20@3x.png"
sips -s format png -z 58 58 "$LOGO" --out "$IOS_DIR/icon-29@2x.png"
sips -s format png -z 87 87 "$LOGO" --out "$IOS_DIR/icon-29@3x.png"
sips -s format png -z 80 80 "$LOGO" --out "$IOS_DIR/icon-40@2x.png"
sips -s format png -z 120 120 "$LOGO" --out "$IOS_DIR/icon-40@3x.png"
sips -s format png -z 120 120 "$LOGO" --out "$IOS_DIR/icon-60@2x.png"
sips -s format png -z 180 180 "$LOGO" --out "$IOS_DIR/icon-60@3x.png"
sips -s format png -z 1024 1024 "$LOGO" --out "$IOS_DIR/icon-1024.png"
