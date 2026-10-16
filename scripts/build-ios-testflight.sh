#!/bin/bash
# Usage: ./scripts/build-ios-testflight.sh [export|upload]
# Increase CURRENT_PROJECT_VERSION in the Xcode project before each new upload.
set -euo pipefail

task_root="$(cd "$(dirname "$0")/.." && pwd)"
task_destination="${1:-export}"
case "$task_destination" in
  export|upload) ;;
  *) echo "Usage: $0 [export|upload]" >&2; exit 2 ;;
esac

cd "$task_root"
task_output="$task_root/build/ios-testflight/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$task_output"

# Native apps load bundled files; rebuilding and syncing is required for every release.
npm run build
npx cap sync ios
cmp index.html ios/App/App/public/index.html

cp ios/ExportOptions-TestFlight.plist "$task_output/ExportOptions.plist"
/usr/libexec/PlistBuddy -c "Set :destination $task_destination" "$task_output/ExportOptions.plist"
/usr/libexec/PlistBuddy -c "Add :manageAppVersionAndBuildNumber bool false" "$task_output/ExportOptions.plist"

xcodebuild -project ios/App/App.xcodeproj -scheme App \
  -configuration Release -destination 'generic/platform=iOS' \
  -archivePath "$task_output/App.xcarchive" -allowProvisioningUpdates archive

xcodebuild -exportArchive -archivePath "$task_output/App.xcarchive" \
  -exportPath "$task_output/export" \
  -exportOptionsPlist "$task_output/ExportOptions.plist" -allowProvisioningUpdates

echo "TestFlight $task_destination completed: $task_output"
