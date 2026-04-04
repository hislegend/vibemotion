# Editor Starter의 렌더링

MP4로 비디오를 렌더링하는 것은 AWS Lambda의 분산 렌더러인 [Remotion Lambda](/docs/lambda)를 사용합니다.

## 설정

AWS 계정을 설정하기 위해 [Remotion Lambda 설정 지침](/docs/lambda/setup)을 단계별로 따라하세요.

> **참고**: [애셋 업로드](/docs/editor-starter/asset-uploads)를 이미 설정한 경우, Remotion Lambda 설정 지침의 4단계와 5단계를 건너뛰어야 합니다.
> 새 사용자를 생성하지 말고 이전에 생성한 사용자를 선택하세요.

그 후, `.env` 파일에 다음 값들을 채우세요:

```
REMOTION_AWS_REGION=
REMOTION_AWS_ACCESS_KEY_ID=
REMOTION_AWS_SECRET_ACCESS_KEY=
REMOTION_AWS_BUCKET_NAME=
```

이제 다음을 실행하여 Lambda 함수를 배포하고 사이트를 생성할 수 있습니다:

```ts
bun deploy.ts
```

> **참고**: `'MemorySize' value failed to satisfy constraint: Member must have value less than or equal to 3008` 오류가 발생하면, [`MEM_SIZE_IN_MB`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20MEM_SIZE_IN_MB&type=code) 변수를 더 낮은 값으로 변경하여 Lambda 함수의 메모리 크기를 줄여야 합니다. AWS 무료 티어에 있거나 동시성 제한이 낮아 많은 비디오를 렌더링하는 능력이 제한될 수 있습니다.

또는 빌드 명령을 실행하면 사이트를 빌드하고 S3 버킷에 배포합니다:

```sh
npm run build
```

필요한 AWS 환경 변수가 설정되지 않은 경우, 빌드는 여전히 성공하고 오류를 던지지 않으며 S3로의 배포만 건너뜁니다.

다음의 경우 배포를 다시 실행해야 합니다:

- [상태](/docs/editor-starter/state-management) 구조를 변경할 때 (예: 새 필드나 아이템 추가)
- 비디오가 시각적으로 렌더링되는 방식을 변경할 때
- 새 Remotion 버전으로 업그레이드할 때

인프라가 이미 존재하는 경우 배포 스크립트를 실행해도 아무 작업도 수행하지 않습니다.
따라서 원하는 만큼 자주 실행할 수 있습니다.

## AWS 인프라 자동 배포

기본적으로 Lambda도 배포 파이프라인에서 배포되므로 앱을 배포할 때마다 실행됩니다.
즉, 예를 들어 Vercel에 배포할 때마다 S3의 사이트도 업데이트되고 지정된 구성과 일치하는 Lambda 함수가 없는 경우 생성됩니다.

이렇게 하면 변경할 때마다 배포하는 것을 잊는 것을 방지할 수 있습니다.

배포를 더욱 견고하게 만들기 위해 예를 들어 `VERCEL_ENV` 환경 변수를 기반으로 사이트에 다른 이름을 지정하여 프로덕션 배포와 개발 배포를 분리하는 것을 권장합니다:

```ts
export const SITE_NAME = process.env.VERCEL_ENV === 'production' ? 'remotion-editor-starter' : 'remotion-editor-starter-dev';
```

[프로덕션과 개발 간에 함수 배포를 분리할 필요는 없습니다](/docs/lambda/naming-convention#i-need-to-separate-production-staging-and-development).

## 렌더링

매우 간단합니다: Editor Starter에서 아이템이 선택되지 않은 경우, [인스펙터](/docs/editor-starter/tracks-items-assets#inspectors)(즉, 컴포지션 인스펙터)에 렌더링 버튼이 나타납니다.

렌더를 트리거하기 위해 백엔드 엔드포인트 [`/api/render`](/docs/editor-starter/backend-routes#post-apirender)가 호출됩니다.
트리거되면 [`/api/progress`](/docs/editor-starter/backend-routes#get-apiprogress)를 폴링하여 렌더의 진행 상황을 확인합니다.

렌더가 완료되면 S3 버킷에 업로드되고 공개적으로 사용할 수 있습니다.
개인정보 설정, 출력 형식, 품질 등 다양한 설정을 변경하려면 [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda)에 전달하는 매개변수를 조정하세요.

## 참조

- [Remotion Lambda](/docs/lambda)
- [설정](/docs/editor-starter/setup)
- [애셋 업로드](/docs/editor-starter/asset-uploads)