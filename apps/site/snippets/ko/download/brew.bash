# Homebrew 다운로드 및 설치:
curl -o- https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh | bash

# Node.js 다운로드 및 설치:
brew install node@${props.release.major}

# Node.js 버전 확인:
node -v # "${props.release.versionWithPrefix}"가 출력되어야 합니다.
