# Editor Starter 의존성

Editor Starter는 React 19와 Remotion으로 구축되었습니다.
참조 구현체는 React Router v7으로 만들어졌으며, 다른 프레임워크로 쉽게 이식할 수 있도록 설계되었습니다.
스타일링에는 Tailwind CSS v4가 사용됩니다.

## 자막 처리
자막 생성에는 OpenAI의 Audio API가 사용됩니다.
자막 기능은 선택 사항이지만 기본적으로 활성화되어 있으며, 사용하려면 OpenAI API 키가 필요합니다.

## 애셋 업로드
애셋은 기본적으로 AWS S3에 업로드됩니다.
즉, 애셋 업로드 기능이 작동하려면 AWS 계정이 필요하고 AWS S3 설정이 완료되어야 합니다.

## 렌더링
렌더링에는 Remotion Lambda가 사용됩니다.
즉, 렌더링 기능이 작동하려면 AWS 계정이 필요하고 AWS Lambda 설정이 완료되어야 합니다.

## Google Fonts
폰트는 Google Fonts에서 로드됩니다. 이를 위한 API 키는 필요하지 않습니다.

## NPM 패키지
Editor Starter에서 사용되는 NPM 패키지는 다음과 같습니다:
```
{
"@aws-sdk/s3-request-presigner": "^3.787.0",
"@radix-ui/react-context-menu": "^2.2.15",
"@radix-ui/react-popover": "^1.1.14",
"@radix-ui/react-select": "^2.2.5",
"sonner": "^2.0.7",
"@remotion/captions": "^4.0.331",
"@remotion/cli": "^4.0.331",
"@remotion/gif": "^4.0.331",
"@remotion/google-fonts": "^4.0.331",
"@remotion/lambda": "^4.0.331",
"@remotion/layout-utils": "^4.0.331",
"@remotion/media-parser": "^4.0.331",
"@remotion/openai-whisper": "^4.0.331",
"@remotion/player": "^4.0.331",
"@remotion/shapes": "^4.0.331",
"@tanstack/react-virtual": "^3.13.10",
"remotion": "^4.0.331",
"openai": "^4.67.3",
"zod": "^3.24.3"
}
```

항상 최신 버전의 Remotion 패키지를 사용하는 것이 권장됩니다. 현재 최신 버전은 4.0.344입니다.

최신 버전으로 업그레이드하려면 다음 명령어를 실행하세요:
```bash
npx remotion upgrade
pnpx remotion upgrade
```
