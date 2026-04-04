# 애셋 업로드

사용자가 이미지, 오디오, 비디오 또는 GIF를 드롭하면, 나중에 클라우드에서 렌더링을 수행할 수 있도록 클라우드 스토리지에 업로드됩니다.
기본적으로 클라우드 스토리지에는 S3가 사용되며, 이는 일부 설정이 필요합니다.

## 설정

- [S3 콘솔](https://us-east-1.console.aws.amazon.com/s3/home?region=us-east-1)을 방문하세요.
- 새 버킷을 생성하세요.
  - "모든 퍼블릭 액세스 차단" 체크박스를 해제하세요.
  - 기본 설정을 변경하고 **ACL 활성화**를 설정하세요 - 이를 하지 않으면 나중에 애셋을 업로드할 때 400 오류가 발생합니다.
- 생성된 버킷 내에서 "권한" 탭으로 이동하고 "CORS" 섹션에 다음 정책을 입력하세요:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```

- AWS 콘솔에서 [IAM -> "Users"](https://us-east-1.console.aws.amazon.com/iam/home?region=us-east-1#/users)로 이동하세요.
  - **[렌더링 설정](/docs/editor-starter/rendering)을 이미 완료한 경우**: 생성한 사용자를 선택하세요.
  - **그렇지 않은 경우**: 모든 설정을 기본값으로 두고 새 사용자를 생성하세요.
- 모든 설정을 기본값으로 두고 새 사용자를 생성하세요.
- "권한 추가 -> 인라인 정책 추가"를 클릭하고 다음 정책을 추가하세요:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Presign",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:PutObjectAcl"],
      "Resource": ["arn:aws:s3:::YOUR_BUCKET_NAME/*"]
    }
  ]
}
```

> **참고**: `YOUR_BUCKET_NAME`을 버킷 이름으로 바꾸는 것을 잊지 마세요.

- "보안 자격 증명"을 클릭하세요.
- "액세스 키 생성"을 클릭하세요. 사용 사례로 "CLI"를 선택하세요.
- 액세스 키와 비밀 액세스 키를 저장하세요.

`.env` 파일에서 이제 다음 변수들을 채우세요:

```txt
REMOTION_AWS_ACCESS_KEY_ID=
REMOTION_AWS_SECRET_ACCESS_KEY=
REMOTION_AWS_REGION=
REMOTION_AWS_BUCKET_NAME=
```

> **참고**: `.env.example` 파일을 `.env`로 이름을 변경하여 템플릿을 얻으세요.

> **참고**: 동일한 환경 변수가 클라우드에서의 [렌더링](/docs/editor-starter/rendering)에도 사용됩니다.

이제 Editor Starter를 재시작하세요.
애셋을 드롭하면 S3 버킷에 업로드되어야 합니다.

## 제한사항

[`MAX_FILE_UPLOAD_SIZE_IN_MB`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20MAX_FILE_UPLOAD_SIZE_IN_MB&type=code) 상수는 업로드할 수 있는 파일의 크기를 제한합니다. 기본적으로 1000MB로 설정되어 있습니다.

## S3 전송 가속화 (권장)

S3에서 애셋을 로드하는 것은 느릴 수 있습니다.
속도를 높이려면 S3 버킷에 대해 전송 가속화를 활성화할 수 있습니다:

- [S3 콘솔](https://us-east-1.console.aws.amazon.com/s3/home?region=us-east-1)로 이동하세요.
- 버킷을 선택하세요.
- "속성" 탭으로 이동하세요.
- "전송 가속화" 섹션으로 스크롤하세요.
- "활성화"를 클릭하세요.
- "저장"을 클릭하세요.

그런 다음 `.env` 파일에서 `REMOTION_AWS_TRANSFER_ACCELERATION` 환경 변수를 `true`로 설정하세요.

## 참조

- [트랙, 아이템 및 애셋](/docs/editor-starter/tracks-items-assets)
- [애셋 정리](/docs/editor-starter/asset-cleanup)